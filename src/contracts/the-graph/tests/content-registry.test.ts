import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { DeletedContent } from "../generated/schema"
import { DeletedContent as DeletedContentEvent } from "../generated/ContentRegistry/ContentRegistry"
import { handleDeletedContent } from "../src/content-registry"
import { createDeletedContentEvent } from "./content-registry-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let hash = Bytes.fromI32(1234567890)
    let time = BigInt.fromI32(234)
    let newDeletedContentEvent = createDeletedContentEvent(hash, time)
    handleDeletedContent(newDeletedContentEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("DeletedContent created and stored", () => {
    assert.entityCount("DeletedContent", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "DeletedContent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "hash",
      "1234567890"
    )
    assert.fieldEquals(
      "DeletedContent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "time",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
