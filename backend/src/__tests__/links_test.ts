/**
 * Integration tests for links CRUD + redirect.
 * These tests assume DATABASE_URL points to a test DB and migrations were run.
 */
import request from 'supertest';
import app from '../app';
import pool from '../db';

const TEST_CODE = 'abc123';

beforeAll(async () => {
  // ensure clean table
  await pool.query('DELETE FROM links');
});

afterAll(async () => {
  await pool.end();
});

describe('links CRUD and redirect', () => {
  it('POST /api/links creates a link', async () => {
    const res = await request(app)
      .post('/api/links')
      .send({ target_url: 'https://example.com', code: TEST_CODE });
    expect(res.status).toBe(201);
    expect(res.body.code).toBe(TEST_CODE);
    expect(res.body.target_url).toBe('https://example.com');
    expect(res.body.total_clicks).toBeDefined();
  });

  it('POST /api/links duplicate returns 409', async () => {
    const res = await request(app)
      .post('/api/links')
      .send({ target_url: 'https://example.com', code: TEST_CODE });
    expect(res.status).toBe(409);
  });

  it('GET /:code redirects (302) and increments clicks', async () => {
    const before = (await pool.query('SELECT total_clicks FROM links WHERE code = $1', [TEST_CODE])).rows[0].total_clicks;
    const r = await request(app).get(`/${TEST_CODE}`);
    expect(r.status).toBe(302);
    // After redirect, clicks should be before+1
    const after = (await pool.query('SELECT total_clicks FROM links WHERE code = $1', [TEST_CODE])).rows[0].total_clicks;
    expect(after).toBe(before + 1);
  });

  it('DELETE /api/links/:code soft-deletes and subsequent redirect 404', async () => {
    const del = await request(app).delete(`/api/links/${TEST_CODE}`);
    expect(del.status).toBe(204);
    const r2 = await request(app).get(`/${TEST_CODE}`);
    expect(r2.status).toBe(404);
  });
});
