import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/sell" element={<SellCrop />} />
            <Route path="/marketplace/buy/:id" element={<BuyCrop />} />
            <Route path="/chat/:farmerId/:cropId" element={<Chat />} />
            <Route path="/agritech" element={<Agritech />} />
            <Route path="/services" element={<Services />} />
            <Route path="/calendar" element={<CropCalendar />} />
            <Route path="/pest-alert" element={<PestAlert />} />
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
