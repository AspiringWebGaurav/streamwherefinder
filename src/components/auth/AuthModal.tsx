'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="responsive-card"
      variant="horizontal"
      showHeader={false}
      className="modal-glass border-0"
    >
      {/* Responsive Layout Container */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-8 xl:gap-12 space-y-6 lg:space-y-0">
        
        {/* Main Content Section - Left on Desktop, Top on Mobile */}
        <div className="flex-1 lg:max-w-md xl:max-w-lg space-y-4 md:space-y-5 lg:space-y-6">
          
          {/* Compact Header */}
          <div className="text-center lg:text-left space-y-3 md:space-y-4">
            <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 gradient-dynamic rounded-full mx-auto lg:mx-0 flex items-center justify-center">
              <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 brand-text leading-tight">
                Save Your Search History
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed mt-2">
                Sign in to save searches and get personalized recommendations
              </p>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full btn-google-signin gradient-hover flex items-center justify-center gap-3 md:gap-4 py-4 md:py-5 lg:py-6 px-4 md:px-5 lg:px-6 rounded-xl md:rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:shadow-2xl glow group"
            aria-label="Sign in with Google"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-b-2 border-white" aria-hidden="true"></div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" className="md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-white group-hover:text-cyan-100 transition-colors duration-200">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="glass p-3 md:p-4 border border-red-300/30 rounded-xl md:rounded-2xl">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-8h2v6h-2V9z"/>
                  </svg>
                </div>
                <p className="text-xs md:text-sm text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Features & Privacy Section - Right on Desktop, Bottom on Mobile */}
        <div className="flex-1 lg:max-w-sm xl:max-w-md space-y-4 md:space-y-5">
          
          {/* Compact Features */}
          <div className="glass p-4 md:p-5 lg:p-6 rounded-xl md:rounded-2xl">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Why sign in?</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 gradient-dynamic rounded-full flex-shrink-0"></div>
                <span className="text-xs md:text-sm text-gray-600">Save search history across devices</span>
              </li>
              <li className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 gradient-dynamic rounded-full flex-shrink-0"></div>
                <span className="text-xs md:text-sm text-gray-600">Get personalized recommendations</span>
              </li>
              <li className="flex items-center space-x-2 md:space-x-3">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 gradient-dynamic rounded-full flex-shrink-0"></div>
                <span className="text-xs md:text-sm text-gray-600">Track viewing preferences</span>
              </li>
            </ul>
          </div>

          {/* Compact Privacy Notice */}
          <div className="glass p-3 md:p-4 rounded-xl md:rounded-2xl">
            <p className="text-xs text-gray-600 leading-relaxed text-center lg:text-left">
              By signing in, you agree to our{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-800 underline transition-colors duration-200">
                Terms
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-purple-600 hover:text-purple-800 underline transition-colors duration-200">
                Privacy Policy
              </a>
              . Enterprise-grade security.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}