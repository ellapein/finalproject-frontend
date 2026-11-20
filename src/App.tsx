import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { firebaseConfigured } from './lib/firebase';
import AdviserResultsPage from './pages/AdviserResultsPage';
import AdviserTeamsPage from './pages/AdviserTeamsPage';
import DashboardPage from './pages/DashboardPage';
import EvaluatePage from './pages/EvaluatePage';
import GuidePage from './pages/GuidePage';
import LoginPage from './pages/LoginPage';
import MyEvaluationsPage from './pages/MyEvaluationsPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/RegisterPage';
import SetupPage from './pages/SetupPage';
import TeamFormPage from './pages/TeamFormPage';
import TeamPage from './pages/TeamPage';

function HomeRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;
  return <Navigate to={profile.role === 'adviser' ? '/adviser' : '/dashboard'} replace />;
}

export default function App() {
  if (!firebaseConfigured) return <SetupPage />;

  return (
    <Routes>
      {/* full-screen pages: no header / footer */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />

        {/* any signed-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/guide" element={<GuidePage />} />
        </Route>

        {/* students: can only ever read evaluations they WROTE */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/evaluate/:mateId" element={<EvaluatePage />} />
          <Route path="/my-evaluations" element={<MyEvaluationsPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Route>

        {/* advisers: can read all results of their teams */}
        <Route element={<ProtectedRoute role="adviser" />}>
          <Route path="/adviser" element={<AdviserResultsPage />} />
          <Route path="/adviser/teams" element={<AdviserTeamsPage />} />
          <Route path="/adviser/teams/new" element={<TeamFormPage />} />
          <Route path="/adviser/teams/:code/edit" element={<TeamFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
