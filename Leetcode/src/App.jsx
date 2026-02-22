// src/App.jsx - Clean Navigation with Proper Protected Routes

import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import ProblemsPage from './pages/ProblemsPage';
import ProblemPage from './pages/ProblemPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';

// Protected Route wrapper that shows sign-in prompt
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-neutral-50 pt-24 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
            <p className="text-neutral-600 mb-6">You need to sign in to access this page.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/sign-in" className="btn-primary">
                Sign In
              </Link>
              <Link to="/sign-up" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
};

function App() {
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActiveLink = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900 hidden sm:block">CodeMaster</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-1 items-center">
              <SignedIn>
                <Link 
                  to="/problems" 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActiveLink('/problems') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  Problems
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActiveLink('/dashboard') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-4">
              <SignedIn>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-500">
                    {user?.firstName}
                  </span>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-9 h-9'
                      }
                    }}
                  />
                </div>
              </SignedIn>
              
              <SignedOut>
                <Link 
                  to="/sign-in" 
                  className="text-neutral-600 hover:text-neutral-900 font-medium px-4 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up" 
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Get Started
                </Link>
              </SignedOut>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 w-5 bg-neutral-600 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 w-5 bg-neutral-600 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-neutral-600 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              <SignedIn>
                <Link
                  to="/problems"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium ${
                    isActiveLink('/problems') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Problems
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium ${
                    isActiveLink('/dashboard') 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="pt-4 border-t border-neutral-200 flex items-center gap-3">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm text-neutral-600">{user?.fullName}</span>
                </div>
              </SignedIn>
              
              <SignedOut>
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg font-medium bg-orange-500 text-white text-center"
                >
                  Get Started
                </Link>
              </SignedOut>
            </div>
          </div>
        )}
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route 
          path="/sign-in" 
          element={
            <div className="min-h-screen bg-neutral-50 pt-24 flex items-center justify-center px-4">
              <div className="w-full max-w-md animate-fade-in-up">
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-lg rounded-xl'
                    }
                  }}
                  redirectUrl="/dashboard"
                />
              </div>
            </div>
          } 
        />
        
        <Route 
          path="/sign-up" 
          element={
            <div className="min-h-screen bg-neutral-50 pt-24 flex items-center justify-center px-4">
              <div className="w-full max-w-md animate-fade-in-up">
                <SignUp 
                  appearance={{
                    elements: {
                      rootBox: 'w-full',
                      card: 'shadow-lg rounded-xl'
                    }
                  }}
                  redirectUrl="/dashboard"
                />
              </div>
            </div>
          } 
        />

        <Route 
          path="/problems" 
          element={<ProtectedRoute><ProblemsPage /></ProtectedRoute>} 
        />
        
        <Route 
          path="/problems/:problemId" 
          element={<ProtectedRoute><ProblemPage /></ProtectedRoute>} 
        />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} 
        />

        {/* 404 Route */}
        <Route 
          path="*" 
          element={
            <div className="min-h-screen bg-neutral-50 pt-24 flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-neutral-900 mb-4">404</h1>
                <p className="text-xl text-neutral-600 mb-8">Page not found</p>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;