import {
  Pool,
  User,
  AccountTokenBalance,
  ProtocolAccount
} from "../../../generated/schema";
import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { compoundId, intToString } from "./util";
import { ZERO_ADDRESS } from "../constants";

export function getOrCreateUser(
  id: String,
  transactionId: String,
  addressString: String,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
    user.createdAt = transactionId;
    user.lastUpdatedAt = transactionId;
    user.address = Address.fromString(addressString) as Bytes;

    user.save();
  }

  return user as User;
}

export function getOrCreatePool(
  id: String,
  transactionId: String,
  addressString: String,
  createIfNotFound: boolean = true
): Pool {
  let pool = Pool.load(id);

  if (pool == null && createIfNotFound) {
    pool = new Pool(id);
    pool.createdAt = transactionId;
    pool.lastUpdatedAt = transactionId;
    pool.address = Address.fromString(addressString) as Bytes;

    pool.save();
  }

  return pool as Pool;
}

export function getOrCreateAccountTokenBalance(
  accountId: String,
  tokenId: String,
  createIfNotFound: boolean = true
): AccountTokenBalance {
  let id = compoundId(accountId, tokenId);
  let balance = AccountTokenBalance.load(id);

  if (balance == null && createIfNotFound) {
    balance = new AccountTokenBalance(id);
    balance.balance = BigInt.fromI32(0);
    balance.account = accountId;
    balance.token = tokenId;
  }

  return balance as AccountTokenBalance;
}

export function getProtocolAccount(transactionId: String): ProtocolAccount {
  let account = ProtocolAccount.load("0");

  if (account == null) {
    account = new ProtocolAccount("0");
    account.address = Address.fromString(ZERO_ADDRESS) as Bytes;
    account.createdAt = transactionId;
    account.lastUpdatedAt = transactionId;

    account.save();
  }

  return account as ProtocolAccount;
}

export function createIfNewAccount(
  accountId: i32,
  transactionId: String,
  addressString: String
): void {
  if (accountId > 10000) {
    getOrCreateUser(intToString(accountId), transactionId, addressString);
  } else {
    getOrCreatePool(intToString(accountId), transactionId, addressString);
  }
}
