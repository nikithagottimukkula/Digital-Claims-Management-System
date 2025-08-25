import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { getCurrentUser } from '@/store/slices/authSlice';
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Pages
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ClaimsListPage from '@/pages/claims/ClaimsListPage';
import ClaimDetailPage from '@/pages/claims/ClaimDetailPage';
import NewClaimPage from '@/pages/claims/NewClaimPage';
import WorkbenchPage from '@/pages/WorkbenchPage';
import ReportsPage from '@/pages/ReportsPage';
import UsersPage from '@/pages/admin/UsersPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ 
  children, 
  roles 
}) => {
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// App Content Component (needs to be inside Provider)
const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, token } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="claims" element={<ClaimsListPage />} />
          <Route path="claims/:id" element={<ClaimDetailPage />} />
          <Route 
            path="claims/new" 
            element={
              <ProtectedRoute roles={['POLICYHOLDER']}>
                <NewClaimPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="workbench" 
            element={
              <ProtectedRoute roles={['ADJUSTER', 'SUPERVISOR']}>
                <WorkbenchPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/claims" 
            element={
              <ProtectedRoute roles={['SUPERVISOR', 'ADMIN']}>
                <ClaimsListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/users" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reports" 
            element={
              <ProtectedRoute roles={['SUPERVISOR', 'ADMIN']}>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="settings" 
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Router>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
