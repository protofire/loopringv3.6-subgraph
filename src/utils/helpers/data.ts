import { Bytes, BigInt, log } from "@graphprotocol/graph-ts";
import { intToString } from "./index";

export function extractData(data: String, offset: i32, length: i32): String {
  let start = offset * 2;
  let end = start + length * 2;
  if (data.length < end) {
    log.warning("Index out of range. end {}, length {}", [
      intToString(end),
      intToString(data.length)
    ]);
  }
  return data.slice(start, end);
}

export function extractInt(data: String, offset: i32, length: i32): i32 {
  // We reverse the by data since fromUnsignedBytes assumes little endian and the data is big endian.
  return BigInt.fromUnsignedBytes(
    Bytes.fromHexString(extractData(data, offset, length)).reverse() as Bytes
  ).toI32();
}

export function extractBigInt(data: String, offset: i32, length: i32): BigInt {
  return BigInt.fromUnsignedBytes(
    Bytes.fromHexString(extractData(data, offset, length)).reverse() as Bytes
  );
}

export function stringBytesToI32(data: String): i32 {
  return stringBytesToBigInt(data).toI32();
}

export function stringBytesToBigInt(data: String): BigInt {
  return BigInt.fromUnsignedBytes(
    Bytes.fromHexString(data).reverse() as Bytes
  );
}

export function extractBigIntFromFloat(
  data: String,
  offset: i32,
  length: i32,
  numBitsExponent: i32,
  numBitsMantissa: i32,
  exponentBase: i32
): BigInt {
  let f = extractInt(data, offset, length);
  let exponent = f >> numBitsMantissa;
  let mantissa = BigInt.fromI32(f & ((1 << numBitsMantissa) - 1));
  let expSide = BigInt.fromI32(exponentBase).pow(exponent as u8);
  let value = mantissa * expSide;
  return value;
}

// Float24Encoding = FloatEncoding(5, 19, 10)
// Float16Encoding = FloatEncoding(5, 11, 10)
// Float12Encoding = FloatEncoding(5,  7, 10)
