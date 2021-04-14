import { Token, Pair } from "../../../generated/schema";
import { ERC20 } from "../../../generated/OwnedUpgradabilityProxy/ERC20";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../decimals";
import { BIGINT_ZERO, BIGDECIMAL_ZERO } from "../constants";
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

    pair.tradedVolumeToken0 = BIGINT_ZERO
    pair.tradedVolumeToken1 = BIGINT_ZERO
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
