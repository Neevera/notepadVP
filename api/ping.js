// api/ping.js
// POST /api/ping { name }
// — tandai user sebagai online
// — kembalikan semua user yang aktif dalam 35 detik terakhir

import { getDb, ensureTables } from '../lib/db.js';

const ONLINE_TTL = 35_000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name } = req.body ?? {};
  if (!name?.trim()) return res.status(400).json({ error: 'Field "name" wajib diisi' });

  let sql;
  try { sql = getDb(); } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  try {
    await ensureTables(sql);

    const now    = Date.now();
    const cutoff = now - ONLINE_TTL;
    const clean  = String(name).trim().slice(0, 50);

    await sql`
      INSERT INTO sessions (name, last_seen) VALUES (${clean}, ${now})
      ON CONFLICT (name) DO UPDATE SET last_seen = EXCLUDED.last_seen
    `;

    const rows = await sql`
      SELECT name FROM sessions WHERE last_seen > ${cutoff} ORDER BY last_seen DESC
    `;

    return res.status(200).json({ online: rows.map(r => r.name) });

  } catch (err) {
    console.error('[POST /api/ping]', err);
    return res.status(500).json({ error: err.message });
  }
}
