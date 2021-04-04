import { AccountUpdate, Block, Token } from "../../../../generated/schema";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { extractData, extractBigInt, extractInt, extractBigIntFromFloat } from "../data";
import { getOrCreateUser, getToken, intToString } from "../index";

// interface AccountUpdate {
//   owner?: string;
//   accountID?: number;
//   feeTokenID?: number;
//   fee?: BN;
//   publicKeyX?: string;
//   publicKeyY?: string;
//   validUntil?: number;
//   nonce?: number;
// }
//
// /**
//  * Processes account update requests.
//  */
// export class AccountUpdateProcessor {
//   public static process(
//     state: ExchangeState,
//     block: BlockContext,
//     txData: Bitstream
//   ) {
//     const update = AccountUpdateProcessor.extractData(txData);
//
//     const account = state.getAccount(update.accountID);
//     account.owner = update.owner;
//     account.publicKeyX = update.publicKeyX;
//     account.publicKeyY = update.publicKeyY;
//     account.nonce++;
//
//     const balance = account.getBalance(update.feeTokenID);
//     balance.balance.isub(update.fee);
//
//     const operator = state.getAccount(block.operatorAccountID);
//     const balanceO = operator.getBalance(update.feeTokenID);
//     balanceO.balance.iadd(update.fee);
//
//     return update;
//   }
//
//   public static extractData(data: Bitstream) {
//     const update: AccountUpdate = {};
//     let offset = 1;
//
//     const updateType = data.extractUint8(offset);
//     offset += 1;
//     update.owner = data.extractAddress(offset);
//     offset += 20;
//     update.accountID = data.extractUint32(offset);
//     offset += 4;
//     update.feeTokenID = data.extractUint16(offset);
//     offset += 2;
//     update.fee = fromFloat(
//       data.extractUint16(offset),
//       Constants.Float16Encoding
//     );
//     offset += 2;
//     const publicKey = data.extractData(offset, 32);
//     offset += 32;
//     update.nonce = data.extractUint32(offset);
//     offset += 4;
//
//     // Unpack the public key
//     const unpacked = EdDSA.unpack(publicKey);
//     update.publicKeyX = unpacked.publicKeyX;
//     update.publicKeyY = unpacked.publicKeyY;
//
//     return update;
//   }
// }

export function processAccountUpdate(
  id: String,
  data: String,
  block: Block
): void {
  let transaction = new AccountUpdate(id);
  transaction.data = data;
  transaction.block = block.id;

  let offset = 1;

  transaction.updateType = extractInt(data, offset, 1);
  offset += 1;
  transaction.owner = extractData(data, offset, 20);
  offset += 20;
  transaction.accountID = extractInt(data, offset, 4);
  offset += 4;
  transaction.feeTokenID = extractInt(data, offset, 2);
  offset += 2;
  transaction.fee = extractBigIntFromFloat(data, offset, 2, 5, 11, 10);
  offset += 2;
  transaction.publicKey = extractData(data, offset, 32);
  offset += 32;
  transaction.nonce = extractInt(data, offset, 4);
  offset += 4;

  let user = getOrCreateUser(intToString(transaction.accountID));
  user.address = Address.fromString(transaction.owner) as Bytes;
  // TO-DO Update the rest of the account parameters here.

  let feeToken = getToken(intToString(transaction.feeTokenID)) as Token;

  transaction.user = user.id;
  transaction.feeToken = feeToken.id;

  user.save();
  transaction.save();
}
