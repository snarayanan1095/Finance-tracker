import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/Expenses';
import FamilyPage from './pages/Family';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Public Route component (for login page)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="family" element={<FamilyPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;