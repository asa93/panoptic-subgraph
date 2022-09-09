import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  Deposited,
  PoolStarted,
} from "../generated/templates/PanopticPool/PanopticPool";
import {
  User,
  TokenPosition,
  PanopticPool,
  UserDeposit,
  Token,
} from "../generated/schema";

import { log } from "@graphprotocol/graph-ts";

export function handlePoolStarted(event: PoolStarted): void {
  let panopticPool = PanopticPool.load(event.address.toHex());

  const token0Address = event.params.token0.toHex();
  const token1Address = event.params.token1.toHex();

  if (panopticPool) {
    panopticPool.token0 = token0Address;
    panopticPool.token1 = token1Address;
    panopticPool.save();

    //add tokens
    let token0 = Token.load(token0Address);
    if (!token0) {
      token0 = new Token(token0Address);
      token0.save();
    }
    let token1 = Token.load(token1Address);
    if (!token1) {
      token1 = new Token(token1Address);
      token1.save();
    }
  }
}
export function handleTokenDeposited(event: Deposited): void {
  const id = event.params.user.toHex() + event.address.toHex();

  let userDeposit = UserDeposit.load(id);

  if (!userDeposit) {
    userDeposit = new UserDeposit(id);
    userDeposit.token0Deposit = new BigInt(0);
    userDeposit.token1Deposit = new BigInt(0);
  }
  //assemblyscript issue : ? operator not supported
  let panopticPool = PanopticPool.load(event.address.toHex());

  if (panopticPool) {
    if (event.params.tokenAddress.toHex() == panopticPool.token0)
      userDeposit.token0Deposit += event.params.amount;
    else if (event.params.tokenAddress.toHex() == panopticPool.token1)
      userDeposit.token1Deposit += event.params.amount;
  }
  userDeposit.save();
}
