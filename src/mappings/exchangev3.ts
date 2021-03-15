import { log, BigInt } from "@graphprotocol/graph-ts";
import {
  TokenRegistered
} from "../../generated/templates/ExchangeV36/ExchangeV36";
import {
  getOrCreateToken,
  getProxy
} from "../utils/helpers";
import {
  BIGINT_ZERO
} from "../utils/constants";
import { DEFAULT_DECIMALS, toDecimal } from "../utils/decimals";

export function handleTokenRegistered(event: TokenRegistered): void {
  let tokenId = BigInt.fromI32(event.params.tokenId).toString()
  let token = getOrCreateToken(tokenId, event.params.token);
  let proxy = getProxy();

  token.exchange = proxy.currentImplementation;

  token.save();
}
