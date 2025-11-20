/**
 * Redirect router
 * GET /:code  -> redirect (302) or 404
 * Transactionally increments total_clicks and updates last_clicked.
 */
import { Router } from 'express';
import pool from '../db';

const router = Router();

router.get('/:code', async (req, res, next) => {
  const code = String(req.params.code);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // select the row FOR UPDATE to avoid races
    const selectRes = await client.query('SELECT target_url, total_clicks, is_active FROM links WHERE code = $1 FOR UPDATE', [code]);
    if (selectRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).send('Not found');
    }
    const row = selectRes.rows[0];
    if (!row.is_active) {
      await client.query('ROLLBACK');
      return res.status(404).send('Not found');
    }

    const newClicks = (row.total_clicks || 0) + 1;
    await client.query('UPDATE links SET total_clicks = $1, last_clicked = now() WHERE code = $2', [newClicks, code]);

    await client.query('COMMIT');

    // Redirect with 302
    return res.redirect(302, row.target_url);
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    return next(err);
  } finally {
    client.release();
  }
});

export default router;
