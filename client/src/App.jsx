import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Leaf, UploadCloud, BarChart3, Clock, LogOut, User as UserIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  
  if (!user) return null;

  return (
    <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-emerald-500" />
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              Eco Scan
            </span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-4">
            <div className="hidden sm:flex space-x-2">
              <Link to="/" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 hover:text-emerald-400 transition-all">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <Link to="/upload" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 hover:text-emerald-400 transition-all">
                <UploadCloud className="h-4 w-4 mr-2" />
                Scan
              </Link>
              <Link to="/history" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 hover:text-emerald-400 transition-all">
                <Clock className="h-4 w-4 mr-2" />
                History
              </Link>
            </div>
            
            <div className="flex items-center pl-4 border-l border-slate-700 ml-2 space-x-3">
              <div className="flex items-center text-sm font-medium text-slate-300">
                <div className="bg-slate-700 p-1.5 rounded-full mr-2">
                  <UserIcon className="h-4 w-4 text-slate-300" />
                </div>
                <span className="hidden md:inline">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-900/20 blur-[120px] pointer-events-none"></div>
          
          <Navbar />

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 relative">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
