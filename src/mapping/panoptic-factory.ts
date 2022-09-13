import { BigInt } from "@graphprotocol/graph-ts";
import {
  PanopticFactory,
  PoolDeployed,
} from "../../generated/PanopticFactory/PanopticFactory";
import { PanopticPool } from "../../generated/schema";
import { PanopticPool as PanopticPoolContract } from "../../generated/templates";

export function handlePoolDeployed(event: PoolDeployed): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = PanopticPool.load(event.params.poolAddress.toHex());

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new PanopticPool(event.params.poolAddress.toHex());

    // Entity fields can be set using simple assignments
  }

  // Entity fields can be set based on event parameters
  entity.poolAddress = event.params.poolAddress;
  entity.uniSwapPool = event.params.uniSwapPool;
  entity.totalVolume = new BigInt(0);
  entity.totalDepositToken0 = new BigInt(0);
  entity.totalDepositToken1 = new BigInt(10);
  // Entities can be written to the store with `.save()`
  entity.save();

  //index new contract
  PanopticPoolContract.create(event.params.poolAddress);

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.getProxyAdmin(...)
  // - contract.getProxyImplementation(...)
  // - contract.owner(...)
}
