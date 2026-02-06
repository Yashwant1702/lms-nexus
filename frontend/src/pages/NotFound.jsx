import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@components/common';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-charcoal-700">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
            404
          </h1>
          <div className="relative -mt-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Page Not Found
            </h2>
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" size="lg">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
