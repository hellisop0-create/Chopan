import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'sonner';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import AdDetail from './pages/AdDetail';
import PostAd from './pages/PostAd';
import EditAd from './pages/EditAd'; // Fixed relative path
import Profile from './pages/Profile';
import SearchPage from './pages/SearchPage';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />

          <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            {/* Header / Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/ad/:id" element={<AdDetail />} />

                {/* User Action Routes */}
                <Route path="/post-ad" element={<PostAd />} />
                <Route path="/edit-ad/:id" element={<EditAd />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin Routes */}
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<Admin />} />

                {/* Catch-all: You could add a 404 page here later */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Notifications Overlay */}
            <Toaster position="top-center" richColors closeButton />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}