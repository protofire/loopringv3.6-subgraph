import { Pool } from "../../../generated/schema";

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
