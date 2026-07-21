import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setRefreshHandler } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ResearchPage from './pages/ResearchPage';
import HeroPage from './pages/HeroPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/chat" replace /> : children;
};

// Redirect unauthenticated users away from protected pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
// Registers the silentRefresh function so api.js can call it automatically on 401
const TokenRefreshBridge = () => {
  const { silentRefresh } = useAuth();
  useEffect(() => {
    setRefreshHandler(silentRefresh);
  }, [silentRefresh]);
  return null;
};

// Layout with Sidebar and Navbar
const MainLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-layout">
      {user && (
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : 'closed'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}
      <div className="main-content">
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <div className="page-view">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => (
  <>
    <TokenRefreshBridge />
    <Routes>
      <Route path="/" element={<HeroPage />} />
      <Route element={<MainLayout />}>
        <Route path="/chat" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
        <Route path="/chat/:sessionId" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
