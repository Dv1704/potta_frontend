// src/App.jsx
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';

// Lazy Load Pages
const Home = React.lazy(() => import('./pages/Home'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Login = React.lazy(() => import('./pages/Login'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Success = React.lazy(() => import('./pages/Success'));
const Leaderboards = React.lazy(() => import('./components/Leaderboards'));
const SpeedMode = React.lazy(() => import('./pages/SpeedMode'));
const TurnMode = React.lazy(() => import('./pages/TurnMode'));
const SpeedArena = React.lazy(() => import('./pages/SpeedArena'));
const SpeedArenaDashboard = React.lazy(() => import('./pages/SpeedArenaDashboard'));
const QuickMatch = React.lazy(() => import('./pages/QuickMatch'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const PottaPoolDashboard = React.lazy(() => import('./pages/PottaPoolDashboard'));
const ReferEarnDashboard = React.lazy(() => import('./pages/ReferEarnDashboard'));
const GameDashboard = React.lazy(() => import('./pages/GameDashboard'));
const MatchSummary = React.lazy(() => import('./pages/MatchSummary'));

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading Potta..." />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    }>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/success" element={<Success />} />
        <Route path="/leaderboards" element={<Leaderboards />} />

        {/* Protected Routes with Dashboard Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SpeedArenaDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/speed-mode" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SpeedMode />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        {/* Turn Mode usually immersive, but user asked for better navigation so wrapping it too unless it breaks UI */}
        <Route path="/turn-mode" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TurnMode />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        {/* Wrapper for Turn Mode ID route */}
        <Route path="/turn-mode/:id" element={
          <ProtectedRoute>
            {/* Keeping game screens raw if they are immersive, checking user request context "entering a page" usually means menus */}
            {/* But "QuickMatch" and "Speed Mode" lobbies definitely need it */}
            <TurnMode />
          </ProtectedRoute>
        } />

        {/* Speed Arena Games might be full screen canvas, let's keep them raw but add back button in them if needed? */}
        {/* Or just wrap valid menu pages */}

        <Route path="/speed-mode/arena" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SpeedArena />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/speed-mode/arena/:id" element={
          <ProtectedRoute>
            {/* Game Play Screen - exclude layout to prevent canvas issues/click stealiing? logic check: usually games are fullscreen */}
            <SpeedArena />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/invite" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReferEarnDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/quick-match" element={
          <ProtectedRoute>
            <DashboardLayout>
              <QuickMatch />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/wallet" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PottaPoolDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/games" element={
          <ProtectedRoute>
            <DashboardLayout>
              <GameDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/match/:id" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MatchSummary />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
