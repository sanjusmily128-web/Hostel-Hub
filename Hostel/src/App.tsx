import { useState } from 'react';
import { useHostelState } from './hooks/useHostelState';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CustomerModule } from './components/CustomerModule';
import { BookingHistory } from './components/BookingHistory';
import { UserProfile } from './components/UserProfile';
import { SupplierModule } from './components/SupplierModule';
import { 
  Building, User as UserIcon, Sparkles, Shield
} from 'lucide-react';

export default function App() {
  const {
    hostels,
    reviews,
    bookings,
    currentUser,
    users,
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    createBooking,
    handleBookingDecision,
    addReview,
    registerHostel,
    updateHostelInfo,
    updateHostelImages,
    addFloor,
    addRoom,
    toggleBedStatus,
    getHostelVacancyStats
  } = useHostelState();

  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [demoBannerOpen, setDemoBannerOpen] = useState(true);

  // Handle Auth success from the modal (called for both sign up and login)
  const handleAuthSuccess = (
    userData: any, 
    passwordHash: string, 
    isSignUp: boolean
  ): { success: boolean; message: string } => {
    if (isSignUp) {
      const signupResult = registerUser(
        {
          username: userData.username,
          email: userData.email,
          mobile: userData.mobile,
          role: userData.role
        },
        passwordHash
      );
      if (signupResult.success) {
        // Redirect to appropriate dashboard on signup success
        if (userData.role === 'supplier') {
          setActiveTab('supplier-dashboard');
        } else {
          setActiveTab('explore');
        }
      }
      return signupResult;
    } else {
      const loginResult = loginUser(userData.username, passwordHash);
      if (loginResult.success) {
        // Find the user's role to redirect properly
        // Check local users list
        const matchedUser = loginResult.success ? true : false;
        if (matchedUser) {
          // Check role from storage
          const storedUsers = localStorage.getItem('hostel_system_users');
          if (storedUsers) {
            const usersList = JSON.parse(storedUsers);
            const found = usersList.find((u: any) => 
              u.user.username.toLowerCase() === userData.username.toLowerCase() || 
              u.user.email.toLowerCase() === userData.username.toLowerCase()
            );
            if (found) {
              if (found.user.role === 'supplier') {
                setActiveTab('supplier-dashboard');
              } else {
                setActiveTab('explore');
              }
            }
          }
        }
      }
      return loginResult;
    }
  };

  // Switch to supplier or customer preset for quick testing
  const triggerDemoLogin = (role: 'customer' | 'supplier') => {
    if (role === 'supplier') {
      loginUser('RameshHostels', 'password123');
      setActiveTab('supplier-dashboard');
    } else {
      loginUser('AmitPatel', 'password123');
      setActiveTab('explore');
    }
    
    // Refresh the page state smoothly by triggering a small re-render or just relying on state update
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      
      {/* Header component */}
      <Header
        currentUser={currentUser}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogoutClick={() => {
          logoutUser();
          setActiveTab('explore');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Interactive Demo Mode Help Guide */}
        {demoBannerOpen && (
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-2xs">
            <div className="absolute top-0 right-0 p-2">
              <button 
                onClick={() => setDemoBannerOpen(false)}
                className="text-indigo-400 hover:text-indigo-600 font-bold text-xs"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex items-start space-x-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-indigo-600 shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-950">
                  Interactive Evaluation & Live Testing Guide
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                  This system supports <strong>real-time bidirectional updates</strong> between customers and suppliers. 
                  When the Supplier updates room occupancy, adds a floor, or approves a booking request, the changes immediately 
                  reflect in the Customer’s <strong>movie-ticket bed selection board</strong>!
                </p>

                {/* Quick login buttons */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase self-center mr-1">Quick Demo Login:</span>
                  <button 
                    onClick={() => triggerDemoLogin('supplier')}
                    className="inline-flex items-center rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-all"
                  >
                    <Shield className="mr-1 h-3.5 w-3.5" />
                    <span>Login as Owner (RameshHostels)</span>
                  </button>
                  <button 
                    onClick={() => triggerDemoLogin('customer')}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
                  >
                    <UserIcon className="mr-1 h-3.5 w-3.5" />
                    <span>Login as Customer (AmitPatel)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Routing Renders */}
        <div className="transition-all duration-300">
          {activeTab === 'explore' && (
            <CustomerModule
              hostels={hostels}
              reviews={reviews}
              currentUser={currentUser}
              onBookBed={createBooking}
              onAddReview={addReview}
              onLoginClick={() => setIsAuthModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingHistory
              bookings={bookings}
              currentUser={currentUser}
              hostels={hostels}
              users={users}
              onExploreClick={() => setActiveTab('explore')}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfile
              currentUser={currentUser}
              onUpdateProfile={updateProfile}
            />
          )}

          {activeTab === 'supplier-dashboard' && (
            <SupplierModule
              currentUser={currentUser}
              hostels={hostels}
              bookings={bookings}
              onRegisterHostel={registerHostel}
              onUpdateHostelInfo={updateHostelInfo}
              onUpdateHostelImages={updateHostelImages}
              onAddFloor={addFloor}
              onAddRoom={addRoom}
              onToggleBedStatus={toggleBedStatus}
              onBookingDecision={handleBookingDecision}
              getHostelVacancyStats={getHostelVacancyStats}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex justify-center items-center space-x-2">
            <Building className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-slate-700">HostelHub Digital System</span>
            <span className="text-slate-300">|</span>
            <span>Real-Time Bed Booking & Management Platform</span>
          </div>
          <p className="max-w-md mx-auto leading-relaxed">
            Designed for students and hostel managers to check room-wise and floor-wise availability, write verified reviews, and process digital joining forms.
          </p>
          <p className="text-[10px]">
            &copy; 2026 HostelHub Inc. All rights reserved. Persistent authentication & login activity active.
          </p>
        </div>
      </footer>

      {/* Login & Signup Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}
