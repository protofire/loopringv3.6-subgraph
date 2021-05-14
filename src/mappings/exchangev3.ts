import { log, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  TokenRegistered,
  SubmitBlocksCall,
  SubmitBlocks1Call,
  SubmitBlocks2Call,
  SubmitBlocksCallBlocksStruct
} from "../../generated/OwnedUpgradabilityProxy/OwnedUpgradabilityProxy";
import { Block } from "../../generated/schema";
import {
  getOrCreateToken,
  getProxy,
  getOrCreateBlock,
  processBlockData,
  intToString
} from "../utils/helpers";
import { BIGINT_ZERO, BIGINT_ONE } from "../utils/constants";
import { DEFAULT_DECIMALS, toDecimal } from "../utils/decimals";

export function handleTokenRegistered(event: TokenRegistered): void {
  let tokenId = intToString(event.params.tokenId);
  let token = getOrCreateToken(tokenId, event.params.token);
  let proxy = getProxy();

  token.exchange = proxy.currentImplementation;

  token.save();
}

export function handleSubmitBlocksV1(call: SubmitBlocksCall): void {
  handleSubmitBlocks(call as ethereum.Call, call.inputs.blocks as Array<SubmitBlocksCallBlocksStruct>);
}

export function handleSubmitBlocksV2(call: SubmitBlocks1Call): void {
  handleSubmitBlocks(call as ethereum.Call, call.inputs.blocks as Array<SubmitBlocksCallBlocksStruct>);
}

export function handleSubmitBlocksV3(call: SubmitBlocks2Call): void {
  handleSubmitBlocks(call as ethereum.Call, call.inputs.blocks as Array<SubmitBlocksCallBlocksStruct>);
}

function handleSubmitBlocks(call: ethereum.Call, blockArray: Array<SubmitBlocksCallBlocksStruct>): void {
  let proxy = getProxy();

  for (let i = 0; i < blockArray.length; i++) {
    proxy.blockCount = proxy.blockCount.plus(BIGINT_ONE);

    let blockData = blockArray[i];
    let block = getOrCreateBlock(proxy.blockCount.toString());

    // metadata
    block.txHash = call.transaction.hash.toHexString();
    block.gasUsed = call.transaction.gasUsed;
    block.gasPrice = call.transaction.gasPrice;
    block.height = call.block.number;
    block.timestamp = call.block.timestamp;
    block.blockHash = call.block.hash.toHexString();

    // raw data except auxiliary data
    block.blockType = blockData.blockType;
    block.blockSize = blockData.blockSize;
    block.blockVersion = blockData.blockVersion;
    block.data = blockData.data.toHexString();
    block.proof = blockData.proof;
    block.storeBlockInfoOnchain = blockData.storeBlockInfoOnchain;
    block.offchainData = blockData.offchainData;

    block = processBlockData(block as Block);

    block.save();
  }

  proxy.save();
}
