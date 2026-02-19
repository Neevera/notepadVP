// api/notes/[id].js
// PUT    /api/notes/:id  — edit catatan
// DELETE /api/notes/:id  — hapus catatan

import { getDb, ensureTables } from '../../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  let sql;
  try { sql = getDb(); } catch (e) {
    return res.status(500).json({ error: e.message });
  }

  try {
    await ensureTables(sql);

    const [existing] = await sql`SELECT * FROM notes WHERE id = ${id}`;
    if (!existing) return res.status(404).json({ error: 'Catatan tidak ditemukan' });

    // ── PUT ──────────────────────────────────────────────────
    if (req.method === 'PUT') {
      const { title, body, color, editedBy } = req.body ?? {};

      if (!editedBy?.trim())
        return res.status(400).json({ error: 'Field "editedBy" wajib diisi' });

      const newTitle    = title    !== undefined ? String(title).trim().slice(0, 200)    : existing.title;
      const newBody     = body     !== undefined ? String(body).trim().slice(0, 10_000)  : existing.body;
      const newColor    = color    || existing.color;
      const newEditedBy = String(editedBy).trim().slice(0, 50);
      const newUpdated  = Date.now();

      await sql`
        UPDATE notes
        SET title      = ${newTitle},
            body       = ${newBody},
            color      = ${newColor},
            edited_by  = ${newEditedBy},
            updated_at = ${newUpdated}
        WHERE id = ${id}
      `;

      return res.status(200).json({
        id:        existing.id,
        title:     newTitle,
        body:      newBody,
        color:     newColor,
        author:    existing.author,
        editedBy:  newEditedBy,
        createdAt: Number(existing.created_at),
        updatedAt: newUpdated,
      });
    }

    // ── DELETE ───────────────────────────────────────────────
    if (req.method === 'DELETE') {
      await sql`DELETE FROM notes WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[PUT|DELETE /api/notes/:id]', err);
    return res.status(500).json({ error: err.message });
  }
}
