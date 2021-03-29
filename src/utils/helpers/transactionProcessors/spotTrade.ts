import { SpotTrade, Block } from "../../../../generated/schema";
import { extractData, extractBigInt, extractInt } from "../data";

// interface SettlementValues {
//   fillSA: BN;
//   fillBA: BN;
//   feeA: BN;
//   protocolFeeA: BN;
//
//   fillSB: BN;
//   fillBB: BN;
//   feeB: BN;
//   protocolFeeB: BN;
// }
//
// /**
//  * Processes spot trade requests.
//  */
// export class SpotTradeProcessor {
//   public static process(
//     state: ExchangeState,
//     block: BlockContext,
//     data: Bitstream
//   ) {
//     let offset = 1;
//
//     // Storage IDs
//     const storageIdA = data.extractUint32(offset);
//     offset += 4;
//     const storageIdB = data.extractUint32(offset);
//     offset += 4;
//
//     // Accounts
//     const accountIdA = data.extractUint32(offset);
//     offset += 4;
//     const accountIdB = data.extractUint32(offset);
//     offset += 4;
//
//     // Tokens
//     const tokenA = data.extractUint16(offset);
//     offset += 2;
//     const tokenB = data.extractUint16(offset);
//     offset += 2;
//
//     // Fills
//     const fFillSA = data.extractUint24(offset);
//     offset += 3;
//     const fFillSB = data.extractUint24(offset);
//     offset += 3;
//
//     // Order data
//     const orderDataA = data.extractUint8(offset);
//     offset += 1;
//     const orderDataB = data.extractUint8(offset);
//     offset += 1;
//
//     // Further extraction of packed data
//     const limitMaskA = orderDataA & 0b10000000;
//     const feeBipsA = orderDataA & 0b00111111;
//     const fillAmountBorSA = limitMaskA > 0;
//
//     const limitMaskB = orderDataB & 0b10000000;
//     const feeBipsB = orderDataB & 0b00111111;
//     const fillAmountBorSB = limitMaskB > 0;
//
//     // Decode the float values
//     const fillSA = fromFloat(fFillSA, Constants.Float24Encoding);
//     const fillSB = fromFloat(fFillSB, Constants.Float24Encoding);
//
//     const s = this.calculateSettlementValues(
//       block.protocolFeeTakerBips,
//       block.protocolFeeMakerBips,
//       fillSA,
//       fillSB,
//       feeBipsA,
//       feeBipsB
//     );
//
//     // Update accountA
//     {
//       const accountA = state.getAccount(accountIdA);
//       accountA.getBalance(tokenA).balance.isub(s.fillSA);
//       accountA
//         .getBalance(tokenB)
//         .balance.iadd(s.fillBA)
//         .isub(s.feeA);
//
//       const tradeHistoryA = accountA.getBalance(tokenA).getStorage(storageIdA);
//       if (tradeHistoryA.storageID !== storageIdA) {
//         tradeHistoryA.data = new BN(0);
//       }
//       tradeHistoryA.storageID = storageIdA;
//       tradeHistoryA.data.iadd(fillAmountBorSA ? s.fillBA : s.fillSA);
//     }
//     // Update accountB
//     {
//       const accountB = state.getAccount(accountIdB);
//       accountB.getBalance(tokenB).balance.isub(s.fillSB);
//       accountB
//         .getBalance(tokenA)
//         .balance.iadd(s.fillBB)
//         .isub(s.feeB);
//
//       const tradeHistoryB = accountB.getBalance(tokenB).getStorage(storageIdB);
//       if (tradeHistoryB.storageID !== storageIdB) {
//         tradeHistoryB.data = new BN(0);
//       }
//       tradeHistoryB.storageID = storageIdB;
//       tradeHistoryB.data.iadd(fillAmountBorSB ? s.fillBB : s.fillSB);
//     }
//
//     // Update protocol fee
//     const protocol = state.getAccount(0);
//     protocol.getBalance(tokenA).balance.iadd(s.protocolFeeB);
//     protocol.getBalance(tokenB).balance.iadd(s.protocolFeeA);
//
//     // Update operator
//     const operator = state.getAccount(block.operatorAccountID);
//     operator
//       .getBalance(tokenA)
//       .balance.iadd(s.feeB)
//       .isub(s.protocolFeeB);
//     operator
//       .getBalance(tokenB)
//       .balance.iadd(s.feeA)
//       .isub(s.protocolFeeA);
//
//     // Create struct
//     const trade: SpotTrade = {
//       exchange: state.exchange,
//       requestIdx: state.processedRequests.length,
//       blockIdx: /*block.blockIdx*/ 0,
//
//       accountIdA,
//       orderIdA: storageIdA,
//       fillAmountBorSA,
//       tokenA,
//       fillSA: s.fillSA,
//       feeA: s.feeA,
//       protocolFeeA: s.protocolFeeA,
//
//       accountIdB,
//       orderIdB: storageIdB,
//       fillAmountBorSB,
//       tokenB,
//       fillSB: s.fillSB,
//       feeB: s.feeB,
//       protocolFeeB: s.protocolFeeB
//     };
//
//     return trade;
//   }
//
//   private static calculateSettlementValues(
//     protocolFeeTakerBips: number,
//     protocolFeeMakerBips: number,
//     fillSA: BN,
//     fillSB: BN,
//     feeBipsA: number,
//     feeBipsB: number
//   ) {
//     const fillBA = fillSB;
//     const fillBB = fillSA;
//     const [feeA, protocolFeeA] = this.calculateFees(
//       fillBA,
//       protocolFeeTakerBips,
//       feeBipsA
//     );
//
//     const [feeB, protocolFeeB] = this.calculateFees(
//       fillBB,
//       protocolFeeMakerBips,
//       feeBipsB
//     );
//
//     const settlementValues: SettlementValues = {
//       fillSA,
//       fillBA,
//       feeA,
//       protocolFeeA,
//
//       fillSB,
//       fillBB,
//       feeB,
//       protocolFeeB
//     };
//     return settlementValues;
//   }
//
//   private static calculateFees(
//     fillB: BN,
//     protocolFeeBips: number,
//     feeBips: number
//   ) {
//     const protocolFee = fillB.mul(new BN(protocolFeeBips)).div(new BN(100000));
//     const fee = fillB.mul(new BN(feeBips)).div(new BN(10000));
//     return [fee, protocolFee];
//   }
// }

export function processSpotTrade(id: String, data: String, block: Block): void {
  let transaction = new SpotTrade(id);
  transaction.data = data;
  transaction.block = block.id;

  let offset = 1;

  // Storage IDs
  transaction.storageIdA = extractInt(data, offset, 4);
  offset += 4;
  transaction.storageIdB = extractInt(data, offset, 4);
  offset += 4;

  // Accounts
  transaction.accountIdA = extractInt(data, offset, 4);
  offset += 4;
  transaction.accountIdB = extractInt(data, offset, 4);
  offset += 4;

  // Tokens
  transaction.tokenA = extractInt(data, offset, 2);
  offset += 2;
  transaction.tokenB = extractInt(data, offset, 2);
  offset += 2;

  // Fills
  transaction.fFillSA = extractInt(data, offset, 3);
  offset += 3;
  transaction.fFillSB = extractInt(data, offset, 3);
  offset += 3;

  // Order data
  transaction.orderDataA = extractInt(data, offset, 1);
  offset += 1;
  transaction.orderDataB = extractInt(data, offset, 1);
  offset += 1;

  transaction.save();
}
