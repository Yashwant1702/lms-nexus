import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '@components/common';
import {
  BookOpen,
  Award,
  Users,
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Target,
  Zap,
} from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-900/10 dark:to-teal-900/10 -z-10" />
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Welcome to the Future of Learning
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Learn, Grow, and Excel with{' '}
            <span className="text-gradient">LMS Nexus</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A modern learning management system with gamification, real-time collaboration, 
            AI-powered recommendations, and comprehensive analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Explore Courses
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <StatItem number="10K+" label="Active Learners" />
            <StatItem number="500+" label="Courses" />
            <StatItem number="95%" label="Success Rate" />
            <StatItem number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Powerful features designed to enhance your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Rich Content Library"
            description="Access videos, documents, interactive quizzes, and live sessions"
            color="blue"
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Gamification System"
            description="Earn points, unlock badges, and compete on leaderboards"
            color="yellow"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Real-time Collaboration"
            description="Chat with peers, join study groups, and participate in forums"
            color="green"
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Advanced Analytics"
            description="Track your progress with detailed insights and reports"
            color="purple"
          />
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Personalized Learning"
            description="AI-powered recommendations based on your goals and progress"
            color="red"
          />
          <FeatureCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Certified Completion"
            description="Earn verified certificates upon course completion"
            color="teal"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-charcoal-800 -mx-4 px-4 py-16 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <StepCard
            number="1"
            title="Create Account"
            description="Sign up for free and set your learning goals"
            icon={<Users className="w-8 h-8" />}
          />
          <StepCard
            number="2"
            title="Choose Courses"
            description="Browse our catalog and enroll in courses that match your interests"
            icon={<BookOpen className="w-8 h-8" />}
          />
          <StepCard
            number="3"
            title="Start Learning"
            description="Complete lessons, take assessments, and earn certificates"
            icon={<Award className="w-8 h-8" />}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <Card className="bg-gradient-to-br from-primary-500 to-teal-600 text-white border-0">
          <div className="py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of learners already transforming their careers with LMS Nexus
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/register">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Sign Up Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

const StatItem = ({ number, label }) => (
  <div>
    <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-1">
      {number}
    </div>
    <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};

const StepCard = ({ number, title, description, icon }) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
      {icon}
    </div>
    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      {description}
    </p>
  </div>
);

export default Home;
