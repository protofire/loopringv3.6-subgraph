import {
  Transfer,
  Block,
  Token,
  User,
  Pool
} from "../../../../generated/schema";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import {
  extractData,
  extractBigInt,
  extractInt,
  extractBigIntFromFloat
} from "../data";
import {
  createIfNewAccount,
  getToken,
  intToString,
  getOrCreateAccountTokenBalance
} from "../index";

// interface Transfer {
//   accountFromID?: number;
//   accountToID?: number;
//   tokenID?: number;
//   amount?: BN;
//   feeTokenID?: number;
//   fee?: BN;
//   validUntil?: number;
//   storageID?: number;
//   from?: string;
//   to?: string;
//   data?: string;
// }
//
// /**
//  * Processes transfer requests.
//  */
// export class TransferProcessor {
//   public static process(
//     state: ExchangeState,
//     block: BlockContext,
//     txData: Bitstream
//   ) {
//     const transfer = this.extractData(txData);
//
//     const from = state.getAccount(transfer.accountFromID);
//     const to = state.getAccount(transfer.accountToID);
//     if (transfer.to !== Constants.zeroAddress) {
//       to.owner = transfer.to;
//     }
//
//     from.getBalance(transfer.tokenID).balance.isub(transfer.amount);
//     to.getBalance(transfer.tokenID).balance.iadd(transfer.amount);
//
//     from.getBalance(transfer.feeTokenID).balance.isub(transfer.fee);
//
//     // Nonce
//     const storage = from
//       .getBalance(transfer.tokenID)
//       .getStorage(transfer.storageID);
//     storage.storageID = transfer.storageID;
//     storage.data = new BN(1);
//
//     const operator = state.getAccount(block.operatorAccountID);
//     operator.getBalance(transfer.feeTokenID).balance.iadd(transfer.fee);
//
//     return transfer;
//   }
//
//   public static extractData(data: Bitstream) {
//     const transfer: Transfer = {};
//     let offset = 1;
//
//     // Check that this is a conditional update
//     const transferType = data.extractUint8(offset);
//     offset += 1;
//
//     transfer.accountFromID = data.extractUint32(offset);
//     offset += 4;
//     transfer.accountToID = data.extractUint32(offset);
//     offset += 4;
//     transfer.tokenID = data.extractUint16(offset);
//     offset += 2;
//     transfer.amount = fromFloat(
//       data.extractUint24(offset),
//       Constants.Float24Encoding
//     );
//     offset += 3;
//     transfer.feeTokenID = data.extractUint16(offset);
//     offset += 2;
//     transfer.fee = fromFloat(
//       data.extractUint16(offset),
//       Constants.Float16Encoding
//     );
//     offset += 2;
//     transfer.storageID = data.extractUint32(offset);
//     offset += 4;
//     transfer.to = data.extractAddress(offset);
//     offset += 20;
//     transfer.from = data.extractAddress(offset);
//     offset += 20;
//
//     return transfer;
//   }
// }

export function processTransfer(id: String, data: String, block: Block): void {
  let transaction = new Transfer(id);
  transaction.data = data;
  transaction.block = block.id;

  let offset = 1;

  // Check that this is a conditional update
  transaction.type = extractInt(data, offset, 1);
  offset += 1;

  transaction.accountFromID = extractInt(data, offset, 4);
  offset += 4;
  transaction.accountToID = extractInt(data, offset, 4);
  offset += 4;
  transaction.tokenID = extractInt(data, offset, 2);
  offset += 2;
  transaction.amount = extractBigIntFromFloat(data, offset, 3, 5, 19, 10);
  offset += 3;
  transaction.feeTokenID = extractInt(data, offset, 2);
  offset += 2;
  transaction.fee = extractBigIntFromFloat(data, offset, 2, 5, 11, 10);
  offset += 2;
  transaction.storageID = extractInt(data, offset, 4);
  offset += 4;
  transaction.to = extractData(data, offset, 20);
  offset += 20;
  transaction.from = extractData(data, offset, 20);
  offset += 20;

  let fromAccountId = intToString(transaction.accountFromID);
  let toAccountId = intToString(transaction.accountToID);

  let token = getToken(intToString(transaction.tokenID)) as Token;
  let feeToken = getToken(intToString(transaction.feeTokenID)) as Token;

  createIfNewAccount(transaction.accountFromID, transaction.id, transaction.from);
  createIfNewAccount(transaction.accountToID, transaction.id, transaction.to);

  let tokenBalances = new Array<String>()

  // Token transfer balance calculations
  // Avoid overwriting balance entities
  if(token.id == feeToken.id) {
    let fromAccountTokenBalance = getOrCreateAccountTokenBalance(
      fromAccountId,
      token.id
    );
    fromAccountTokenBalance.balance = fromAccountTokenBalance.balance.minus(
      transaction.amount.minus(transaction.fee)
    );

    fromAccountTokenBalance.save();
    tokenBalances.push(fromAccountTokenBalance.id);
  } else {
    let fromAccountTokenBalance = getOrCreateAccountTokenBalance(
      fromAccountId,
      token.id
    );
    fromAccountTokenBalance.balance = fromAccountTokenBalance.balance.minus(
      transaction.amount
    );
    fromAccountTokenBalance.save();

    // Fee token balance calculation
    let fromAccountTokenFeeBalance = getOrCreateAccountTokenBalance(
      fromAccountId,
      feeToken.id
    );
    fromAccountTokenFeeBalance.balance = fromAccountTokenFeeBalance.balance.minus(
      transaction.fee
    );

    fromAccountTokenFeeBalance.save();
    tokenBalances.push(fromAccountTokenBalance.id);
    tokenBalances.push(fromAccountTokenFeeBalance.id);
  }

  let toAccountTokenBalance = getOrCreateAccountTokenBalance(
    toAccountId,
    token.id
  );
  toAccountTokenBalance.balance = toAccountTokenBalance.balance.plus(
    transaction.amount
  );
  toAccountTokenBalance.save();
  tokenBalances.push(toAccountTokenBalance.id);

  // Operator update
  let operatorTokenFeeBalance = getOrCreateAccountTokenBalance(
    intToString(block.operatorAccountID),
    feeToken.id
  );
  operatorTokenFeeBalance.balance = operatorTokenFeeBalance.balance.plus(
    transaction.fee
  );
  tokenBalances.push(operatorTokenFeeBalance.id);

  transaction.toAccount = toAccountId;
  transaction.fromAccount = fromAccountId;
  transaction.token = token.id;
  transaction.feeToken = feeToken.id;
  transaction.tokenBalances = tokenBalances;

  operatorTokenFeeBalance.save();
  transaction.save();
}
