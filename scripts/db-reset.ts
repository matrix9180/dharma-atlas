#!/usr/bin/env tsx
/**
 * Reset the local database from scratch:
 * 1. Drop public + drizzle schemas
 * 2. Recreate the schema set
 * 3. Run Drizzle migrations
 * 4. Seed from JSON snapshots
 */

import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { createInterface } from "node:readline/promises";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { closeDb } from "../src/db/node-client";
import { runDataSeed } from "../src/lib/seed/run-seed";

loadEnvConfig(process.cwd());

const DATABASE_URL = process.env.DATABASE_URL?.trim();

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local");
  process.exit(1);
}

const force = process.argv.includes("--yes") || process.env.CI === "1";
const isDev = process.env.NODE_ENV === "development";
const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, "..", "drizzle");

async function confirmReset() {
  if (force) return;
  if (!process.stdin.isTTY) {
    throw new Error("Refusing to reset without a TTY. Re-run with --yes to confirm.");
  }

  const rl = createInterface({ input, output });
  try {
    const prompt =
      "ARE YOU SURE? This will drop the public and drizzle schemas, then rebuild the database.\n" +
      "Type yes to continue: ";
    const answerPromise = rl.question(prompt).catch(() => "");
    const answer = isDev
      ? await answerPromise
      : await Promise.race([
          answerPromise,
          delay(15_000).then(() => {
            throw new Error("Reset timed out. Re-run if you still want to continue.");
          }),
        ]);

    if (answer.trim().toLowerCase() !== "yes") {
      throw new Error("Reset cancelled.");
    }
  } finally {
    rl.close();
  }
}

async function main() {
  await confirmReset();

  const databaseUrl = DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  const client = postgres(databaseUrl, { max: 1, connect_timeout: 30 });
  try {
    const db = drizzle(client);

    console.log("Dropping existing schemas…");
    await client.unsafe("DROP SCHEMA IF EXISTS public CASCADE");
    await client.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");
    await client.unsafe("CREATE SCHEMA public");
    await client.unsafe("CREATE SCHEMA drizzle");

    console.log("Running migrations…");
    await migrate(db, { migrationsFolder });

    console.log("Seeding data…");
    const result = await runDataSeed({
      fromFiles: true,
      includeOntology: true,
    });

    console.log(
      `Done — ${result.places} places, ${result.teachers} teachers, ${result.ontologyNodes} ontology nodes.`,
    );
  } finally {
    await client.end();
    await closeDb();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
