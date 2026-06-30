import React from 'react';
import { LogIn, LogOut, User as UserIcon, Home, Compass, Shield, ClipboardList } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick,
  activeTab,
  setActiveTab
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div 
          className="flex cursor-pointer items-center space-x-2"
          onClick={() => setActiveTab('explore')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Hostel<span className="text-indigo-600">Hub</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Stay & Manage
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === 'explore'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Explore Hostels</span>
          </button>

          {currentUser && currentUser.role === 'customer' && (
            <>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'bookings'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span>My Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>My Profile</span>
              </button>
            </>
          )}

          {currentUser && currentUser.role === 'supplier' && (
            <>
              <button
                onClick={() => setActiveTab('supplier-dashboard')}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'supplier-dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Supplier Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Supplier Profile</span>
              </button>
            </>
          )}
        </nav>

        {/* User Auth Controls */}
        <div className="flex items-center space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Login Tracker Display */}
              <div className="hidden lg:flex flex-col items-end text-xs">
                <span className="font-medium text-slate-500">
                  Logged in as <strong className="text-slate-700">{currentUser.username}</strong>
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                  ⚡ Login Count: {currentUser.loginCount}
                </span>
              </div>

              {/* Role badge */}
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                currentUser.role === 'supplier' 
                  ? 'bg-purple-50 text-purple-700 ring-purple-700/10' 
                  : 'bg-indigo-50 text-indigo-700 ring-indigo-700/10'
              }`}>
                {currentUser.role === 'supplier' ? 'Owner / Supplier' : 'Customer'}
              </span>

              {/* Profile icon on mobile */}
              <button
                onClick={() => setActiveTab('profile')}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="View Profile"
              >
                <UserIcon className="h-4 w-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogoutClick}
                className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      {currentUser && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 py-2 text-xs">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center space-y-0.5 font-medium ${
              activeTab === 'explore' ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Explore</span>
          </button>

          {currentUser.role === 'customer' && (
            <>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex flex-col items-center space-y-0.5 font-medium ${
                  activeTab === 'bookings' ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                <span>Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center space-y-0.5 font-medium ${
                  activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </>
          )}

          {currentUser.role === 'supplier' && (
            <>
              <button
                onClick={() => setActiveTab('supplier-dashboard')}
                className={`flex flex-col items-center space-y-0.5 font-medium ${
                  activeTab === 'supplier-dashboard' ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center space-y-0.5 font-medium ${
                  activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
