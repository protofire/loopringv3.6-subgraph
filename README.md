# Loopring Exchange V2 subgraph (Loopring 3.6)

This subgraph aims to allow anyone to query data for the Loopring Exchange v2, with support for L2 blocks, transactions, accounts, pools, tokens, pairs and aggregations of trade volumes by token and pair on a weekly and daily basis.

### Main entities and schema

The schema file contains documentation of most of the fields for almost all of the available entities.

#### Proxy

The `Proxy` entity contains data about the upgradable proxy, such as the current implementation (`Exchange` entity), all past implementations, as well as a count of all blocks processed across all implementations.

#### Exchange

This entity represents implementations of the exchange. It's a simple entity with the address of said implementation as it's ID, a link to the proxy (to be able to derive the past implementations list on the `Proxy` entity), and a list of all tokens registered when that implementation was active.

#### Token

The `Token` entity contains the classic metadata found on any ERC20 (name, symbol, decimals) as well as the address of said token contract, the total traded volume (denominated in it's own token value), and the daily and weekly entities created for said token. Its ID is equal to the internal ID within the Loopring exchange.

#### Pair

The `Pair` entity represents a pair of two tokens. There is only a single `Pair` entity for a pair of two tokens, since it's ID is standardized in the following manner `<LOWEST Token ID>-<HIGHEST Token ID>`.

This entity contains trade volume data, latest price of each token in the pair (denominated on the other token), daily and weekly data aggregations, as well as a list of all the trades involving said pair.

#### Account

The `Account` interface is implemented by the following entities: `User`, `Pool` and `ProtocolAccount`. Since users and pools are all identified by account IDs within the loopring data, they share some similarities, so we wanted to represent them in a similar way, but still keep them as unique entities.

Both `User` and `Pool` entities have a unique ID within loopring, which is used as the ID for the entities, and that ID is linked to the address, which the entity also tracks.

These entities also have a list of all the `AccountTokenBalance` entities that a `User` or `Pool` has, and they also keep track of the last transaction where the entity was updated and the transaction it was created at.

`ProtocolAccount` is a special singleton entity that keeps track of all `AccountTokenBalance` entities that the protocol has, for when protocolFees start being collected.

#### AccountTokenBalance

This entity reprensents the balance of a particular `Token`, that a particular `Account` has.

Aside from links to the relevant `Token` and `Account`, and a balance field, this entity also has a list of all the `Transaction` entities that modified it.

#### Block

The `Block` entity represents a single L2 block on the Loopring exchange.

It contains L1 metadata for the block (gasPrice, timestamp, L1 block height when the block was included, etc), as well as L2 metadata, like blockType, blockSize, blockVersion, operator that handled the block, etc.

It also contains the raw data represented as a hex string, parsed block data, like the fee maker and taker bips, and a list of all the parsed transactions from said block of raw data.

#### Transaction

The `Transaction` interface is implemented by entities that represent all the transaction types available in the Loopring exchange:
* AccountUpdate
* AmmUpdate
* SignatureVerification
* Deposit
* Withdrawal
* Transfer
* SpotTrade

The interface only defines the commmon points, which is only a reference to the `Block` entity where the transaction was created, the raw L2 data expressed as a hex string, and also a list of all the `AccountTokenBalance` entities that the transaction modified (useful for the transactions lists on said entity).

Each of the implementations contains type specific parsed data from the raw L2 data. For more information, you can check the schema file, which has all relevant fields documented.

#### Daily and weekly aggregated data

There are specific entities that aggregate `Token` and `Pair` data on a daily and weekly basis.
`PairDailyData` and `PairWeeklyData` aggregate data for the `Pair` entity such as trade volume and token price (high, low, open, close).
`TokenDailyData` and `TokenWeeklyData` aggregate data for the `Token` entity, in particular the trade volume.

All daily/weekly aggregation entities have fields to reference the day/week start and end, as well as the day/week "number". This number is relative to the Loopring exchange v2 launch, since we needed to define a start point for all daily/weekly aggregation entities.

If there's not activity for a `Token` or `Pair` within a day/week, there won't be an entity available for that day, and all values can be safely assumed as 0. We don't include these "null" entities since if there's no activity, there's no event to hook to and create the entity for that day/week.

## Example queries

Get all token balances for an account with its account ID

```graphql
{
  accountTokenBalances(where: {account: "<ACCOUNT-ID>"}) {
    id
    token {
      id
    }
    account {
      id
    }
    balance
  }
}
```

Get all account token balances for a specific token

```graphql
{
  accountTokenBalances(where: {token: "<TOKEN-ID>"}) {
    id
    token {
      id
    }
    account {
      id
    }
    balance
  }
}
```

Get all spot trades for a particular account ID (two lists since any account could be the accountA or accountB)

```graphql
{
  tradesA: spotTrades(where: {accountA: "<ACCOUNT-ID>"}) {
    accountA {
      id
    }
    accountB {
      id
    }
    tokenA {
      symbol
      decimals
    }
    tokenB {
      symbol
      decimals
    }
    fillSA
    fillSB
    feeA
    feeB
    id
    tokenAPrice
    tokenBPrice
  }
  tradesB: spotTrades(where: {accountB: "<ACCOUNT-ID>"}) {
    accountA {
      id
    }
    accountB {
      id
    }
    tokenA {
      symbol
      decimals
    }
    tokenB {
      symbol
      decimals
    }
    fillSA
    fillSB
    feeA
    feeB
    id
    tokenAPrice
    tokenBPrice
  }
}
```

Get pair daily data for ETH-LRC pair (0-1) ordered by dayNumber (ascending)

```graphql
{
  pairDailyDatas(where:{pair:"0-1"}, orderBy: dayNumber, orderDirection: asc) {
    pair {
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
    dayStart
    dayEnd
    dayNumber
    token0PriceLow
    token1PriceLow
    token0PriceHigh
    token1PriceHigh
    token0PriceOpen
    token1PriceOpen
    token0PriceClose
    token1PriceClose
    tradedVolumeToken0
    tradedVolumeToken1
  }
}
```
