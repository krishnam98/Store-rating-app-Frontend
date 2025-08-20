import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import StoreOwnerDashboard from './components/StoreOwnerDashboard';
import { useAuth } from './AuthContext/AuthContextProvider';

const App = () => {
  const { user, login, logout, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);


  console.log('User:', user);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <RegisterForm
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <LoginForm
        onShowRegister={() => setShowRegister(true)}
      />
    );
  }

  // Render appropriate dashboard based on user role
  if (user.user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.user.role === 'store_owner') {
    return <StoreOwnerDashboard />;
  } else {
    return <UserDashboard />;
  }
};

export default App;