import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import SellCrop from './pages/SellCrop';
import BuyCrop from './pages/BuyCrop';
import Agritech from './pages/Agritech';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import CropCalendar from './pages/CropCalendar';
import PestAlert from './pages/PestAlert';
import Chatbot from './components/Chatbot';
import VoiceAssistant from './components/VoiceAssistant';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/marketplace/sell" element={<ProtectedRoute><SellCrop /></ProtectedRoute>} />
            <Route path="/marketplace/buy/:id" element={<ProtectedRoute><BuyCrop /></ProtectedRoute>} />
            <Route path="/chat/:farmerId/:cropId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/agritech" element={<ProtectedRoute><Agritech /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CropCalendar /></ProtectedRoute>} />
            <Route path="/pest-alert" element={<ProtectedRoute><PestAlert /></ProtectedRoute>} />
            
            <Route path="*" element={<div className="container mt-4"><h1 className="title-glow">404 - Page Not Found</h1></div>} />
          </Routes>
        </main>
        <Chatbot />
        <VoiceAssistant />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
