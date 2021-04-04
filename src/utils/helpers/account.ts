import { Pool, User, AccountTokenBalance } from "../../../generated/schema";
import { BigInt } from "@graphprotocol/graph-ts";
import { compoundId } from "./util";

export function getOrCreateUser(
  id: String,
  createIfNotFound: boolean = true
): User {
  let user = User.load(id);

  if (user == null && createIfNotFound) {
    user = new User(id);
  }

  return user as User;
}

export function getOrCreatePool(
  id: String,
  createIfNotFound: boolean = true
): Pool {
  let pool = Pool.load(id);

  if (pool == null && createIfNotFound) {
    pool = new Pool(id);
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
