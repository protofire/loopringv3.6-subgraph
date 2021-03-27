import { BigInt, log } from "@graphprotocol/graph-ts";

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
