import { Deposit, Block } from "../../../../generated/schema";
import { extractData, extractBigInt, extractInt } from "../data";

// interface Deposit {
//   to?: string;
//   toAccountID?: number;
//   tokenID?: number;
//   amount?: BN;
// }
//
// /**
//  * Processes deposit requests.
//  */
// export class DepositProcessor {
//   public static process(
//     state: ExchangeState,
//     block: BlockContext,
//     txData: Bitstream
//   ) {
//     const deposit = this.extractData(txData);
//
//     const account = state.getAccount(deposit.toAccountID);
//     account.owner = deposit.to;
//
//     const balance = account.getBalance(deposit.tokenID);
//     balance.balance.iadd(deposit.amount);
//
//     return deposit;
//   }
//
//   public static extractData(data: Bitstream) {
//     const deposit: Deposit = {};
//     let offset = 1;
//
//     // Read in the deposit data
//     deposit.to = data.extractAddress(offset);
//     offset += 20;
//     deposit.toAccountID = data.extractUint32(offset);
//     offset += 4;
//     deposit.tokenID = data.extractUint16(offset);
//     offset += 2;
//     deposit.amount = data.extractUint96(offset);
//     offset += 12;
//
//     return deposit;
//   }
// }

export function processDeposit(id: String, data: String, block: Block): void {
  let transaction = new Deposit(id);
  transaction.data = data;
  transaction.block = block.id;

  let offset = 1; // First byte is tx type

  transaction.to = extractData(data, offset, 20);
  offset += 20;
  transaction.toAccountID = extractInt(data, offset, 4);
  offset += 4;
  transaction.tokenID = extractInt(data, offset, 2);
  offset += 2;
  transaction.amount = extractBigInt(data, offset, 12);
  offset += 12;

  transaction.save();
}
