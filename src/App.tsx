import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, ErrorBoundary } from './components';
import {
  AdminPanel,
  Community,
  CompareProfiles,
  Dashboard,
  EditProfile,
  ProfileView,
  Profiles,
  SensitivityCalculator,
  Templates,
  UserProfile,
} from './pages';

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
