import request from 'supertest';
import app from '../app';

describe('GET /healthz', () => {
  it('returns ok 1.0', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, version: '1.0' });
  });
});
