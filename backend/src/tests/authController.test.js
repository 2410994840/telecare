const authController = require('../controllers/authController');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateToken } = require('../middleware/auth');

jest.mock('../models/User');
jest.mock('../models/Patient');
jest.mock('../models/Doctor');
jest.mock('../middleware/auth', () => ({ generateToken: jest.fn(() => 'mock-token') }));

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authController.register', () => {
  const req = {
    body: {
      name: 'Test User', phone: '9999999999', password: 'Test@1234',
      role: 'patient', village: 'TestVillage', district: 'TestDistrict', state: 'TestState'
    }
  };

  afterEach(() => jest.clearAllMocks());

  test('registers a new patient and returns token', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: 'uid1', role: 'patient', toSafeObject: () => ({ role: 'patient' }) });
    Patient.create.mockResolvedValue({});

    const res = mockRes();
    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ token: 'mock-token', user: { role: 'patient' } });
  });

  test('returns 400 if phone already registered', async () => {
    User.findOne.mockResolvedValue({ phone: '9999999999' });

    const res = mockRes();
    await authController.register(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Phone already registered' });
  });
});

describe('authController.login', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns token on valid credentials', async () => {
    const mockUser = {
      _id: 'uid1',
      matchPassword: jest.fn().mockResolvedValue(true),
      lastLogin: null,
      save: jest.fn(),
      toSafeObject: () => ({ phone: '9999999999' })
    };
    User.findOne.mockResolvedValue(mockUser);

    const req = { body: { phone: '9999999999', password: 'Test@1234' } };
    const res = mockRes();
    await authController.login(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ token: 'mock-token', user: { phone: '9999999999' } });
  });

  test('returns 401 on invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    const req = { body: { phone: '0000000000', password: 'wrong' } };
    const res = mockRes();
    await authController.login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });
});

describe('authController.getMe', () => {
  test('returns current user', async () => {
    const req = { user: { toSafeObject: () => ({ phone: '9999999999' }) } };
    const res = mockRes();
    await authController.getMe(req, res);

    expect(res.json).toHaveBeenCalledWith({ phone: '9999999999' });
  });
});
