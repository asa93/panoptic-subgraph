import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

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
  TokenDayData,
} from "../../generated/schema";

import {
  updatepanopticPoolDayData,
  updateTokenDayData,
} from "../utils/dayInterval";
import { log } from "@graphprotocol/graph-ts";

import { Token as TokenContract } from "../../generated/templates/Token/Token";

export function handlePoolStarted(event: PoolStarted): void {
  let panopticPool = createPanopticPoolIfNotExisted(event.address);

  const token0Address = event.params.token0;
  const token1Address = event.params.token1;

  panopticPool.token0 = token0Address.toHex();
  panopticPool.token1 = token1Address.toHex();
  panopticPool.save();

  //add tokens
  let token0 = createTokenIfNotExisted(token0Address);
  let token1 = createTokenIfNotExisted(token1Address);
}
export function handleTokenDeposited(event: Deposited): void {
  const id = event.params.user.toHex() + event.address.toHex();

  let userDeposit = createUserDepositIfNotExisted(id);

  // update pool
  let panopticPool = createPanopticPoolIfNotExisted(event.address);

  let panopticPoolDayData = updatepanopticPoolDayData(event);
  if (event.params.tokenAddress.toHex() == panopticPool.token0) {
    userDeposit.token0Deposit += event.params.amount;
    panopticPool.tvlToken0 += event.params.amount;
    panopticPool.totalVolumeToken0 += event.params.amount;
    panopticPoolDayData.volumeToken0 += event.params.amount;
  } else if (event.params.tokenAddress.toHex() == panopticPool.token1) {
    userDeposit.token1Deposit += event.params.amount;
    panopticPool.tvlToken1 += event.params.amount;
    panopticPool.totalVolumeToken1 += event.params.amount;
    panopticPoolDayData.volumeToken1 += event.params.amount;
  }
  panopticPool.save();
  panopticPoolDayData.save();

  //update token
  let token = createTokenIfNotExisted(event.params.tokenAddress);
  token.totalVolume += event.params.amount;
  token.totalValueLocked += event.params.amount;
  token.save();

  let tokenDayData = updateTokenDayData(event, event.params.tokenAddress);
  tokenDayData.volume += event.params.amount;
  tokenDayData.save();

  userDeposit.save();
}

export function handleTokenWithdrawn(event: Withdrawn): void {
  const id = event.params.user.toHex() + event.address.toHex();

  let userDeposit = UserDeposit.load(id);

  if (!userDeposit) return;

  let panopticPool = createPanopticPoolIfNotExisted(event.address);
  let panopticPoolDayData = updatepanopticPoolDayData(event);

  if (event.params.tokenAddress.toHex() == panopticPool.token0) {
    userDeposit.token0Deposit -= event.params.amount;
    panopticPool.tvlToken0 -= event.params.amount;
    panopticPool.totalVolumeToken0 += event.params.amount;
    panopticPoolDayData.volumeToken0 += event.params.amount;
  } else if (event.params.tokenAddress.toHex() == panopticPool.token1) {
    userDeposit.token1Deposit -= event.params.amount;
    panopticPool.tvlToken1 -= event.params.amount;
    panopticPool.totalVolumeToken1 += event.params.amount;
    panopticPoolDayData.volumeToken1 += event.params.amount;
  }

  panopticPool.save();
  panopticPoolDayData.save();

  let token = createTokenIfNotExisted(event.params.tokenAddress);
  token.totalVolume += event.params.amount;
  token.totalValueLocked -= event.params.amount;
  token.save();

  let tokenDayData = updateTokenDayData(event, event.params.tokenAddress);
  tokenDayData.volume += event.params.amount;
  tokenDayData.save();

  userDeposit.save();
}

export function createTokenIfNotExisted(address: Address): Token {
  let token = Token.load(address.toHex());

  if (token === null) {
    token = new Token(address.toHex());
    token.totalVolume = new BigInt(0);
    token.totalValueLocked = new BigInt(0);
    let tokenContract = TokenContract.bind(address);
    token.name = tokenContract.name();
    token.save();
  }
  return token;
}

export function createPanopticPoolIfNotExisted(address: Address): PanopticPool {
  let pool = PanopticPool.load(address.toHex());
  if (pool === null) {
    pool = new PanopticPool(address.toHex());
    pool.poolAddress = address;
    pool.totalVolumeToken0 = new BigInt(0);
    pool.totalVolumeToken1 = new BigInt(0);
    pool.tvlToken0 = new BigInt(0);
    pool.tvlToken1 = new BigInt(10);
    pool.save();
  }
  return pool;
}

export function createUserDepositIfNotExisted(address: string): UserDeposit {
  let userDeposit = UserDeposit.load(address);
  if (userDeposit === null) {
    userDeposit = new UserDeposit(address);
    userDeposit.token0Deposit = new BigInt(0);
    userDeposit.token1Deposit = new BigInt(0);
    userDeposit.save();
  }
  return userDeposit;
}
