import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage, AuthCallback } from './components/Auth/AuthPages';
import { MeetingComposer } from './components/Composer/MeetingComposer';
import { DashboardPage } from './components/Dashboard/DashboardPage';
import { MeetingsPage } from './components/Dashboard/MeetingsPage';
import { LogsPage } from './components/Dashboard/LogsPage';
import { SettingsPage } from './components/Settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/compose" element={<MeetingComposer />} />
            <Route path="/meetings" element={<MeetingsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
