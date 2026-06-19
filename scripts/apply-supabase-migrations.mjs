#!/usr/bin/env node
/**
 * Apply pending Supabase migrations when SUPABASE_DB_PASSWORD is set.
 * Password: Supabase Dashboard → Project Settings → Database → Database password
 *
 * Usage:
 *   SUPABASE_DB_PASSWORD='...' node scripts/apply-supabase-migrations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const projectRef = "epeitwkgbfabevxyznrh";

const password = process.env.SUPABASE_DB_PASSWORD?.trim();
if (!password) {
  console.error(
    "Set SUPABASE_DB_PASSWORD (Supabase Dashboard → Settings → Database → Database password).",
  );
  process.exit(1);
}

const regions = [
  "us-east-1",
  "us-west-1",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-northeast-1",
  "ap-south-1",
  "sa-east-1",
];

async function connect() {
  for (const region of regions) {
    const connectionString = `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`Connected via pooler (${region})`);
      return client;
    } catch {
      await client.end().catch(() => {});
    }
  }
  throw new Error("Could not connect to Supabase Postgres. Check SUPABASE_DB_PASSWORD.");
}

async function main() {
  const migrationsDir = path.join(root, "supabase/migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const client = await connect();
  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      console.log(`Applying ${file}…`);
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    }
    console.log("All migrations applied.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
