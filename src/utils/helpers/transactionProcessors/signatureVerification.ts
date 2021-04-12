import {
  SignatureVerification,
  Block,
  User,
  Pool
} from "../../../../generated/schema";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { extractData, extractBigInt, extractInt } from "../data";
import {
  createIfNewAccount,
  getToken,
  intToString
} from "../index";

// interface SignatureVerification {
//   owner?: string;
//   accountID?: number;
//   data?: string;
// }
//
// /**
//  * Processes signature verification requests.
//  */
// export class SignatureVerificationProcessor {
//   public static process(
//     state: ExchangeState,
//     block: BlockContext,
//     txData: Bitstream
//   ) {
//     const verification = this.extractData(txData);
//     return verification;
//   }
//
//   public static extractData(data: Bitstream) {
//     const verification: SignatureVerification = {};
//     let offset = 1;
//
//     verification.owner = data.extractAddress(offset);
//     offset += 20;
//     verification.accountID = data.extractUint32(offset);
//     offset += 4;
//     verification.data = data.extractBytes32(offset).toString("hex");
//     offset += 32;
//
//     return verification;
//   }
// }

export function processSignatureVerification(
  id: String,
  data: String,
  block: Block
): void {
  let transaction = new SignatureVerification(id);
  transaction.data = data;
  transaction.block = block.id;

  let offset = 1;

  transaction.owner = extractData(data, offset, 20);
  offset += 20;
  transaction.accountID = extractInt(data, offset, 4);
  offset += 4;
  transaction.verificationData = extractData(data, offset, 32);
  offset += 32;

  let accountId = intToString(transaction.accountID)

  createIfNewAccount(transaction.accountID, transaction.id, transaction.owner);

  transaction.account = accountId;
  transaction.save();
}
