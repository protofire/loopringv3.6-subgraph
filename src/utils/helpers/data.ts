import { Bytes, BigInt, log } from "@graphprotocol/graph-ts";

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

export function extractInt(data: String, offset: i32, length: i32): i32 {
  // We reverse the by data since fromUnsignedBytes assumes little endian and the data is big endian.
  return BigInt.fromUnsignedBytes(Bytes.fromHexString(extractData(data, offset, length)).reverse() as Bytes).toI32()
}

export function extractBigInt(data: String, offset: i32, length: i32): BigInt {
  return BigInt.fromUnsignedBytes(Bytes.fromHexString(extractData(data, offset, length)).reverse() as Bytes)
}
