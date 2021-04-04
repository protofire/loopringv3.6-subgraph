import { BigInt } from "@graphprotocol/graph-ts";

export function intToString(value: i32): String {
  return BigInt.fromI32(value).toString();
}

export function compoundId(a: String, b: String): String {
  return a.concat("-").concat(b);
}
