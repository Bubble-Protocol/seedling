import { UserTransferred } from './../generated/UserRegistry/UserRegistry';
// Import necessary classes, types and functions
import { store } from '@graphprotocol/graph-ts'
import {
  UserRegistered as UserRegisteredEvent,
  UserDeregistered as UserDeregisteredEvent,
  UserTransferred as UserTransferredEvent,
} from "../generated/UserRegistry/UserRegistry"
import { User } from "../generated/schema"

// Handler for the UserRegistered event
export function handleRegisteredUser(event: UserRegisteredEvent): void {
  let user = new User(event.params.id.toHex())
  user.address = event.params.user
  user.username = event.params.username
  user.registeredAt = event.block.timestamp
  user.save();
}

// Handler for the UserDeregistered event
export function handleDeregisteredUser(event: UserDeregisteredEvent): void {
  let user = User.load(event.params.id.toHex())
  if (user != null) {
    // TODO remove all content from that user?
    store.remove("User", user.id);
  }
}

// Handler for the UserTransferred event
export function handleTransferredUser(event: UserTransferredEvent): void {
  let user = new User(event.params.id.toHex())
  user.address = event.params.user
  user.save();
}


