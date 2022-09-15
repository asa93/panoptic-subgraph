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
  PanopticPoolDayData,
  TokenDayData,
} from "../../generated/schema";

import { log } from "@graphprotocol/graph-ts";

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
export function updatepanopticPoolDayData(
  event: ethereum.Event
): PanopticPoolDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400; // rounded
  let dayStartTimestamp = dayID * 86400;
  let panopticPoolDayData = PanopticPoolDayData.load(dayID.toString());
  if (panopticPoolDayData === null) {
    panopticPoolDayData = new PanopticPoolDayData(dayID.toString());
    panopticPoolDayData.date = dayStartTimestamp;
    panopticPoolDayData.volumeToken0 = BigInt.fromI32(0);
    panopticPoolDayData.volumeToken1 = BigInt.fromI32(0);
  }

  panopticPoolDayData.save();
  return panopticPoolDayData as PanopticPoolDayData;
}

/**
 * Tracks global aggregate data over daily windows
 * @param event
 */
export function updateTokenDayData(event: ethereum.Event): TokenDayData {
  let timestamp = event.block.timestamp.toI32();
  let dayID = timestamp / 86400; // rounded
  let dayStartTimestamp = dayID * 86400;
  let tokenDayData = TokenDayData.load(dayID.toString());
  if (tokenDayData === null) {
    tokenDayData = new TokenDayData(dayID.toString());
    tokenDayData.date = dayStartTimestamp;
    tokenDayData.volume = BigInt.fromI32(0);
  }

  tokenDayData.save();
  return tokenDayData as TokenDayData;
}
