const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone: '0000000000', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me - should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

describe('Health Check', () => {
  test('GET /health - should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
