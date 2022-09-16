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
  UniswapV3Pool,
} from "../../generated/schema";
