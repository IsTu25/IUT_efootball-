import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { PageLoader } from './components/common/LoadingSpinner';
import Layout from './components/layout/Layout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MyProfilePage from './pages/auth/MyProfilePage';
import Dashboard from './pages/dashboard/Dashboard';
import PlayersPage from './pages/players/PlayersPage';
import PlayerProfile from './pages/players/PlayerProfile';
import AdminPlayers from './pages/players/AdminPlayers';
import TournamentsPage from './pages/tournaments/TournamentsPage';
import TournamentDetail from './pages/tournaments/TournamentDetail';
import MatchesPage from './pages/matches/MatchesPage';
import Leaderboard from './pages/standings/Leaderboard';
import NotificationsPage from './pages/notifications/NotificationsPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { fetchMe, token, loading } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
    else useAuthStore.setState({ loading: false });
  }, []);

  if (loading) return <PageLoader />;

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141c2e',
            color: '#f1f5f9',
            border: '1px solid #1e2d4a',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#00d084', secondary: '#141c2e' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#141c2e' } },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:id" element={<PlayerProfile />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="tournaments/:id" element={<TournamentDetail />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="my-profile" element={<MyProfilePage />} />
          <Route path="admin/players" element={
            <ProtectedRoute adminOnly>
              <AdminPlayers />
            </ProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
