import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { TooltipProvider } from './components/ui/tooltip';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TendersPage } from './pages/TendersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { RemindersPage } from './pages/RemindersPage';
import { AccountingPage } from './pages/AccountingPage';
import { AdminPage } from './pages/AdminPage';
import { FilesManagementPage } from './pages/FilesManagementPage';
import { Layout } from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  console.log('CRM App Starting:', {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  
  // Используем HashRouter - надежно работает везде без серверной конфигурации
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AuthProvider>
          <DataProvider>
            <TooltipProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders"
                element={
                  <ProtectedRoute>
                    <TendersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/new"
                element={
                  <ProtectedRoute>
                    <TendersPage filter="new" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/review"
                element={
                  <ProtectedRoute>
                    <TendersPage filter="review" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/in-progress"
                element={
                  <ProtectedRoute>
                    <TendersPage filter="inProgress" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenders/archive"
                element={
                  <ProtectedRoute>
                    <TendersPage filter="archive" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <ProtectedRoute>
                    <SuppliersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reminders"
                element={
                  <ProtectedRoute>
                    <RemindersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounting"
                element={
                  <ProtectedRoute>
                    <AccountingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/files"
                element={
                  <ProtectedRoute>
                    <FilesManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </HashRouter>
    </QueryClientProvider>
  );
};

export default App;
