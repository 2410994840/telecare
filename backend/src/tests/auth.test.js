const request = require('supertest');
const app = require('../server');

describe('Auth Routes', () => {
  const testUser = {
    name: 'Test Patient',
    phone: '9999999999',
    password: 'Test@1234',
    role: 'patient',
    village: 'TestVillage',
    district: 'TestDistrict',
    state: 'TestState'
  };

  let token;

  test('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('patient');
    token = res.body.token;
  });

  test('POST /api/auth/login - should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone: testUser.phone, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ phone: testUser.phone, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me - should return current user', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.phone).toBe(testUser.phone);
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
