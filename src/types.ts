export type ActionOutput = ActionSuccessfulOutput | ActionErrorOutput

export type ActionSuccessfulOutput = {
  hasError: false
  chainHeadBlock: Scalars['BigInt'] | null
  latestBlock: Scalars['BigInt'] | null
}

export type ActionErrorOutput = {
  hasError: true
  errorCode: 'GRAPHQL_ERROR' | 'SUBGRAPH_FATAL_ERROR'
  message: string | string[]
}

export type GqlResponse = GqlSuccessfulResponse | GqlErrorResponse

type GqlSuccessfulResponse = {
  data: Record<
    'indexingStatusForCurrentVersion' | 'indexingStatusForPendingVersion',
    {
      synced: Scalars['Boolean']
      health: Health
      fatalError?: Maybe<{
        block?: Maybe<Block>
        handler?: Maybe<Scalars['String']>
        message: Scalars['String']
      }>
      chains: {
        chainHeadBlock?: Maybe<{
          number: Scalars['BigInt']
        }>
        latestBlock?: Maybe<{
          number: Scalars['BigInt']
        }>
      }[]
    }
  >
}

type GqlErrorResponse = {
  errors: {
    message: string
  }[]
}

/**** FULL GRAPHQL TYPES ****/

export type Maybe<T> = T | null

export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  BigInt: string
  Bytes: string
}

export type SubgraphIndexingStatus = {
  chains: ChainIndexingStatus[]
  entityCount: Scalars['BigInt']
  /** If the subgraph has failed, this is the error caused it */
  fatalError?: Maybe<SubgraphError>
  health: Health
  node?: Maybe<Scalars['String']>
  /** Sorted from first to last, limited to first 1000 */
  nonFatalErrors: SubgraphError[]
  subgraph: Scalars['String']
  synced: Scalars['Boolean']
}

export type ChainIndexingStatus = {
  chainHeadBlock?: Maybe<Block>
  earliestBlock?: Maybe<Block>
  lastHealthyBlock?: Maybe<Block>
  latestBlock?: Maybe<Block>
  network: Scalars['String']
}

export type SubgraphError = {
  block?: Maybe<Block>
  deterministic: Scalars['Boolean']
  handler?: Maybe<Scalars['String']>
  message: Scalars['String']
}

export type Block = {
  hash: Scalars['Bytes']
  number: Scalars['BigInt']
}

// eslint-disable-next-line no-shadow
export enum Health {
  /** Subgraph halted due to errors */
  Failed = 'failed',
  /** Subgraph syncing normally */
  Healthy = 'healthy',
  /** Subgraph syncing but with errors */
  Unhealthy = 'unhealthy'
}
