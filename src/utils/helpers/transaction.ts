import { Token, Exchange, Block } from "../../../generated/schema";
import { ERC20 } from "../../../generated/OwnedUpgradabilityProxy/ERC20";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../../utils/decimals";
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  ZERO_ADDRESS,
  TRANSACTION_NOOP,
  TRANSACTION_DEPOSIT,
  TRANSACTION_SPOT_TRADE,
  TRANSACTION_TRANSFER,
  TRANSACTION_WITHDRAWAL,
  TRANSACTION_ACCOUNT_UPDATE,
  TRANSACTION_AMM_UPDATE,
  TRANSACTION_SIGNATURE_VERIFICATION
} from "../../utils/constants";
import {
  processDeposit,
  processSpotTrade,
  processTransfer,
  processWithdrawal,
  processAccountUpdate,
  processAmmUpdate,
  processSignatureVerification
} from './transactionProcessors'

export function processTransactionData(id: String, data: String, blockId: String): void {
  let txType = getTransactionTypeFromData(data);

  if(txType == TRANSACTION_NOOP) {
    // For now do nothing. Maybe we want to track the amount of No-op in the future?
  } else if(txType == TRANSACTION_DEPOSIT) {
    processDeposit(id, data, blockId)
  } else if(txType == TRANSACTION_SPOT_TRADE) {
    processSpotTrade(id, data, blockId)
  } else if(txType == TRANSACTION_TRANSFER) {
    processTransfer(id, data, blockId)
  } else if(txType == TRANSACTION_WITHDRAWAL) {
    processWithdrawal(id, data, blockId)
  } else if(txType == TRANSACTION_ACCOUNT_UPDATE) {
    processAccountUpdate(id, data, blockId)
  } else if(txType == TRANSACTION_AMM_UPDATE) {
    processAmmUpdate(id, data, blockId)
  } else if(txType == TRANSACTION_SIGNATURE_VERIFICATION) {
    processSignatureVerification(id, data, blockId)
  }
}

function getTransactionTypeFromData(data: String): String {
  let typeString = data.slice(0, 2);
  let response = "";

  if (typeString == "00") {
    response = TRANSACTION_NOOP;
  } else if (typeString == "01") {
    response = TRANSACTION_DEPOSIT;
  } else if (typeString == "02") {
    response = TRANSACTION_SPOT_TRADE;
  } else if (typeString == "03") {
    response = TRANSACTION_TRANSFER;
  } else if (typeString == "04") {
    response = TRANSACTION_WITHDRAWAL;
  } else if (typeString == "05") {
    response = TRANSACTION_ACCOUNT_UPDATE;
  } else if (typeString == "06") {
    response = TRANSACTION_AMM_UPDATE;
  } else if (typeString == "07") {
    response = TRANSACTION_SIGNATURE_VERIFICATION;
  } else {
    log.warning("Unknown transaction type: {}", [typeString]);
  }

  return response;
}
