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
export const TRANSACTION_SPOT_TRADE = "Spot trade"
export const TRANSACTION_TRANSFER = "Transfer"
export const TRANSACTION_WITHDRAWAL = "Withdrawal"
export const TRANSACTION_ACCOUNT_UPDATE = "Account update"
export const TRANSACTION_AMM_UPDATE = "AMM update"
export const TRANSACTION_SIGNATURE_VERIFICATION = "Signature verification"
// TransactionType.NOOP -> 00
// TransactionType.DEPOSIT -> 01
// TransactionType.SPOT_TRADE -> 02
// TransactionType.TRANSFER -> 03
// TransactionType.WITHDRAWAL -> 04
// TransactionType.ACCOUNT_UPDATE -> 05
// TransactionType.AMM_UPDATE -> 06
// TransactionType.SIGNATURE_VERIFICATION -> 07
