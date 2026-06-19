import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { Profiles } from './pages/profiles/Profiles';
import { EditProfile } from './pages/profiles/EditProfile';
import { ProfileView } from './pages/profiles/ProfileView';
import { CompareProfiles } from './pages/compare/CompareProfiles';
import { SensitivityCalculator } from './pages/calculators/SensitivityCalculator';
import { Templates } from './pages/profiles/Templates';
import { Community } from './pages/community/Community';
import { UserProfile } from './pages/user/UserProfile';
import { AdminPanel } from './pages/admin/AdminPanel';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profiles" element={<Profiles />} />
            <Route path="/profiles/new" element={<EditProfile />} />
            <Route path="/profiles/:id" element={<ProfileView />} />
            <Route path="/profiles/:id/edit" element={<EditProfile />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/compare" element={<CompareProfiles />} />
            <Route path="/sensitivity" element={<SensitivityCalculator />} />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* Catch-all redirects to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
