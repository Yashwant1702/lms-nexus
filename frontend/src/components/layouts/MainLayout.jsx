import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '@hooks/useAuth';
import { Button } from '@components/common';
import { Moon, Sun } from 'lucide-react';

const MainLayout = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useUIStore();
  const { isAuthenticated, user, logoutWithRedirect } = useAuth();

  const isActive = (path) =>
    location.pathname === path
      ? 'text-primary-500'
      : 'text-gray-600 dark:text-gray-300';

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 dark:bg-charcoal-700">
      {/* Navbar */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur">
        <nav className="container-custom flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary-500 text-white font-bold">
              LN
            </span>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              LMS Nexus
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/courses" className={isActive('/courses')}>
              Courses
            </Link>
            <Link to="/about" className={isActive('/about')}>
              About
            </Link>
            <Link to="/contact" className={isActive('/contact')}>
              Contact
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-flex text-sm text-gray-600 dark:text-gray-300"
                >
                  Hi, {user?.firstName}
                </Link>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => logoutWithRedirect('/')}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button size="sm" variant="secondary">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="primary">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="container-custom py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const Footer = () => (
  <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-charcoal-800">
    <div className="container-custom py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
      <span>© {new Date().getFullYear()} LMS Nexus. All rights reserved.</span>
      <div className="flex items-center gap-4">
        <Link to="/terms" className="hover:text-primary-500">
          Terms
        </Link>
        <Link to="/privacy" className="hover:text-primary-500">
          Privacy
        </Link>
        <span className="hidden sm:inline">
          v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
        </span>
      </div>
    </div>
  </footer>
);

export default MainLayout;
