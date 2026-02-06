import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { useUIStore } from '@store/uiStore';

// Layouts
import MainLayout from '@components/layouts/MainLayout';
import AuthLayout from '@components/layouts/AuthLayout';
import DashboardLayout from '@components/layouts/DashboardLayout';
import ConnectionTest from './pages/ConnectionTest';
// Auth Pages
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
} from './pages/auth';

// Dashboard Pages - UPDATED IMPORT
import {
  Dashboard,
  MyCourses,
  Certificates,
  Settings,
  Assessments,
  Leaderboard,
  Analytics,
  Notifications,
} from './pages/dashboard';

// Public Pages
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/connection-test" element={<ConnectionTest />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
      </Route>

      {/* Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/courses" element={<MyCourses />} />
        <Route path="/dashboard/assessments" element={<Assessments />} />
        <Route path="/dashboard/certificates" element={<Certificates />} />
        <Route path="/dashboard/leaderboard" element={<Leaderboard />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/knowledge-base" element={<div className="p-6">Knowledge Base (Coming Soon)</div>} />
        <Route path="/dashboard/chat" element={<div className="p-6">Chat (Coming Soon)</div>} />
        <Route path="/dashboard/notifications" element={<Notifications />} />
        <Route path="/dashboard/settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <DashboardLayout isAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<div className="p-6">Admin Dashboard (Coming Soon)</div>} />
        <Route path="/admin/courses" element={<div className="p-6">Course Management (Coming Soon)</div>} />
        <Route path="/admin/users" element={<div className="p-6">User Management (Coming Soon)</div>} />
        <Route path="/admin/assessments" element={<div className="p-6">Assessment Management (Coming Soon)</div>} />
        <Route path="/admin/reports" element={<div className="p-6">Reports (Coming Soon)</div>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
