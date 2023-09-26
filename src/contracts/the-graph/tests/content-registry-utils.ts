import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  DeletedContent,
  PublishedContent
} from "../generated/ContentRegistry/ContentRegistry"

export function createDeletedContentEvent(
  hash: Bytes,
  time: BigInt
): DeletedContent {
  let deletedContentEvent = changetype<DeletedContent>(newMockEvent())

  deletedContentEvent.parameters = new Array()

  deletedContentEvent.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromFixedBytes(hash))
  )
  deletedContentEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )

  return deletedContentEvent
}

export function createPublishedContentEvent(
  hash: Bytes,
  url: string,
  author: Address,
  time: BigInt
): PublishedContent {
  let publishedContentEvent = changetype<PublishedContent>(newMockEvent())

  publishedContentEvent.parameters = new Array()

  publishedContentEvent.parameters.push(
    new ethereum.EventParam("hash", ethereum.Value.fromFixedBytes(hash))
  )
  publishedContentEvent.parameters.push(
    new ethereum.EventParam("url", ethereum.Value.fromString(url))
  )
  publishedContentEvent.parameters.push(
    new ethereum.EventParam("author", ethereum.Value.fromAddress(author))
  )
  publishedContentEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )

  return publishedContentEvent
}
