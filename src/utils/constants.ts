import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";
import { toDecimal } from "./decimals";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let BIGDECIMAL_ONE = toDecimal(BigInt.fromI32(10).pow(18));
export let BIGDECIMAL_HUNDRED = toDecimal(BigInt.fromI32(10).pow(20));
export const TRANSACTION_NOOP = "Noop"
export const TRANSACTION_DEPOSIT = "Deposit"
export const TRANSACTION_WITHDRAWAL = "Withdrawal"
export const TRANSACTION_TRANSFER = "Transfer"
export const TRANSACTION_SPOT_TRADE = "Spot trade"
export const TRANSACTION_ACCOUNT_UPDATE = "Account update"
export const TRANSACTION_AMM_UPDATE = "AMM update"
export const TRANSACTION_SIGNATURE_VERIFICATION = "Signature verification"
export const LAUNCH_DAY = 18564; // 1603950102 / 86400. 1603929600 = Thursday, October 29, 2020 0:00:00
export const LAUNCH_WEEK = 2651;
export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_WEEK = 604800;
export const WEEK_OFFSET = 259200; // Epoch week starts always on thursday so we need to offset weeks to monday.
