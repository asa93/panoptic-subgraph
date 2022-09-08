import { BigInt } from "@graphprotocol/graph-ts";

import {
  Deposited,
  PoolStarted,
} from "../generated/templates/PanopticPool/PanopticPool";
import {
  User,
  TokenPosition,
  PanopticPool,
  UserDeposit,
} from "../generated/schema";

import { log } from "@graphprotocol/graph-ts";

export function handlePoolStarted(event: PoolStarted): void {
  let panopticPool = PanopticPool.load(event.address.toHex());

  if (panopticPool) {
    panopticPool.token0 = event.params.token0.toHex();
    panopticPool.token1 = event.params.token1.toHex();
    panopticPool.save();
  }
}
export function handleTokenDeposited(event: Deposited): void {
  const id = event.params.user.toHex() + event.address.toHex();

  let userDeposit = UserDeposit.load(id);

  //figure out if token0 or token1 with event.params.tokenAddress
  if (userDeposit) {
    userDeposit.token0Deposit = event.params.amount;
  } else {
    userDeposit = new UserDeposit(id);
    userDeposit.token0Deposit = event.params.amount;
  }
  userDeposit.save();
}
