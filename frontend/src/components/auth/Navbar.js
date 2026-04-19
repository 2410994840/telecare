import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, LogOut, Bell, Wifi, WifiOff } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';

export default function Navbar({ navItems = [] }) {
  const { user, logout } = useAuth();
  const { isOnline } = useOfflineSync();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="text-red-500" size={24} />
            <span className="font-bold text-primary-700 text-lg">TeleCare</span>
          </Link>
          <div className="hidden md:flex gap-1">
            {navItems.map(item => (
              <Link key={item.path} to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isOnline
            ? <Wifi size={18} className="text-green-500" title="Online" />
            : <WifiOff size={18} className="text-red-500" title="Offline" />}
          <span className="text-sm text-gray-600 hidden sm:block">{user?.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            user?.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
            user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
            user?.role === 'asha_worker' ? 'bg-orange-100 text-orange-700' :
            'bg-green-100 text-green-700'}`}>
            {user?.role?.replace('_', ' ')}
          </span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
