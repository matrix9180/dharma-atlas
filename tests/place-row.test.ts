import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { rowToPlace } from "@/lib/place-row";
import type { PlaceRow } from "@/db/schema";

function baseRow(overrides: Partial<PlaceRow> = {}): PlaceRow {
  return {
    id: "place-1",
    name: "Practice Hall",
    lat: 12.3,
    lng: 45.6,
    tradition: "Zen",
    faith: "Buddhist",
    type: "Temple",
    folder: "Tibetan",
    address: "123 Main St",
    phone: null,
    website: null,
    schools: [],
    description: null,
    descriptionSource: null,
    coordPrecision: "pin",
    dataSource: null,
    verifiedAt: null,
    verifiedFields: [],
    qualityFlags: [],
    photo: null,
    photoSource: null,
    googlePlaceId: null,
    googleMapsUri: null,
    openingHours: null,
    googleRating: null,
    googleRatingCount: null,
    businessStatus: null,
    googlePrimaryType: null,
    isDraft: false,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

describe("rowToPlace", () => {
  it("omits empty optional array and nullable fields", () => {
    const place = rowToPlace(baseRow());

    assert.equal(place.id, "place-1");
    assert.equal(place.website, null);
    assert.equal(place.schools, undefined);
    assert.equal(place.verifiedFields, undefined);
    assert.equal(place.qualityFlags, undefined);
    assert.equal(place.openingHours, undefined);
  });

  it("maps populated optional fields", () => {
    const place = rowToPlace(
      baseRow({
        schools: ["rinzai"],
        description: "A quiet place.",
        verifiedAt: new Date("2026-03-04T05:06:07.000Z"),
        verifiedFields: ["website"],
        qualityFlags: ["stacked_coords"],
        photo: "/places/place-1.jpg",
        photoSource: "admin",
        openingHours: JSON.stringify({
          weekdayDescriptions: ["Monday: 9 AM - 5 PM"],
          openNow: true,
          source: "google_places",
        }),
        googleRating: 4.7,
        googleRatingCount: 42,
      }),
    );

    assert.deepEqual(place.schools, ["rinzai"]);
    assert.equal(place.description, "A quiet place.");
    assert.equal(place.verifiedAt, "2026-03-04T05:06:07.000Z");
    assert.deepEqual(place.verifiedFields, ["website"]);
    assert.deepEqual(place.qualityFlags, ["stacked_coords"]);
    assert.equal(place.photo, "/places/place-1.jpg");
    assert.equal(place.photoSource, "admin");
    assert.deepEqual(place.openingHours?.weekdayDescriptions, ["Monday: 9 AM - 5 PM"]);
    assert.equal(place.openingHours?.openNow, true);
    assert.equal(place.googleRating, 4.7);
    assert.equal(place.googleRatingCount, 42);
  });

  it("ignores invalid opening hours JSON", () => {
    const place = rowToPlace(baseRow({ openingHours: "{nope" }));

    assert.equal(place.openingHours, undefined);
  });
});
