/**
 * Links router
 * POST /api/links
 * GET  /api/links
 * GET  /api/links/:code
 * DELETE /api/links/:code
 */
import { Router } from 'express';
import pool from '../db';
import { isValidHttpUrl, CODE_REGEX, generateCode } from '../utils/validators';

const router = Router();

// Create a link
router.post('/', async (req, res, next) => {
  try {
    const { target_url, code: maybeCode } = req.body;
    if (!target_url || typeof target_url !== 'string' || !isValidHttpUrl(target_url)) {
      return res.status(400).json({ error: 'Invalid target_url. Must be a valid http/https URL.' });
    }

    let code = maybeCode ? String(maybeCode) : generateCode(6);
    if (maybeCode && !CODE_REGEX.test(code)) {
      return res.status(400).json({ error: 'Custom code invalid. Must match [A-Za-z0-9]{6,8}.' });
    }

    // try insert; UNIQUE constraint on code will cause error if collision
    const insertSql = `INSERT INTO links (code, target_url) VALUES ($1, $2) RETURNING code, target_url, created_at, total_clicks, last_clicked, deleted_at, is_active`;
    const { rows } = await pool.query(insertSql, [code, target_url]);
    return res.status(201).json(rows[0]);
  } catch (err: any) {
    // Postgres unique violation
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'Code already exists' });
    }
    next(err);
  }
});

// List active links
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT code, target_url, created_at, total_clicks, last_clicked FROM links WHERE is_active = true ORDER BY total_clicks DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get single link metadata
router.get('/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code);
    const { rows } = await pool.query(`SELECT code, target_url, created_at, total_clicks, last_clicked, is_active, deleted_at FROM links WHERE code = $1 LIMIT 1`, [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Soft delete
router.delete('/:code', async (req, res, next) => {
  try {
    const code = String(req.params.code);
    await pool.query(`UPDATE links SET is_active = false, deleted_at = now() WHERE code = $1`, [code]);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
