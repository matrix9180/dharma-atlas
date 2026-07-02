import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  entityFilterFromPath,
  isExplorePath,
  pathFromEntityFilter,
  personProfilePath,
} from "@/lib/explore-routes";
import { isAdminRole } from "@/lib/permissions";
import {
  composeSubmissionNotes,
  publicSubmissionSchema,
} from "@/lib/validations/submission";

describe("explore routes", () => {
  it("maps entity filters to paths", () => {
    assert.equal(pathFromEntityFilter("all"), "/");
    assert.equal(pathFromEntityFilter("locations"), "/locations");
    assert.equal(pathFromEntityFilter("people"), "/people");
    assert.equal(personProfilePath("jane-teacher"), "/person/jane-teacher");
  });

  it("infers entity filters from paths", () => {
    assert.equal(entityFilterFromPath("/locations"), "locations");
    assert.equal(entityFilterFromPath("/place/place-1"), "locations");
    assert.equal(entityFilterFromPath("/people"), "people");
    assert.equal(entityFilterFromPath("/person/jane-teacher"), "people");
    assert.equal(entityFilterFromPath("/about"), "all");
  });

  it("recognizes top-level explore paths", () => {
    assert.equal(isExplorePath("/"), true);
    assert.equal(isExplorePath("/all"), true);
    assert.equal(isExplorePath("/locations"), true);
    assert.equal(isExplorePath("/people"), true);
    assert.equal(isExplorePath("/place/place-1"), false);
  });
});

describe("submission validation", () => {
  it("accepts a valid location submission", () => {
    const parsed = publicSubmissionSchema.parse({
      entryType: "location",
      submitterName: "Ada",
      submitterEmail: "ada@example.org",
      name: "Practice Hall",
      website: "",
      location: "Portland, OR",
      placeType: "Temple",
      tradition: "Zen",
      address: "123 Main St",
    });

    assert.equal(parsed.entryType, "location");
  });

  it("rejects invalid submitter email", () => {
    assert.throws(() =>
      publicSubmissionSchema.parse({
        entryType: "teacher",
        submitterName: "Ada",
        submitterEmail: "not an email",
        name: "Teacher",
      }),
    );
  });

  it("composes trimmed notes for locations and teachers", () => {
    assert.equal(
      composeSubmissionNotes({
        entryType: "location",
        submitterName: "Ada",
        submitterEmail: "ada@example.org",
        name: "Practice Hall",
        website: "",
        location: "Portland",
        placeType: "Temple",
        tradition: " Zen ",
        address: " 123 Main ",
        notes: " Bring context ",
      }),
      "Type: Temple\n\nTradition: Zen\n\nAddress: 123 Main\n\nBring context",
    );

    assert.equal(
      composeSubmissionNotes({
        entryType: "teacher",
        submitterName: "Ada",
        submitterEmail: "ada@example.org",
        name: "Teacher",
        website: "",
        tradition: " Theravada ",
        lineage: " Forest ",
      }),
      "Tradition: Theravada\n\nLineage: Forest",
    );
  });
});

describe("roles", () => {
  it("recognizes admin roles", () => {
    assert.equal(isAdminRole("owner"), true);
    assert.equal(isAdminRole("editor"), true);
    assert.equal(isAdminRole("member"), false);
    assert.equal(isAdminRole(null), false);
  });
});
