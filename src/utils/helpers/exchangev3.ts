import { Token, Exchange, Block, Transaction } from "../../../generated/schema";
import { ERC20 } from "../../../generated/OwnedUpgradabilityProxy/ERC20";
import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DEFAULT_DECIMALS } from "../../utils/decimals";
import {
  BIGINT_ZERO,
  BIGDECIMAL_ZERO,
  ZERO_ADDRESS
} from "../../utils/constants";

export function getOrCreateToken(
  tokenId: String,
  tokenAddress: Address
): Token {
  let token = Token.load(tokenId);

  if (token == null) {
    token = new Token(tokenId);
    token.address = tokenAddress;

    if (tokenId != ZERO_ADDRESS) {
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

export function getOrCreateTransaction(id: String): Transaction {
  let tx = Transaction.load(id);

  if (tx == null) {
    tx = new Transaction(id);
  }

  return tx as Transaction;
}

export function extractData(data: String, offset: i32, length: i32): String {
  let start = offset * 2;
  let end = start + length * 2;
  if (data.length < end) {
    log.warning("Index out of range. end {}, length {}", [
      BigInt.fromI32(end).toString(),
      BigInt.fromI32(data.length).toString()
    ]);
  }
  return data.slice(start, end);
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

    let tx = getOrCreateTransaction(
      block.id.concat("-").concat(BigInt.fromI32(i).toString())
    );
    tx.data = txData;
    tx.block = block.id;
    tx.save()
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
