import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;
type Sql = ReturnType<typeof postgres>;

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  const client = postgres(url, { max: 1, connect_timeout: 10 });
  globalThis.__dbClient = client;
  return drizzle(client, { schema });
}

declare global {
  var __db: Db | undefined;
  var __dbClient: Sql | undefined;
}

function getDb(): Db {
  return (globalThis.__db ??= createDb());
}

export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export async function closeDb() {
  await globalThis.__dbClient?.end();
  globalThis.__dbClient = undefined;
  globalThis.__db = undefined;
}
