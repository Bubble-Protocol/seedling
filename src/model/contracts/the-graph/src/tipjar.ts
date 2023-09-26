// Import necessary classes, types and functions
import { Tip as TipEvent } from "../generated/TipJar/TipJar"
import { Tip } from "../generated/schema"

// Handler for the Tip event
export function handleTip(event: TipEvent): void {
  let id = event.params.contentId.toHex() + "-" + event.params.total.toString();
  let tip = new Tip(id);
  tip.contentId = event.params.contentId;
  tip.tipper = event.params.tipper;
  tip.amount = event.params.amount;
  tip.total = event.params.total;
  tip.tippedAt = event.block.timestamp
  tip.save();
}
