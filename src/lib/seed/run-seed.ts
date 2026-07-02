import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db/node-client";
import {
  ontologyNodes,
  places,
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "@/db/schema";
import { mergePlaceFields } from "@/lib/place-quality";
import { rowToPlace } from "@/lib/place-row";
import type { Place, PlacesDataset } from "@/types/place";
import type { Teacher, TeachersDataset } from "@/types/teacher";

export type SeedOptions = {
  places?: Place[];
  teachers?: Teacher[];
  fromFiles?: boolean;
  includeOntology?: boolean;
  forceFields?: string[];
};

export type SeedResult = {
  places: number;
  teachers: number;
  ontologyNodes: number;
};

const SELECT_CHUNK_SIZE = 1_000;
const INSERT_CHUNK_SIZE = 250;

type PlaceInsert = typeof places.$inferInsert;
type TeacherInsert = typeof teachers.$inferInsert;
type TeacherBookInsert = typeof teacherBooks.$inferInsert;
type TeacherRelationInsert = typeof teacherRelations.$inferInsert;
type TeacherRetreatInsert = typeof teacherRetreats.$inferInsert;
type TeacherSocialInsert = typeof teacherSocials.$inferInsert;

function excluded(column: { name: string }) {
  return sql.raw(`excluded.${column.name}`);
}

function chunks<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
}

function openingHoursColumn(
  hours: Place["openingHours"] | undefined | null,
): string | null {
  if (!hours) return null;
  return JSON.stringify(hours);
}

function placeDbFields(merged: ReturnType<typeof mergePlaceFields>, incoming: Place) {
  return {
    name: merged.name ?? incoming.name,
    lat: merged.lat ?? incoming.lat,
    lng: merged.lng ?? incoming.lng,
    tradition: merged.tradition ?? incoming.tradition,
    faith: merged.faith ?? incoming.faith,
    type: merged.type ?? incoming.type,
    folder: merged.folder ?? incoming.folder,
    address: merged.address ?? incoming.address,
    phone: merged.phone ?? incoming.phone ?? null,
    website: merged.website ?? incoming.website ?? null,
    description: merged.description ?? incoming.description ?? null,
    descriptionSource: merged.descriptionSource ?? incoming.descriptionSource ?? null,
    coordPrecision: merged.coordPrecision ?? incoming.coordPrecision ?? "unknown",
    dataSource: merged.dataSource ?? incoming.dataSource ?? incoming.folder ?? null,
    verifiedFields: merged.verifiedFields ?? incoming.verifiedFields ?? [],
    qualityFlags: merged.qualityFlags ?? incoming.qualityFlags ?? [],
    photo: merged.photo ?? incoming.photo ?? null,
    photoSource: merged.photoSource ?? incoming.photoSource ?? null,
    googlePlaceId: merged.googlePlaceId ?? incoming.googlePlaceId ?? null,
    googleMapsUri: merged.googleMapsUri ?? incoming.googleMapsUri ?? null,
    openingHours: openingHoursColumn(merged.openingHours ?? incoming.openingHours),
    googleRating: merged.googleRating ?? incoming.googleRating ?? null,
    googleRatingCount: merged.googleRatingCount ?? incoming.googleRatingCount ?? null,
    businessStatus: merged.businessStatus ?? incoming.businessStatus ?? null,
    googlePrimaryType: merged.googlePrimaryType ?? incoming.googlePrimaryType ?? null,
    schools: merged.schools ?? incoming.schools ?? [],
  };
}

function normalizeRelations(teacher: Teacher) {
  const rels = teacher.relations;
  if (!rels) return [];

  const rows: {
    fromSlug: string;
    toSlug: string | null;
    name: string;
    role: string;
    note: string | null;
    type: string;
  }[] = [];

  for (const type of ["teacher", "peer", "student"] as const) {
    const group = rels[type === "teacher" ? "teachers" : `${type}s` as "peers" | "students"];
    if (!group) continue;
    for (const rel of group) {
      rows.push({
        fromSlug: teacher.slug,
        toSlug: rel.slug ?? null,
        name: rel.name,
        role: rel.role,
        note: rel.note ?? null,
        type,
      });
    }
  }

  return rows;
}

function teacherDbFields(teacher: Teacher): TeacherInsert {
  return {
    slug: teacher.slug,
    name: teacher.name,
    tradition: teacher.tradition,
    lineage: teacher.lineage,
    location: teacher.location,
    base: teacher.base ?? null,
    yearsTeaching: teacher.yearsTeaching,
    birthYear: teacher.birthYear ?? null,
    deathYear: teacher.deathYear ?? null,
    languages: teacher.languages,
    shortBio: teacher.shortBio,
    biography: teacher.biography,
    topics: teacher.topics,
    photo: teacher.photo,
    heroPhoto: teacher.heroPhoto ?? null,
    website: teacher.website ?? null,
  };
}

function loadPlacesFromFiles(root: string): Place[] {
  const raw = JSON.parse(
    readFileSync(join(root, "src/data/places.json"), "utf8"),
  ) as PlacesDataset;
  return raw.places;
}

function loadTeachersFromFiles(root: string): Teacher[] {
  const raw = JSON.parse(
    readFileSync(join(root, "src/data/teachers.json"), "utf8"),
  ) as TeachersDataset;
  return raw.teachers;
}

export async function seedPlacesFromList(list: Place[], forceFields: string[] = []) {
  if (!list.length) return 0;

  const ids = [...new Set(list.map((place) => place.id))];
  const existingById = new Map<string, Place>();

  for (const idChunk of chunks(ids, SELECT_CHUNK_SIZE)) {
    const existingRows = await db
      .select()
      .from(places)
      .where(inArray(places.id, idChunk));

    for (const row of existingRows) {
      existingById.set(row.id, rowToPlace(row));
    }
  }

  const rows: PlaceInsert[] = list.map((incoming) => {
    const existing = existingById.get(incoming.id) ?? {};
    const merged = mergePlaceFields(existing, incoming, { forceFields });

    return {
      id: incoming.id,
      ...placeDbFields(merged, incoming),
    };
  });

  const updatedAt = new Date();
  for (const rowChunk of chunks(rows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(places)
      .values(rowChunk)
      .onConflictDoUpdate({
        target: places.id,
        set: {
          name: excluded(places.name),
          lat: excluded(places.lat),
          lng: excluded(places.lng),
          tradition: excluded(places.tradition),
          faith: excluded(places.faith),
          type: excluded(places.type),
          folder: excluded(places.folder),
          address: excluded(places.address),
          phone: excluded(places.phone),
          website: excluded(places.website),
          description: excluded(places.description),
          descriptionSource: excluded(places.descriptionSource),
          coordPrecision: excluded(places.coordPrecision),
          dataSource: excluded(places.dataSource),
          verifiedFields: excluded(places.verifiedFields),
          qualityFlags: excluded(places.qualityFlags),
          photo: excluded(places.photo),
          photoSource: excluded(places.photoSource),
          googlePlaceId: excluded(places.googlePlaceId),
          googleMapsUri: excluded(places.googleMapsUri),
          openingHours: excluded(places.openingHours),
          googleRating: excluded(places.googleRating),
          googleRatingCount: excluded(places.googleRatingCount),
          businessStatus: excluded(places.businessStatus),
          googlePrimaryType: excluded(places.googlePrimaryType),
          schools: excluded(places.schools),
          updatedAt,
        },
      });
  }

  return list.length;
}

export async function seedTeacherRecord(teacher: Teacher) {
  await seedTeachersFromList([teacher]);
}

export async function seedTeachersFromList(list: Teacher[]) {
  if (!list.length) return 0;

  const teacherRows = list.map(teacherDbFields);
  const socialRows: TeacherSocialInsert[] = [];
  const bookRows: TeacherBookInsert[] = [];
  const retreatRows: TeacherRetreatInsert[] = [];
  const relationRows: TeacherRelationInsert[] = [];

  for (const teacher of list) {
    const slug = teacher.slug;

    socialRows.push(...teacher.socials.map((social) => ({ ...social, teacherSlug: slug })));

    bookRows.push(
      ...teacher.bibliography.map((book, index) => ({
        teacherSlug: slug,
        title: book.title,
        year: book.year,
        publisher: book.publisher,
        url: book.url ?? null,
        sortOrder: index,
      })),
    );

    retreatRows.push(
      ...teacher.retreats.map((retreat) => ({
        ...retreat,
        teacherSlug: slug,
      })),
    );

    relationRows.push(...normalizeRelations(teacher));
  }

  const slugs = [...new Set(list.map((teacher) => teacher.slug))];
  const updatedAt = new Date();

  for (const rowChunk of chunks(teacherRows, INSERT_CHUNK_SIZE)) {
    await db
      .insert(teachers)
      .values(rowChunk)
      .onConflictDoUpdate({
        target: teachers.slug,
        set: {
          name: excluded(teachers.name),
          tradition: excluded(teachers.tradition),
          lineage: excluded(teachers.lineage),
          location: excluded(teachers.location),
          base: excluded(teachers.base),
          yearsTeaching: excluded(teachers.yearsTeaching),
          birthYear: excluded(teachers.birthYear),
          deathYear: excluded(teachers.deathYear),
          languages: excluded(teachers.languages),
          shortBio: excluded(teachers.shortBio),
          biography: excluded(teachers.biography),
          topics: excluded(teachers.topics),
          photo: excluded(teachers.photo),
          heroPhoto: excluded(teachers.heroPhoto),
          website: excluded(teachers.website),
          updatedAt,
        },
      });
  }

  for (const slugChunk of chunks(slugs, SELECT_CHUNK_SIZE)) {
    await db.delete(teacherSocials).where(inArray(teacherSocials.teacherSlug, slugChunk));
    await db.delete(teacherBooks).where(inArray(teacherBooks.teacherSlug, slugChunk));
    await db.delete(teacherRetreats).where(inArray(teacherRetreats.teacherSlug, slugChunk));
    await db.delete(teacherRelations).where(inArray(teacherRelations.fromSlug, slugChunk));
  }

  for (const rowChunk of chunks(socialRows, INSERT_CHUNK_SIZE)) {
    await db.insert(teacherSocials).values(rowChunk);
  }
  for (const rowChunk of chunks(bookRows, INSERT_CHUNK_SIZE)) {
    await db.insert(teacherBooks).values(rowChunk);
  }
  for (const rowChunk of chunks(retreatRows, INSERT_CHUNK_SIZE)) {
    await db.insert(teacherRetreats).values(rowChunk);
  }
  for (const rowChunk of chunks(relationRows, INSERT_CHUNK_SIZE)) {
    await db.insert(teacherRelations).values(rowChunk);
  }

  return list.length;
}

async function seedDefaultOntologyIfEmpty() {
  const [existing] = await db.select({ slug: ontologyNodes.slug }).from(ontologyNodes).limit(1);
  if (existing) return 0;

  const { buildDefaultOntologyNodes } = await import("@/lib/ontology/defaults");
  const { buildOntologySnapshot } = await import("@/lib/ontology/build-snapshot");
  const nodes = buildDefaultOntologyNodes();
  buildOntologySnapshot(nodes);
  await db.insert(ontologyNodes).values(
    nodes.map((node) => ({
      slug: node.slug,
      label: node.label,
      parentSlug: node.parentSlug,
      sortOrder: node.sortOrder,
      nodeType: node.nodeType,
      filterId: node.filterId,
      placeTraditions: node.placeTraditions,
      inferPattern: node.inferPattern,
      appliesToLocations: node.appliesToLocations,
      appliesToPeople: node.appliesToPeople,
    })),
  );
  return nodes.length;
}

export async function runDataSeed(options: SeedOptions): Promise<SeedResult> {
  const root = process.cwd();
  const placeList =
    options.places ??
    (options.fromFiles ? loadPlacesFromFiles(root) : undefined) ??
    [];
  const teacherList =
    options.teachers ??
    (options.fromFiles ? loadTeachersFromFiles(root) : undefined) ??
    [];

  const placesCount = placeList.length ? await seedPlacesFromList(placeList, options.forceFields ?? []) : 0;
  const teachersCount = teacherList.length ? await seedTeachersFromList(teacherList) : 0;
  const ontologyCount =
    options.includeOntology === false ? 0 : await seedDefaultOntologyIfEmpty();

  return {
    places: placesCount,
    teachers: teachersCount,
    ontologyNodes: ontologyCount,
  };
}
