import { Token, Exchange, Block } from "../../../generated/schema";
import { ERC20 } from "../../../generated/OwnedUpgradabilityProxy/ERC20";
import { Address } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../../utils/decimals";
import { BIGINT_ZERO, BIGDECIMAL_ZERO } from "../../utils/constants";

export function getOrCreateToken(
  tokenId: String,
  tokenAddress: Address
): Token {
  let token = Token.load(tokenId);

  if (token == null) {
    token = new Token(tokenId);
    token.address = tokenAddress;

    let erc20Token = ERC20.bind(tokenAddress);

    let tokenDecimals = erc20Token.try_decimals();
    let tokenName = erc20Token.try_name();
    let tokenSymbol = erc20Token.try_symbol();

    token.decimals = !tokenDecimals.reverted
      ? tokenDecimals.value
      : DEFAULT_DECIMALS;
    token.name = !tokenName.reverted ? tokenName.value : "";
    token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : "";
  }

  return token as Token;
}

export function getOrCreateBlock(id: String): Block {
  let block = Block.load(id);

  if (block == null) {
    block = new Block(id);
  }

  return block as Block;
}

export function getToken(tokenId: String): Token | null {
  let token = Token.load(tokenId);
  return token;
}
