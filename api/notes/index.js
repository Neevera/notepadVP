// api/notes/index.js
// GET  /api/notes  — ambil semua catatan (terbaru duluan)
// POST /api/notes  — buat catatan baru

import { v4 as uuidv4 } from 'uuid';
import { getDb, ensureTables } from '../../lib/db.js';

function toNote(r) {
  return {
    id:        r.id,
    title:     r.title,
    body:      r.body,
    color:     r.color,
    author:    r.author,
    editedBy:  r.edited_by,
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  let sql;
  try { sql = getDb(); } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  try {
    await ensureTables(sql);

    // ── GET ──────────────────────────────────────────────────
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM notes ORDER BY updated_at DESC`;
      return res.status(200).json(rows.map(toNote));
    }

    // ── POST ─────────────────────────────────────────────────
    if (req.method === 'POST') {
      const { title = '', body = '', color = '#FFE066', author } = req.body ?? {};

      if (!author?.trim())
        return res.status(400).json({ error: 'Field "author" wajib diisi' });
      if (!String(title).trim() && !String(body).trim())
        return res.status(400).json({ error: 'Judul atau isi catatan wajib ada' });

      const now  = Date.now();
      const note = {
        id:         uuidv4(),
        title:      String(title).trim().slice(0, 200),
        body:       String(body).trim().slice(0, 10_000),
        color:      color || '#FFE066',
        author:     String(author).trim().slice(0, 50),
        edited_by:  String(author).trim().slice(0, 50),
        created_at: now,
        updated_at: now,
      };

      await sql`
        INSERT INTO notes (id, title, body, color, author, edited_by, created_at, updated_at)
        VALUES (
          ${note.id}, ${note.title}, ${note.body}, ${note.color},
          ${note.author}, ${note.edited_by}, ${note.created_at}, ${note.updated_at}
        )
      `;

      return res.status(201).json(toNote(note));
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[GET|POST /api/notes]', err);
    return res.status(500).json({ error: err.message });
  }
}
