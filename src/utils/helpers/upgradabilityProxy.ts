import { Proxy, Exchange } from "../../../generated/schema";
import { Address, log } from "@graphprotocol/graph-ts";

export function getProxy(): Proxy {
  let proxy = Proxy.load("0");

  if (proxy == null) {
    proxy = new Proxy("0");

    proxy.save();
  }

  return proxy as Proxy;
}

export function getOrCreateExchange(
  id: String,
  createIfNotFound: boolean = true
): Exchange {
  let exchange = Exchange.load(id);

  if (exchange == null && createIfNotFound) {
    exchange = new Exchange(id);
  }

  return exchange as Exchange;
}
