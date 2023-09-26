// Import necessary classes, types and functions
import { store } from '@graphprotocol/graph-ts'
import {
  PublishedContent as ContentPublishedEvent,
  DeletedContent as ContentDeletedEvent,
} from "../generated/ContentRegistry/ContentRegistry"
import { Content } from "../generated/schema"

// Handler for the ContentPublished event
export function handleContentPublished(event: ContentPublishedEvent): void {
  let content = new Content(event.params.hash.toHex())
  content.contentHash = event.params.hash
  content.url = event.params.url
  content.author = event.params.author.toHex()
  content.publishedAt = event.block.timestamp
  content.save()
}

// Handler for the ContentDeleted event
export function handleContentDeleted(event: ContentDeletedEvent): void {
  let content = Content.load(event.params.hash.toHex())
  if (content != null) {
    store.remove("Content", content.id);
  }
}
