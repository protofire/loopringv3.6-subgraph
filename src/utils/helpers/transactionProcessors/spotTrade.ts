import {
  SpotTrade,
  Pair,
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
  extractBigIntFromFloat,
  stringBytesToI32,
  stringBytesToBigInt
} from "../data";
import {
  getToken,
  intToString,
  getOrCreateAccountTokenBalance,
  getProtocolAccount,
  getOrCreatePair,
  getAndUpdateTokenDailyData,
  getAndUpdateTokenWeeklyData,
  getAndUpdatePairDailyData,
  getAndUpdatePairWeeklyData,
  calculatePrice
} from "../index";
import { BIGINT_ZERO } from "../../constants";

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
  transaction.tokenIDA = extractInt(data, offset, 2);
  offset += 2;
  transaction.tokenIDB = extractInt(data, offset, 2);
  offset += 2;

  // Fills
  transaction.fFillSA = extractInt(data, offset, 3);
  transaction.fillSA = extractBigIntFromFloat(data, offset, 3, 5, 19, 10);
  offset += 3;
  transaction.fFillSB = extractInt(data, offset, 3);
  transaction.fillSB = extractBigIntFromFloat(data, offset, 3, 5, 19, 10);
  offset += 3;

  // Order data
  transaction.orderDataA = extractInt(data, offset, 1);
  offset += 1;
  transaction.orderDataB = extractInt(data, offset, 1);
  offset += 1;

  // There's no need to create the accounts, they don't need to be updated
  // and they can't be created first during a SpotTrade transaction.
  let accountAID = intToString(transaction.accountIdA);
  let accountBID = intToString(transaction.accountIdB);

  let tokenA = getToken(intToString(transaction.tokenIDA)) as Token;
  let tokenB = getToken(intToString(transaction.tokenIDB)) as Token;

  transaction.accountA = accountAID;
  transaction.accountB = accountBID;
  transaction.tokenA = tokenA.id;
  transaction.tokenB = tokenB.id;

  // Further extraction of packed data
  transaction.limitMaskA =
    BigInt.fromI32(transaction.orderDataA) & stringBytesToBigInt("0b10000000");
  transaction.feeBipsA =
    BigInt.fromI32(transaction.orderDataA) & stringBytesToBigInt("0b00111111");
  transaction.fillAmountBorSA = transaction.limitMaskA > BIGINT_ZERO;

  transaction.limitMaskB =
    BigInt.fromI32(transaction.orderDataB) & stringBytesToBigInt("0b10000000");
  transaction.feeBipsB =
    BigInt.fromI32(transaction.orderDataB) & stringBytesToBigInt("0b00111111");
  transaction.fillAmountBorSB = transaction.limitMaskB > BIGINT_ZERO;

  // settlement values
  transaction.fillBA = transaction.fillSB;
  transaction.fillBB = transaction.fillSA;

  transaction.feeA = calculateFee(transaction.fillBA, transaction.feeBipsA);
  transaction.protocolFeeA = calculateProtocolFee(
    transaction.fillBA,
    block.protocolFeeTakerBips
  );

  transaction.feeB = calculateFee(transaction.fillBB, transaction.feeBipsB);
  transaction.protocolFeeB = calculateProtocolFee(
    transaction.fillBB,
    block.protocolFeeMakerBips
  );

  // Update token balances for account A
  let accountTokenBalanceAA = getOrCreateAccountTokenBalance(
    accountAID,
    tokenA.id
  );
  accountTokenBalanceAA.balance = accountTokenBalanceAA.balance.minus(
    transaction.fillSA
  );

  let accountTokenBalanceAB = getOrCreateAccountTokenBalance(
    accountAID,
    tokenB.id
  );
  accountTokenBalanceAB.balance = accountTokenBalanceAB.balance
    .plus(transaction.fillBA)
    .minus(transaction.feeA);

  // Update token balances for account B
  let accountTokenBalanceBB = getOrCreateAccountTokenBalance(
    accountBID,
    tokenB.id
  );
  accountTokenBalanceBB.balance = accountTokenBalanceBB.balance.minus(
    transaction.fillSB
  );

  let accountTokenBalanceBA = getOrCreateAccountTokenBalance(
    accountBID,
    tokenA.id
  );
  accountTokenBalanceBA.balance = accountTokenBalanceBA.balance
    .plus(transaction.fillBB)
    .minus(transaction.feeB);

  // Should also update operator account balance
  let operatorId = intToString(block.operatorAccountID);

  let operatorTokenBalanceA = getOrCreateAccountTokenBalance(
    operatorId,
    tokenA.id
  );
  operatorTokenBalanceA.balance = operatorTokenBalanceA.balance
    .plus(transaction.feeB)
    .minus(transaction.protocolFeeB);

  let operatorTokenBalanceB = getOrCreateAccountTokenBalance(
    operatorId,
    tokenB.id
  );
  operatorTokenBalanceB.balance = operatorTokenBalanceB.balance
    .plus(transaction.feeA)
    .minus(transaction.protocolFeeA);

  // update protocol balance
  let protocolAccount = getProtocolAccount(transaction.id);

  let protocolTokenBalanceA = getOrCreateAccountTokenBalance(
    protocolAccount.id,
    tokenA.id
  );
  protocolTokenBalanceA.balance = protocolTokenBalanceA.balance.plus(
    transaction.protocolFeeB
  );

  let protocolTokenBalanceB = getOrCreateAccountTokenBalance(
    protocolAccount.id,
    tokenB.id
  );
  protocolTokenBalanceB.balance = protocolTokenBalanceB.balance.plus(
    transaction.protocolFeeA
  );

  // Update pair info
  transaction.tokenAPrice = calculatePrice(
    tokenA as Token,
    transaction.fillSA,
    transaction.fillSB
  );
  transaction.tokenBPrice = calculatePrice(
    tokenB as Token,
    transaction.fillSB,
    transaction.fillSA
  );

  let pair = getOrCreatePair(transaction.tokenIDA, transaction.tokenIDB);

  let token0Price =
    transaction.tokenIDA < transaction.tokenIDB
      ? transaction.tokenAPrice
      : transaction.tokenBPrice;
  let token1Price =
    transaction.tokenIDA < transaction.tokenIDB
      ? transaction.tokenBPrice
      : transaction.tokenAPrice;
  let token0Amount =
    transaction.tokenIDA < transaction.tokenIDB
      ? transaction.fillSA
      : transaction.fillSB;
  let token1Amount =
    transaction.tokenIDA < transaction.tokenIDB
      ? transaction.fillSB
      : transaction.fillSA;

  pair.token0Price = token0Price;
  pair.token1Price = token1Price;
  pair.tradedVolumeToken0 = pair.tradedVolumeToken0.plus(token0Amount);
  pair.tradedVolumeToken1 = pair.tradedVolumeToken1.plus(token1Amount);

  tokenA.tradedVolume = tokenA.tradedVolume.plus(transaction.fillSA);
  tokenB.tradedVolume = tokenB.tradedVolume.plus(transaction.fillSB);

  transaction.pair = pair.id;

  let tokenADailyData = getAndUpdateTokenDailyData(
    tokenA as Token,
    block.timestamp
  );
  let tokenAWeeklyData = getAndUpdateTokenWeeklyData(
    tokenA as Token,
    block.timestamp
  );
  let tokenBDailyData = getAndUpdateTokenDailyData(
    tokenB as Token,
    block.timestamp
  );
  let tokenBWeeklyData = getAndUpdateTokenWeeklyData(
    tokenB as Token,
    block.timestamp
  );
  getAndUpdatePairDailyData(
    pair as Pair,
    token0Amount,
    token1Amount,
    block.timestamp
  );
  getAndUpdatePairWeeklyData(
    pair as Pair,
    token0Amount,
    token1Amount,
    block.timestamp
  );

  tokenADailyData.tradedVolume = tokenADailyData.tradedVolume.plus(
    transaction.fillSA
  );
  tokenAWeeklyData.tradedVolume = tokenAWeeklyData.tradedVolume.plus(
    transaction.fillSA
  );
  tokenBDailyData.tradedVolume = tokenBDailyData.tradedVolume.plus(
    transaction.fillSB
  );
  tokenBWeeklyData.tradedVolume = tokenBWeeklyData.tradedVolume.plus(
    transaction.fillSB
  );

  tokenADailyData.save();
  tokenAWeeklyData.save();
  tokenBDailyData.save();
  tokenBWeeklyData.save();
  tokenA.save();
  tokenB.save();
  pair.save();
  protocolAccount.save();
  protocolTokenBalanceA.save();
  protocolTokenBalanceB.save();
  operatorTokenBalanceA.save();
  operatorTokenBalanceB.save();
  accountTokenBalanceAA.save();
  accountTokenBalanceAB.save();
  accountTokenBalanceBA.save();
  accountTokenBalanceBB.save();
  transaction.save();
}

function calculateFee(fillB: BigInt, feeBips: BigInt): BigInt {
  return fillB.times(feeBips).div(BigInt.fromI32(10000));
}

function calculateProtocolFee(fillB: BigInt, protocolFeeBips: i32): BigInt {
  return fillB
    .times(BigInt.fromI32(protocolFeeBips))
    .div(BigInt.fromI32(100000));
}
