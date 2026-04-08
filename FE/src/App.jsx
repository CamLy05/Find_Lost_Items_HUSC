import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AppContext.jsx';
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/Home/index.jsx';
import LoginPage from './pages/Auth/LogIn/index.jsx';
import SignupPage from './pages/Auth/Register/index.jsx';
import StudentDashboard from './pages/StudentDashboard/index.jsx';
import AdminDashboard from './pages/AdminDashboard/index.jsx';
import NotificationsPage from './pages/NotificationsPage/index.jsx';
import QAPage from './pages/QAPages/index.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes for all authenticated users */}
          <Route
            path="/qa"
            element={
              <ProtectedRoute>
                <QAPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Role-specific Protected Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
      <p className="text-xl text-slate-600 mb-8">Không tìm thấy trang</p>
      <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
        Về trang chủ
      </a>
    </div>
  </div>
);

export default App;