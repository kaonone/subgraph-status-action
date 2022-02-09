# GitHub Status Action

Use this action for getting status of subgraph indexing.

## Action arguments

* `subgraph: string` – subgraph name for check. Required
* `version: "current" | "pending"` – subgraph version for check. Optional, default value is `"pending"`
* `fail_on_error: boolean` – fails your workflow if the subgraph has indexing errors. Optional, default value is `false`

## Basic usage

```yaml
jobs:
  check-subgraph:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Get subgraph status
        id: check
        uses: akropolisio/subgraph-status-action@v1
        with:
          subgraph: userName/my-amazing-subgraph
          version: pending
          fail_on_error: false

      - name: Do something if subgraph failed
        if: ${{ fromJSON(steps.check.outputs.hasError) }}
        run: |
          echo 'Error code ${{ steps.check.outputs.errorCode }}'
          echo 'Message ${{ steps.check.outputs.message }}'
        env:
          ERROR_CODE: ${{ steps.check.outputs.errorCode }}
          ERROR_MESSAGE: ${{ steps.check.outputs.message }}

      - name: Do something if subgraph healthy
        if: ${{ !fromJSON(steps.check.outputs.hasError) }}
        run: |
          echo 'Chain head block ${{ steps.check.outputs.chainHeadBlock }}'
          echo 'Latest synced block ${{ steps.check.outputs.latestBlock }}'
        env:
          CHAIN_HEAD_BLOCK: ${{ steps.check.outputs.chainHeadBlock }}
          LATEST_BLOCK: ${{ steps.check.outputs.latestBlock }}
```

## Versioning (for contributors)

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
