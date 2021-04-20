import {
  Token,
  Pair,
  TokenDailyData,
  PairDailyData,
  TokenWeeklyData,
  PairWeeklyData
} from "../../../generated/schema";
import { ERC20 } from "../../../generated/OwnedUpgradabilityProxy/ERC20";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../decimals";
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  SECONDS_PER_DAY,
  LAUNCH_DAY,
  SECONDS_PER_WEEK,
  LAUNCH_WEEK,
  WEEK_OFFSET
} from "../constants";
import { intToString, compoundId } from "./index";

export function getOrCreateToken(
  tokenId: String,
  tokenAddress: Address
): Token {
  let token = Token.load(tokenId);

  if (token == null) {
    token = new Token(tokenId);
    token.address = tokenAddress;

    if (tokenId != "0") {
      let erc20Token = ERC20.bind(tokenAddress);

      let tokenDecimals = erc20Token.try_decimals();
      let tokenName = erc20Token.try_name();
      let tokenSymbol = erc20Token.try_symbol();

      token.decimals = !tokenDecimals.reverted
        ? tokenDecimals.value
        : DEFAULT_DECIMALS;
      token.name = !tokenName.reverted ? tokenName.value : "";
      token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : "";
    } else {
      token.decimals = 18;
      token.name = "Ether";
      token.symbol = "ETH";
    }

    token.tradedVolume = BIGINT_ZERO;
  }

  return token as Token;
}

export function getToken(tokenId: String): Token | null {
  let token = Token.load(tokenId);

  if (token == null) {
    log.warning("Tried to load token that doesn't exist yet. Token ID: {}", [
      tokenId
    ]);
  }

  return token;
}

export function getOrCreatePair(
  tokenAId: i32,
  tokenBId: i32,
  createIfNotFound: boolean = true
): Pair {
  let id = "";
  let tokenAStringId = intToString(tokenAId);
  let tokenBStringId = intToString(tokenBId);

  // Calculate standardized id
  if (tokenAId < tokenBId) {
    id = compoundId(tokenAStringId, tokenBStringId);
  } else {
    id = compoundId(tokenBStringId, tokenAStringId);
  }

  let pair = Pair.load(id);

  if (pair == null && createIfNotFound) {
    pair = new Pair(id);

    // Link them in the same order as the ID.
    if (tokenAId < tokenBId) {
      pair.token0 = tokenAStringId;
      pair.token1 = tokenBStringId;
    } else {
      pair.token0 = tokenBStringId;
      pair.token1 = tokenAStringId;
    }

    pair.tradedVolumeToken0 = BIGINT_ZERO;
    pair.tradedVolumeToken1 = BIGINT_ZERO;
  }

  return pair as Pair;
}

// Calculates price of token A denominated in token B based on amounts traded
export function calculatePrice(
  tokenA: Token,
  amountA: BigInt,
  amountB: BigInt
): BigInt {
  let baseUnitTokenA = BigInt.fromI32(10).pow(tokenA.decimals as u8);
  return (baseUnitTokenA * amountB) / amountA;
}

export function getAndUpdateTokenDailyData(
  entity: Token,
  timestamp: BigInt
): TokenDailyData {
  let dayId = timestamp.toI32() / SECONDS_PER_DAY - LAUNCH_DAY;
  let id = compoundId(entity.id, BigInt.fromI32(dayId).toString());
  let dailyData = TokenDailyData.load(id);

  if (dailyData == null) {
    dailyData = new TokenDailyData(id);

    dailyData.dayStart = BigInt.fromI32(
      (timestamp.toI32() / SECONDS_PER_DAY) * SECONDS_PER_DAY
    );
    dailyData.dayEnd = dailyData.dayStart + BigInt.fromI32(SECONDS_PER_DAY);
    dailyData.dayNumber = dayId;
    dailyData.tradedVolume = BIGINT_ZERO;
    dailyData.token = entity.id;
  }

  return dailyData as TokenDailyData;
}

export function getAndUpdateTokenWeeklyData(
  entity: Token,
  timestamp: BigInt
): TokenWeeklyData {
  let weekId = timestamp.toI32() / SECONDS_PER_WEEK - LAUNCH_WEEK;
  let id = compoundId(entity.id, BigInt.fromI32(weekId).toString());
  let weeklyData = TokenWeeklyData.load(id);

  if (weeklyData == null) {
    weeklyData = new TokenWeeklyData(id);

    weeklyData.weekStart = BigInt.fromI32(
      (timestamp.toI32() / SECONDS_PER_WEEK) * SECONDS_PER_WEEK - WEEK_OFFSET
    );
    weeklyData.weekEnd =
      weeklyData.weekStart + BigInt.fromI32(SECONDS_PER_WEEK);
    weeklyData.weekNumber = weekId;
    weeklyData.tradedVolume = BIGINT_ZERO;
    weeklyData.token = entity.id;
  }

  return weeklyData as TokenWeeklyData;
}

export function getAndUpdatePairDailyData(
  entity: Pair,
  tradedVolumeToken0: BigInt,
  tradedVolumeToken1: BigInt,
  timestamp: BigInt
): PairDailyData {
  let dayId = timestamp.toI32() / SECONDS_PER_DAY - LAUNCH_DAY;
  let id = compoundId(entity.id, BigInt.fromI32(dayId).toString());
  let dailyData = PairDailyData.load(id);

  if (dailyData == null) {
    dailyData = new PairDailyData(id);

    dailyData.dayStart = BigInt.fromI32(
      (timestamp.toI32() / SECONDS_PER_DAY) * SECONDS_PER_DAY
    );
    dailyData.dayEnd = dailyData.dayStart + BigInt.fromI32(SECONDS_PER_DAY);
    dailyData.dayNumber = dayId;

    dailyData.pair = entity.id;

    dailyData.tradedVolumeToken0 = BIGINT_ZERO;
    dailyData.tradedVolumeToken1 = BIGINT_ZERO;

    dailyData.token0PriceOpen = entity.token0Price;
    dailyData.token1PriceOpen = entity.token1Price;

    dailyData.token0PriceLow = entity.token0Price;
    dailyData.token1PriceLow = entity.token1Price;

    dailyData.token0PriceHigh = entity.token0Price;
    dailyData.token1PriceHigh = entity.token1Price;
  }

  dailyData.tradedVolumeToken0 = dailyData.tradedVolumeToken0.plus(
    tradedVolumeToken0
  );
  dailyData.tradedVolumeToken1 = dailyData.tradedVolumeToken1.plus(
    tradedVolumeToken1
  );

  dailyData.token0PriceClose = entity.token0Price;
  dailyData.token1PriceClose = entity.token1Price;

  // Update low
  if (dailyData.token0PriceLow > entity.token0Price) {
    dailyData.token0PriceLow = entity.token0Price;
  }
  if (dailyData.token1PriceLow > entity.token1Price) {
    dailyData.token1PriceLow = entity.token1Price;
  }
  // Update high
  if (dailyData.token0PriceHigh < entity.token0Price) {
    dailyData.token0PriceHigh = entity.token0Price;
  }
  if (dailyData.token1PriceHigh < entity.token1Price) {
    dailyData.token1PriceHigh = entity.token1Price;
  }

  dailyData.save();

  return dailyData as PairDailyData;
}

export function getAndUpdatePairWeeklyData(
  entity: Pair,
  tradedVolumeToken0: BigInt,
  tradedVolumeToken1: BigInt,
  timestamp: BigInt
): PairWeeklyData {
  let weekId = timestamp.toI32() / SECONDS_PER_WEEK - LAUNCH_WEEK;
  let id = compoundId(entity.id, BigInt.fromI32(weekId).toString());
  let weeklyData = PairWeeklyData.load(id);

  if (weeklyData == null) {
    weeklyData = new PairWeeklyData(id);

    weeklyData.weekStart = BigInt.fromI32(
      (timestamp.toI32() / SECONDS_PER_WEEK) * SECONDS_PER_WEEK - WEEK_OFFSET
    );
    weeklyData.weekEnd =
      weeklyData.weekStart + BigInt.fromI32(SECONDS_PER_WEEK);
    weeklyData.weekNumber = weekId;

    weeklyData.pair = entity.id;

    weeklyData.tradedVolumeToken0 = BIGINT_ZERO;
    weeklyData.tradedVolumeToken1 = BIGINT_ZERO;

    weeklyData.token0PriceOpen = entity.token0Price;
    weeklyData.token1PriceOpen = entity.token1Price;

    weeklyData.token0PriceLow = entity.token0Price;
    weeklyData.token1PriceLow = entity.token1Price;

    weeklyData.token0PriceHigh = entity.token0Price;
    weeklyData.token1PriceHigh = entity.token1Price;
  }

  weeklyData.tradedVolumeToken0 = weeklyData.tradedVolumeToken0.plus(
    tradedVolumeToken0
  );
  weeklyData.tradedVolumeToken1 = weeklyData.tradedVolumeToken1.plus(
    tradedVolumeToken1
  );

  weeklyData.token0PriceClose = entity.token0Price;
  weeklyData.token1PriceClose = entity.token1Price;

  // Update low
  if (weeklyData.token0PriceLow > entity.token0Price) {
    weeklyData.token0PriceLow = entity.token0Price;
  }
  if (weeklyData.token1PriceLow > entity.token1Price) {
    weeklyData.token1PriceLow = entity.token1Price;
  }
  // Update high
  if (weeklyData.token0PriceHigh < entity.token0Price) {
    weeklyData.token0PriceHigh = entity.token0Price;
  }
  if (weeklyData.token1PriceHigh < entity.token1Price) {
    weeklyData.token1PriceHigh = entity.token1Price;
  }

  weeklyData.save();

  return weeklyData as PairWeeklyData;
}
