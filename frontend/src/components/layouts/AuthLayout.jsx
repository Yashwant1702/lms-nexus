import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';
import { Moon, Sun } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <div className="min-h-screen flex bg-cream-50 dark:bg-charcoal-700">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#fff,_transparent_60%)]" />
        <div className="relative z-10 max-w-md px-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 font-bold">
              LN
            </span>
            <span className="text-xl font-semibold">LMS Nexus</span>
          </div>
          <h1 className="text-3xl font-semibold mb-3">
            Learn, grow, and certify with confidence.
          </h1>
          <p className="text-sm text-white/80">
            A modern learning experience with personalized recommendations, rich analytics, and gamification to keep learners engaged.
          </p>
        </div>
      </div>

      {/* Right panel (form) */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8">
        <div className="w-full max-w-md">
          {/* Top header for mobile */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary-500 text-white text-sm font-bold">
                LN
              </span>
              <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                LMS Nexus
              </span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="card">
            <Outlet />
          </div>

          <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-primary-500 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary-500 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
