import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const appointmentService = {
  book: (data) => api.post('/appointments', data),
  getMyAppointments: () => api.get('/appointments/my'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
  getAvailableDoctors: () => api.get('/appointments/available-doctors'),
  getDoctorList: () => api.get('/appointments/doctor-list'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status }),
};

export const consultationService = {
  start: (appointmentId, mode) => api.post(`/consultations/start/${appointmentId}`, { mode }),
  end: (id, data) => api.put(`/consultations/${id}/end`, data),
  get: (id) => api.get(`/consultations/${id}`),
  syncOffline: (id, messages) => api.post(`/consultations/${id}/sync`, { messages }),
};

export const prescriptionService = {
  create: (data) => api.post('/prescriptions', data),
  getMy: () => api.get('/prescriptions/my'),
  getById: (id) => api.get(`/prescriptions/${id}`),
};

export const aiService = {
  analyze: (data) => api.post('/ai/analyze', data),
  getTrends: (params) => api.get('/ai/trends', { params }),
  checkSchemes: (data) => api.post('/ai/schemes', data),
};

export const iotService = {
  submitReading: (data) => api.post('/iot/reading', data),
  getMyReadings: () => api.get('/iot/my-readings'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getVillageStats: () => api.get('/admin/village-stats'),
  getDoctorLoad: () => api.get('/admin/doctor-load'),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getDiseaseTrends: () => api.get('/admin/disease-trends'),
};

export const alertService = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
};

export const schemeService = {
  getAll: () => api.get('/schemes'),
  checkEligibility: (data) => api.post('/schemes/check-eligibility', data),
};
