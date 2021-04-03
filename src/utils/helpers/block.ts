import { Block } from "../../../generated/schema";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../../utils/decimals";
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  ZERO_ADDRESS
} from "../../utils/constants";
import { extractData } from "./data";
import { intToString } from "./index";
import { processTransactionData } from "./transaction";

export function getOrCreateBlock(id: String): Block {
  let block = Block.load(id);

  if (block == null) {
    block = new Block(id);
  }

  return block as Block;
}

export function processBlockData(block: Block): Block {
  let data = block.data.slice(2); // Remove the 0x beginning of the hex string
  let offset = 0;

  // General data
  offset += 20 + 32 + 32 + 4;
  let protocolFeeTakerBips = extractData(data, offset, 1);
  offset += 1;
  let protocolFeeMakerBips = extractData(data, offset, 1);
  offset += 1;
  let numConditionalTransactions = extractData(data, offset, 4);
  offset += 4;
  let operatorAccountID = extractData(data, offset, 4);
  offset += 4;

  block.protocolFeeTakerBips = protocolFeeTakerBips;
  block.protocolFeeMakerBips = protocolFeeMakerBips;
  block.numConditionalTransactions = numConditionalTransactions;
  block.operatorAccountID = operatorAccountID;

  for (let i = 0; i < block.blockSize; i++) {
    let size1 = 29;
    let size2 = 39;
    let txData1 = extractData(data, offset + i * size1, size1);
    let txData2 = extractData(
      data,
      offset + block.blockSize * size1 + i * size2,
      size2
    );
    let txData = txData1.concat(txData2);

    // Refactor to use methods from transaction helper
    let txId = block.id.concat("-").concat(intToString(i))
    processTransactionData(txId, txData, block)
  }

  //   export enum TransactionType {
  //   NOOP = 0,
  //   DEPOSIT,1
  //   WITHDRAWAL,2
  //   TRANSFER,3
  //   SPOT_TRADE,4
  //   ACCOUNT_UPDATE,5
  //   AMM_UPDATE,6
  //   SIGNATURE_VERIFICATION,7
  // }

  return block as Block;
}
