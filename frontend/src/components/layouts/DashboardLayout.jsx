import React, { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '@hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Award,
  Bell,
  MessageCircle,
  BarChart3,
  Trophy,
  Settings as SettingsIcon,
  Users,
  Menu,
  X,
} from 'lucide-react';
import Avatar from '@components/common/Avatar';
import { Button, Badge } from '@components/common';
import { useNotifications } from '@hooks/useNotifications';

const DashboardLayout = ({ isAdmin = false }) => {
  const { sidebarOpen, sidebarCollapsed, toggleSidebar, toggleSidebarCollapsed } =
    useUIStore();
  const { user } = useAuth();
  const location = useLocation();
  const { unreadCount, fetchUnreadCount } = useNotifications(false);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <div className="min-h-screen flex bg-cream-50 dark:bg-charcoal-700">
      {/* Sidebar */}
      <Sidebar
        isAdmin={isAdmin}
        sidebarCollapsed={sidebarCollapsed}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        toggleSidebarCollapsed={toggleSidebarCollapsed}
        unreadCount={unreadCount}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <DashboardHeader unreadCount={unreadCount} />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet key={location.pathname} />
        </main>
      </div>
    </div>
  );
};

const Sidebar = ({
  isAdmin,
  sidebarCollapsed,
  sidebarOpen,
  toggleSidebar,
  toggleSidebarCollapsed,
  unreadCount,
}) => {
  const baseNav = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/dashboard/courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/dashboard/assessments', label: 'Assessments', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/dashboard/certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
    { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/dashboard/knowledge-base', label: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/dashboard/chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
    {
      to: '/dashboard/notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadCount,
    },
    { to: '/dashboard/settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const adminNav = [
    { to: '/admin', label: 'Admin Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/courses', label: 'Course Management', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/assessments', label: 'Assessments', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const navItems = isAdmin ? adminNav : baseNav;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={toggleSidebar}
      />

      <aside
        className={`
          fixed lg:static z-40 h-full bg-white dark:bg-charcoal-800 border-r border-gray-200 dark:border-gray-700
          flex flex-col transition-all duration-200
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo / collapse */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-primary-500 text-white text-sm font-bold">
              LN
            </span>
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {isAdmin ? 'Admin' : 'Dashboard'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden lg:inline-flex p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              {sidebarCollapsed ? '<' : '>'}
            </button>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `
                  }
                >
                  <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <Badge variant="danger" size="sm" rounded>
                          {item.badge}
                        </Badge>
                      ) : null}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

const DashboardHeader = ({ unreadCount }) => {
  const { user } = useAuth();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-charcoal-800/80 backdrop-blur flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.firstName}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2">
          <Avatar
            src={user?.avatarUrl}
            name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
            size="sm"
          />
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardLayout;
