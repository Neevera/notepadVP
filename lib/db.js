// lib/db.js
// ─────────────────────────────────────────────────────────────
//  Koneksi ke Neon 
//
//  env variable yang dibutuhkan:
//    DATABASE_URL = postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
//
//  Cara nya:
//    → Vercel Dashboard → project → Settings → Environment Variables
//    → Tambah: DATABASE_URL = (connection string dari neon.tech)
// ─────────────────────────────────────────────────────────────

import { neon } from '@neondatabase/serverless';

// Singleton SQL client — Vercel serverless membuat koneksi baru per request
// tapi Neon connection pooler nanganin ini secara efisien
export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL belum diset!\n' +
      'Tambahkan di: Vercel Dashboard → Settings → Environment Variables\n' +
      'Format: postgresql://user:pass@host/dbname?sslmode=require'
    );
  }
  return neon(process.env.DATABASE_URL);
}

// Buat tabel jika belum ada — dijalankan otomatis di setiap API handler
export async function ensureTables(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS notes (
      id         TEXT    PRIMARY KEY,
      title      TEXT    NOT NULL DEFAULT '',
      body       TEXT    NOT NULL DEFAULT '',
      color      TEXT    NOT NULL DEFAULT '#FFE066',
      author     TEXT    NOT NULL,
      edited_by  TEXT    NOT NULL,
      created_at BIGINT  NOT NULL,
      updated_at BIGINT  NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      name       TEXT    PRIMARY KEY,
      last_seen  BIGINT  NOT NULL
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_notes_updated
    ON notes (updated_at DESC)
  `;
}
