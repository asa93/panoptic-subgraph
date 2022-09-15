import { BigInt, ethereum } from "@graphprotocol/graph-ts";

import {
  Deposited,
  PoolStarted,
  Withdrawn,
} from "../../generated/templates/PanopticPool/PanopticPool";
import {
  User,
  TokenPosition,
  PanopticPool,
  UserDeposit,
  Token,
} from "../../generated/schema";

import {
  updatepanopticPoolDayData,
  updateTokenDayData,
} from "../utils/dayInterval";
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
      token0.totalVolume = new BigInt(0);
      token0.save();
    }
    let token1 = Token.load(token1Address);
    if (!token1) {
      token1 = new Token(token1Address);
      token1.totalVolume = new BigInt(0);
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

  // update pool
  let panopticPool = PanopticPool.load(event.address.toHex());

  if (panopticPool) {
    let panopticPoolDayData = updatepanopticPoolDayData(event);
    if (event.params.tokenAddress.toHex() == panopticPool.token0) {
      userDeposit.token0Deposit += event.params.amount;
      panopticPool.totalDepositToken0 += event.params.amount;
      panopticPool.totalVolumeToken0 += event.params.amount;
      panopticPoolDayData.volumeToken0 += event.params.amount;
    } else if (event.params.tokenAddress.toHex() == panopticPool.token1) {
      userDeposit.token1Deposit += event.params.amount;
      panopticPool.totalDepositToken1 += event.params.amount;
      panopticPool.totalVolumeToken1 += event.params.amount;
      panopticPoolDayData.volumeToken1 += event.params.amount;
    }
    panopticPool.save();
    panopticPoolDayData.save();
  }
  //update token
  let token = Token.load(event.params.tokenAddress.toHex());
  if (token) {
    token.totalVolume += event.params.amount;
    token.save();

    let tokenDayData = updateTokenDayData(event);
    tokenDayData.volume += event.params.amount;
    tokenDayData.save();
  }

  userDeposit.save();
}

export function handleTokenWithdrawn(event: Withdrawn): void {
  const id = event.params.user.toHex() + event.address.toHex();

  let userDeposit = UserDeposit.load(id);

  if (!userDeposit) return;

  let panopticPool = PanopticPool.load(event.address.toHex());

  if (panopticPool) {
    let panopticPoolDayData = updatepanopticPoolDayData(event);

    if (event.params.tokenAddress.toHex() == panopticPool.token0) {
      userDeposit.token0Deposit -= event.params.amount;
      panopticPool.totalDepositToken0 -= event.params.amount;
      panopticPool.totalVolumeToken0 += event.params.amount;
      panopticPoolDayData.volumeToken0 += event.params.amount;
    } else if (event.params.tokenAddress.toHex() == panopticPool.token1) {
      userDeposit.token1Deposit -= event.params.amount;
      panopticPool.totalDepositToken1 -= event.params.amount;
      panopticPool.totalVolumeToken1 += event.params.amount;
      panopticPoolDayData.volumeToken1 += event.params.amount;
    }

    panopticPool.save();
    panopticPoolDayData.save();
  }

  let token = Token.load(event.params.tokenAddress.toHex());
  if (token) {
    token.totalVolume += event.params.amount;
    token.save();

    let tokenDayData = updateTokenDayData(event);
    tokenDayData.volume += event.params.amount;
    tokenDayData.save();
  }

  userDeposit.save();
}
