import { BigInt } from "@graphprotocol/graph-ts";

import { Deposited } from "../generated/templates/PanopticPool/PanopticPool";
import { User, TokenPosition, PanopticPool } from "../generated/schema";

export function handleTokenDeposited(event: Deposited): void {
  let panopticpool = PanopticPool.load(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );

  if (panopticpool) {
    panopticpool.nbDeposits++;

    panopticpool.save();
  }
}
