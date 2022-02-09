import * as core from '@actions/core'
import {ActionErrorOutput, ActionSuccessfulOutput, GqlResponse} from './types'
import fetch from 'node-fetch'

const versions = ['current', 'pending'] as const
type Version = typeof versions[number]

async function run(): Promise<void> {
  try {
    const subgraphName = core.getInput('subgraph', {required: true})
    const version = core.getInput('version') || 'current'
    const failOnError = JSON.parse(core.getInput('fail_on_error') || 'true')

    assertVersion(version)
    assertFailOnError(failOnError)

    const response = await fetchSubgraphMetrics(subgraphName, version)

    if ('errors' in response) {
      const output: ActionErrorOutput = {
        hasError: true,
        errorCode: 'GRAPHQL_ERROR',
        message: response.errors.map(e => e.message)
      }
      failOnError ? setFailedOutput(output) : setOutputs(output)
      return
    }

    const {fatalError, chains} = response.data[getGqlQueryName(version)]
    const hasIndexingError = !!fatalError

    if (hasIndexingError) {
      const output: ActionErrorOutput = {
        hasError: true,
        errorCode: 'SUBGRAPH_FATAL_ERROR',
        message: fatalError.message
      }
      failOnError ? setFailedOutput(output) : setOutputs(output)
      return
    }

    const output: ActionSuccessfulOutput = {
      hasError: false,
      chainHeadBlock: chains[0].chainHeadBlock?.number || null,
      latestBlock: chains[0].latestBlock?.number || null
    }
    setOutputs(output)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()

function setOutputs(output: Record<string, unknown>): void {
  for (const entry of Object.entries(output)) {
    const [key, value] = entry
    core.setOutput(key, value)
  }
}

function setFailedOutput(output: ActionErrorOutput): void {
  core.setFailed(`${output.errorCode}: ${output.message}`)
}

function assertVersion(version: string): asserts version is Version {
  if (!versions.includes(version as Version)) {
    throw new Error(
      `Invalid input argument "version". Supported values: ${versions.join(
        ', '
      )}.`
    )
  }
}

function assertFailOnError(value: unknown): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new Error(
      `Invalid input argument "fail_on_error". Supported values: true or false.`
    )
  }
}

function getGqlQueryName(
  version: Version
): 'indexingStatusForCurrentVersion' | 'indexingStatusForPendingVersion' {
  return (
    {
      current: 'indexingStatusForCurrentVersion',
      pending: 'indexingStatusForPendingVersion'
    } as const
  )[version]
}

async function fetchSubgraphMetrics(
  subgraphName: string,
  version: Version
): Promise<GqlResponse> {
  const queryName = getGqlQueryName(version)

  /* eslint-disable no-useless-escape */
  const query = `query Get {
  ${queryName}(subgraphName: \"${subgraphName}\") {
    synced
    health
    fatalError {
      message
      block {
        number
        hash
      }
      handler
    }
    chains {
      chainHeadBlock {
        number
      }
      latestBlock {
        number
      }
    }
  }
}`
  /* eslint-enable no-useless-escape */

  const body = JSON.stringify({
    operationName: 'Get',
    variables: {},
    query
  })

  const response = await fetch('https://api.thegraph.com/index-node/graphql', {
    headers: {
      'content-type': 'application/json'
    },
    body,
    method: 'POST'
  })

  const data = (await response.json()) as GqlResponse

  return data
}
