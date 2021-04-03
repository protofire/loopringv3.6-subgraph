import { Pool, User } from "../../../generated/schema";

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
