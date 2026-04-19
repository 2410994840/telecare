import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import KioskInterface from './pages/KioskInterface';
import ConsultationRoom from './pages/ConsultationRoom';
import './index.css';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Spinner = () => <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

const RoleRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  const routes = { patient: '/patient', doctor: '/doctor', admin: '/admin', asha_worker: '/patient' };
  return <Navigate to={routes[user.role] || '/login'} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/kiosk" element={<KioskInterface />} />
          <Route path="/" element={<ProtectedRoute><RoleRouter /></ProtectedRoute>} />
          <Route path="/patient/*" element={<ProtectedRoute roles={['patient', 'asha_worker']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/doctor/*" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><Suspense fallback={<Spinner />}><AdminDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/consultation/:id" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />
          <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen text-red-500 text-xl">Access Denied</div>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
