import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { LoginPage } from './pages/admin/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { MediaPage } from './pages/admin/MediaPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties/:slug" element={<PropertyDetailPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<DashboardPage />} />
        <Route path="/admin/media" element={<MediaPage />} />
        <Route path="/admin/*" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;