import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  inferCoordPrecisionFromFolder,
  isBadWebsite,
  isSuspiciousCoord,
  mergePlaceFields,
  normalizeWebsiteHost,
  pickHigherPrecision,
} from "@/lib/place-quality";

describe("place quality helpers", () => {
  it("normalizes website hosts consistently", () => {
    assert.equal(normalizeWebsiteHost("www.Example.org/"), "example.org");
    assert.equal(normalizeWebsiteHost("example.org/path/"), "example.org/path");
    assert.equal(normalizeWebsiteHost(""), null);
    assert.equal(normalizeWebsiteHost("not a url with spaces"), null);
  });

  it("flags known bad website hosts", () => {
    assert.equal(isBadWebsite("https://facebook.com/example"), true);
    assert.equal(isBadWebsite("https://foo.mapof.it/place"), true);
    assert.equal(isBadWebsite("https://temple.example"), false);
  });

  it("ranks coordinate precision", () => {
    assert.equal(pickHigherPrecision("pin", "city"), "pin");
    assert.equal(pickHigherPrecision("unknown", "address"), "address");
  });

  it("infers precision from source folders", () => {
    assert.equal(inferCoordPrecisionFromFolder("BuddhaNet Thailand"), "region");
    assert.equal(inferCoordPrecisionFromFolder("Goenka Vipassana Europe"), "city");
    assert.equal(inferCoordPrecisionFromFolder("Tibetan"), "pin");
    assert.equal(inferCoordPrecisionFromFolder("Mystery feed"), "unknown");
  });

  it("detects suspicious centroid coordinates", () => {
    assert.equal(isSuspiciousCoord(51.16, 10.45), true);
    assert.equal(isSuspiciousCoord(40.7128, -74.006), false);
  });

  it("preserves verified fields while merging incoming place data", () => {
    const merged = mergePlaceFields(
      {
        name: "Verified Center",
        website: "https://verified.example",
        lat: 10,
        lng: 20,
        coordPrecision: "pin",
        verifiedFields: ["name", "website"],
      },
      {
        name: "Incoming Center",
        website: "https://incoming.example",
        lat: 11,
        lng: 21,
        coordPrecision: "city",
      },
    );

    assert.equal(merged.name, "Verified Center");
    assert.equal(merged.website, "https://verified.example");
    assert.equal(merged.lat, 10);
    assert.equal(merged.lng, 20);
    assert.equal(merged.coordPrecision, "pin");
  });

  it("allows forced fields and strips bad websites", () => {
    const merged = mergePlaceFields(
      {
        website: "https://facebook.com/old",
        verifiedFields: ["website"],
      },
      {
        website: "https://temple.example",
        description: "Needs review",
      },
      { forceFields: ["website"] },
    );

    assert.equal(merged.website, "https://temple.example");
    assert.deepEqual(merged.qualityFlags, ["unverified_description"]);
  });
});
