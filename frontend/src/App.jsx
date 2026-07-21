import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PanelLeftOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setRefreshHandler } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ResearchPage from './pages/ResearchPage';
import HeroPage from './pages/HeroPage';
import AuthPage from './pages/AuthPage';

// Redirect logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/chat" replace /> : children;
};

// Redirect unauthenticated users away from protected pages
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};
// Registers the silentRefresh function so api.js can call it automatically on 401
const TokenRefreshBridge = () => {
  const { silentRefresh } = useAuth();
  useEffect(() => {
    setRefreshHandler(silentRefresh);
  }, [silentRefresh]);
  return null;
};

// Layout with Sidebar
const MainLayout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-hero-bg text-foreground font-sora">
      {user && (
        <div className={`flex-shrink-0 h-screen transition-all duration-300 z-50 ${sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden absolute md:relative'}`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-hero-bg relative">
        {!sidebarOpen && (
          <button 
            className="absolute top-4 left-4 z-40 p-2 rounded-md bg-background/50 backdrop-blur-md border border-border/50 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all shadow-xl cursor-pointer"
            onClick={() => setSidebarOpen(true)} 
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 overflow-hidden flex flex-col relative">
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
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route element={<MainLayout />}>
        <Route path="/chat" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
        <Route path="/chat/:sessionId" element={<ProtectedRoute><ResearchPage /></ProtectedRoute>} />
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
