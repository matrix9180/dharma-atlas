import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  displayWebsite,
  formatPhoneHref,
  formatWebsiteHref,
  hasContactInfo,
} from "@/lib/place-contact";
import {
  formatPlaceOpeningHours,
  hasPlaceOpeningHours,
  placeHoursOpenNow,
} from "@/lib/place-hours";
import type { Place } from "@/types/place";

const place: Place = {
  id: "place-1",
  name: "Practice Hall",
  lat: 0,
  lng: 0,
  tradition: "Zen",
  faith: "Buddhist",
  type: "Temple",
  folder: "",
  address: "",
  phone: null,
  website: null,
};

describe("contact formatting", () => {
  it("formats phone and website links", () => {
    assert.equal(formatPhoneHref("(555) 123-4567"), "tel:5551234567");
    assert.equal(formatPhoneHref("+1 (555) 123-4567"), "tel:+15551234567");
    assert.equal(formatWebsiteHref("example.org"), "https://example.org");
    assert.equal(formatWebsiteHref("http://example.org"), "http://example.org");
    assert.equal(displayWebsite("https://example.org/"), "example.org");
  });

  it("detects available contact info", () => {
    assert.equal(hasContactInfo(place), false);
    assert.equal(hasContactInfo({ ...place, address: "123 Main St" }), true);
    assert.equal(hasContactInfo({ ...place, phone: "555" }), true);
    assert.equal(hasContactInfo({ ...place, website: "example.org" }), true);
  });
});

describe("place hours formatting", () => {
  it("filters blank hour descriptions", () => {
    const hours = formatPlaceOpeningHours({
      weekdayDescriptions: ["Monday: Open", " ", "Tuesday: Closed"],
    });

    assert.deepEqual(hours, ["Monday: Open", "Tuesday: Closed"]);
  });

  it("reports whether a place has hours and is open now", () => {
    assert.equal(hasPlaceOpeningHours(place), false);
    assert.equal(
      hasPlaceOpeningHours({
        ...place,
        openingHours: { weekdayDescriptions: ["Monday: Open"] },
      }),
      true,
    );
    assert.equal(placeHoursOpenNow({ ...place, openingHours: { openNow: true } }), true);
    assert.equal(placeHoursOpenNow(place), undefined);
  });
});
