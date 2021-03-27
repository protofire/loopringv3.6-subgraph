import { SignatureVerification } from "../../../../generated/schema";

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

export function processSignatureVerification(id: String, data: String, blockId: String): void {
  let transaction = new SignatureVerification(id);
  transaction.data = data;
  transaction.block = blockId;
  transaction.save();
}
