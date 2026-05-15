import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { NewAnalysisView } from './components/analysis/NewAnalysisView';
import { PriorArtSearchView } from './components/search/PriorArtSearchView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { LoginView } from './components/auth/LoginView';
import { RegisterView } from './components/auth/RegisterView';
import { useAuthStore } from './store';

// React Query Client setup
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    {/* Public Auth Routes */}
                    <Route path="/login" element={<LoginView />} />
                    <Route path="/register" element={<RegisterView />} />

                    {/* Main App Routes (Authenticated) */}
                    <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardView />} />
                        <Route path="analysis/new" element={<NewAnalysisView />} />
                        <Route path="search" element={<PriorArtSearchView />} />
                        <Route path="reports" element={<ReportsView />} />
                        <Route path="settings" element={<SettingsView />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
