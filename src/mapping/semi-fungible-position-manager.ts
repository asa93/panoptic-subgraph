import { BigInt } from "@graphprotocol/graph-ts";
import {
  SemiFungiblePositionManager,
  TokenizedPositionMinted,
  TokenizedPositionBurnt,
  TokenizedPositionRolled,
} from "../../generated/SemiFungiblePositionManager/SemiFungiblePositionManager";
import { User, TokenPosition } from "../../generated/schema";

export function createUserTokenPositionIfNotExisted(
  id: string,
  user: User,
  tokenId: BigInt
): TokenPosition {
  let tokenPosition = TokenPosition.load(id);
  if (tokenPosition === null) {
    tokenPosition = new TokenPosition(id);
    tokenPosition.user = user.id;
    tokenPosition.tokenId = tokenId;
    tokenPosition.save();
  }
  return tokenPosition;
}

export function createUserIfNotExisted(userAddress: string): User {
  let user = User.load(userAddress);
  if (user === null) {
    user = new User(userAddress);
    user.save();
  }
  return user;
}

export function handleTokenizedPositionMinted(
  event: TokenizedPositionMinted
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type

  // let user = createUserIfNotExisted(event.params.recipient.toHex());
  // let tokenPosition = createUserTokenPositionIfNotExisted(
  //   event.params.tokenId.toString() + "-" + event.params.recipient.toHex(),
  //   user,
  //   event.params.tokenId
  // );

  let tokenPosition = new TokenPosition(event.params.recipient.toHex());
  tokenPosition.position = event.params.numberOfContracts;
  tokenPosition.tokenId = event.params.tokenId;
  tokenPosition.user = event.params.recipient.toHex();
  //tokenPosition.endUser = event.params.endUser.toHex();
  tokenPosition.save();

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

export function handleTokenizedPositionBurnt(
  event: TokenizedPositionBurnt
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let user = createUserIfNotExisted(event.params.recipient.toHex());
  let tokenPosition = createUserTokenPositionIfNotExisted(
    event.params.tokenId.toString() + "-" + event.params.recipient.toHex(),
    user,
    event.params.tokenId
  );
  tokenPosition.position =
    tokenPosition.position - event.params.numberOfContracts;
  tokenPosition.save();
}

export function handleTokenizedPositionRolled(
  event: TokenizedPositionRolled
): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let user = createUserIfNotExisted(event.params.recipient.toHex());
  let oldTokenPosition = createUserTokenPositionIfNotExisted(
    event.params.oldTokenId.toString() + "-" + event.params.recipient.toHex(),
    user,
    event.params.oldTokenId
  );
  oldTokenPosition.position =
    oldTokenPosition.position - event.params.numberOfContracts;
  oldTokenPosition.save();

  let newTokenPosition = createUserTokenPositionIfNotExisted(
    event.params.newTokenId.toString() + "-" + event.params.recipient.toHex(),
    user,
    event.params.newTokenId
  );
  newTokenPosition.position =
    newTokenPosition.position - event.params.numberOfContracts;
  newTokenPosition.save();
}
