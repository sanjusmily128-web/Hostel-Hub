import React, { useState } from 'react';
import { 
  Search, MapPin, Star, Bed as BedIcon, Users, 
  ChevronRight, Award, CheckCircle, 
  ArrowLeft, Upload, Grid, Sparkles, X
} from 'lucide-react';
import { Hostel, Review, Booking, User, Bed, Room } from '../types';
import { validateMobile } from '../utils/validation';

interface CustomerModuleProps {
  hostels: Hostel[];
  reviews: Review[];
  currentUser: User | null;
  onBookBed: (bookingData: Omit<Booking, 'id' | 'status' | 'bookingDate'>) => Booking;
  onAddReview: (reviewData: Omit<Review, 'id' | 'date' | 'isVerified'>) => void;
  onLoginClick: () => void;
  setActiveTab: (tab: string) => void;
}

export const CustomerModule: React.FC<CustomerModuleProps> = ({
  hostels,
  reviews,
  currentUser,
  onBookBed,
  onAddReview,
  onLoginClick,
  setActiveTab
}) => {
  // Navigation & UI States
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(null);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedSharing, setSelectedSharing] = useState<number | null>(null);
  const [onlyVaccinated, setOnlyVaccinated] = useState(false);

  // Bed Selection States (Movie-ticket style)
  const [activeFloorNo, setActiveFloorNo] = useState<number | null>(null);
  const [activeRoomNo, setActiveRoomNo] = useState<string | null>(null);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  // Tenant Booking Form States
  const [bookingName, setBookingName] = useState('');
  const [bookingMobile, setBookingMobile] = useState('');
  const [bookingEmergency, setBookingEmergency] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review Form States
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewCategory, setReviewCategory] = useState<'food' | 'rooms' | 'facilities' | 'general'>('general');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [newReviewError, setNewReviewError] = useState('');
  const [newReviewSuccess, setNewReviewSuccess] = useState(false);

  // Review Filtering & Sorting
  const [reviewFilterCategory, setReviewFilterCategory] = useState<string>('All');
  const [reviewSortOrder, setReviewSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');

  // Available Areas for quick filtering
  const areas = ['All', ...Array.from(new Set(hostels.map(h => h.area.split(',')[0].trim())))];

  // Selected Hostel Object
  const currentHostel = hostels.find(h => h.id === selectedHostelId);

  // Selected Room Object
  let currentRoom: Room | undefined;
  if (currentHostel && activeFloorNo !== null && activeRoomNo !== null) {
    const floor = currentHostel.floors.find(f => f.floorNo === activeFloorNo);
    currentRoom = floor?.rooms.find(r => r.roomNo === activeRoomNo);
  }

  // Handle Hostel Click
  const handleHostelClick = (id: string) => {
    if (!currentUser) {
      // Prompt user to login first if they are not logged in
      onLoginClick();
      return;
    }

    setSelectedHostelId(id);
    setActiveFloorNo(null);
    setActiveRoomNo(null);
    setSelectedBedId(null);
    setBookingError('');
    setBookingSuccess(false);
    
    // Auto populate booking details if user is logged in
    setBookingName(currentUser.username);
    setBookingMobile(currentUser.mobile);
  };

  // Filter Hostels
  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = 
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.area.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesArea = selectedArea === 'All' || hostel.area.toLowerCase().includes(selectedArea.toLowerCase());
    
    const matchesSharing = selectedSharing === null || hostel.sharingFees[selectedSharing] !== undefined;
    
    const matchesVaccination = !onlyVaccinated || hostel.vaccinationStatus === '100% Vaccinated Staff';

    return matchesSearch && matchesArea && matchesSharing && matchesVaccination;
  });

  // Calculate total, occupied, empty beds helper for list cards
  const getBedsCount = (hostel: Hostel) => {
    let total = 0;
    let occupied = 0;
    let empty = 0;
    hostel.floors.forEach(f => {
      f.rooms.forEach(r => {
        total += r.totalBeds;
        occupied += r.occupiedBeds;
        empty += r.emptyBeds;
      });
    });
    return { total, occupied, empty };
  };

  // Handle Bed Selection click
  const handleBedClick = (bed: Bed) => {
    if (bed.status === 'occupied') {
      alert('This bed is already occupied. Please select an empty bed (marked in green).');
      return;
    }
    setSelectedBedId(bed.id === selectedBedId ? null : bed.id);
    setBookingError('');
  };

  // Handle Booking Submit
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!currentUser) {
      onLoginClick();
      return;
    }

    if (!currentHostel || activeFloorNo === null || !activeRoomNo || !selectedBedId || !currentRoom) {
      setBookingError('Please select a floor, room, and available bed first.');
      return;
    }

    if (!bookingName.trim()) {
      setBookingError('Full Name is required for the joining process.');
      return;
    }

    if (!bookingMobile || !validateMobile(bookingMobile)) {
      setBookingError('A valid 10-digit mobile number starting with 6, 7, 8, or 9 is required.');
      return;
    }

    if (!bookingEmergency || !validateMobile(bookingEmergency)) {
      setBookingError('A valid 10-digit emergency contact number is required.');
      return;
    }

    if (bookingMobile === bookingEmergency) {
      setBookingError('Emergency contact number must be different from your primary mobile number.');
      return;
    }

    if (!dateOfJoining) {
      setBookingError('Please select your Date of Joining.');
      return;
    }

    const bedObj = currentRoom.beds.find(b => b.id === selectedBedId);
    if (!bedObj) return;

    // Create the booking
    onBookBed({
      hostelId: currentHostel.id,
      hostelName: currentHostel.name,
      floorNo: activeFloorNo,
      roomNo: activeRoomNo,
      bedId: selectedBedId,
      bedName: bedObj.name,
      customerName: bookingName,
      customerEmail: currentUser.email,
      customerMobile: bookingMobile,
      sharingType: currentRoom.sharingType,
      fee: currentHostel.sharingFees[currentRoom.sharingType] || 5000,
      dateOfJoining,
      emergencyContact: bookingEmergency
    });

    setBookingSuccess(true);
    setSelectedBedId(null);
    setTimeout(() => {
      setBookingSuccess(false);
      setActiveTab('bookings'); // Redirect to bookings tab
    }, 2000);
  };

  // Review Form Image Upload Simulation & Presets
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReviewImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addPresetImage = (url: string) => {
    if (reviewImages.includes(url)) {
      setReviewImages(prev => prev.filter(img => img !== url));
    } else {
      setReviewImages(prev => [...prev, url]);
    }
  };

  // Preset images for review submissions to make it super interactive
  const REVIEW_IMAGE_PRESETS = [
    { name: 'Clean Room', url: 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=400' },
    { name: 'Bunk Bed Close-up', url: 'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=400' },
    { name: 'Delicious Thali / Meal', url: 'https://images.pexels.com/photos/7518987/pexels-photo-7518987.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=400' },
    { name: 'Dining / Lounge Area', url: 'https://images.pexels.com/photos/1548873/pexels-photo-1548873.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=400' }
  ];

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setNewReviewError('');
    setNewReviewSuccess(false);

    if (!currentUser) {
      onLoginClick();
      return;
    }

    if (!selectedHostelId) return;

    if (!reviewFeedback.trim() || reviewFeedback.length < 10) {
      setNewReviewError('Please write a feedback comment of at least 10 characters.');
      return;
    }

    onAddReview({
      hostelId: selectedHostelId,
      customerName: currentUser.username,
      rating: reviewRating,
      feedback: reviewFeedback,
      images: reviewImages,
      category: reviewCategory
    });

    setNewReviewSuccess(true);
    setReviewFeedback('');
    setReviewImages([]);
    setReviewRating(5);
    setReviewCategory('general');

    setTimeout(() => {
      setNewReviewSuccess(false);
    }, 2500);
  };

  // Filtered & Sorted Reviews for the selected hostel
  const hostelReviews = reviews.filter(r => r.hostelId === selectedHostelId);
  
  const filteredReviews = hostelReviews.filter(r => {
    if (reviewFilterCategory === 'All') return true;
    return r.category.toLowerCase() === reviewFilterCategory.toLowerCase();
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (reviewSortOrder === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (reviewSortOrder === 'highest') {
      return b.rating - a.rating;
    } else {
      return a.rating - b.rating;
    }
  });

  // Render Hostel Grid List
  const renderExploreList = () => (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-950 px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.25),rgba(217,70,239,0.15))]"></div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
            ✨ Stress-Free Hostel Searching
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Find Premium Hostels with Real-Time Bed Vacancy
          </h1>
          <p className="text-base text-indigo-200">
            Explore single sharing up to 6 sharing options. Check detailed floor layouts, view real reviews with images, and book beds instantly.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Text Search */}
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search by Name, Area or City
            </label>
            <div className="relative">
              <Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Area Select Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Surrounding Area
            </label>
            <div className="relative">
              <MapPin className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all appearance-none bg-white"
              >
                {areas.map((a, idx) => (
                  <option key={idx} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sharing Type Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Room Sharing Category
            </label>
            <div className="relative">
              <Users className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
              <select
                value={selectedSharing === null ? '' : selectedSharing}
                onChange={(e) => setSelectedSharing(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all appearance-none bg-white"
              >
                <option value="">Any Sharing (1 - 6)</option>
                <option value="1">1 Sharing (Single)</option>
                <option value="2">2 Sharing</option>
                <option value="3">3 Sharing</option>
                <option value="4">4 Sharing</option>
                <option value="5">5 Sharing</option>
                <option value="6">6 Sharing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sub-Filters / Vaccination Badge */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="vaccinated"
              checked={onlyVaccinated}
              onChange={(e) => setOnlyVaccinated(e.target.checked)}
              className="h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="vaccinated" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
              🛡 Show only 100% Vaccinated Staff hostels
            </label>
          </div>
          
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-indigo-600 font-semibold">{filteredHostels.length}</strong> available hostels
          </div>
        </div>
      </div>

      {/* Hostels Grid */}
      {filteredHostels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center border border-dashed border-slate-300">
          <MapPin className="h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Hostels Found</h3>
          <p className="text-sm text-slate-500 max-w-md mt-1">
            We couldn't find any hostels matching your criteria. Try adjusting your search query, surrounding area, or sharing preferences.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHostels.map((hostel) => {
            const stats = getBedsCount(hostel);
            return (
              <div 
                key={hostel.id}
                onClick={() => handleHostelClick(hostel.id)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-400 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={hostel.images[0] || 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'} 
                    alt={hostel.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-4">
                    <span className="inline-flex items-center rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {hostel.vaccinationStatus}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-white line-clamp-1">
                      {hostel.name}
                    </h3>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-1 flex-col p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="font-medium line-clamp-1">{hostel.area}</span>
                    </div>
                  </div>

                  {/* Pricing / Sharing list */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Sharing Fees (Starting prices)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(hostel.sharingFees).map(([sharing, fee]) => (
                        <span key={sharing} className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700">
                          {sharing} Sharing: <strong className="text-indigo-700 ml-1">₹{fee}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ratings & Bed Vacancy Counts */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                    {/* Ratings */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="ml-1 font-bold text-slate-800">{hostel.foodRating}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Food)</span>
                      </div>
                      <div className="h-3 w-px bg-slate-200"></div>
                      <div className="flex items-center text-indigo-500">
                        <Award className="h-3.5 w-3.5" />
                        <span className="ml-1 font-bold text-slate-800">{hostel.cleaningRating}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-0.5">(Clean)</span>
                      </div>
                    </div>

                    {/* Vacancy Badge */}
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                      stats.empty > 0 
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                        : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                    }`}>
                      {stats.empty > 0 ? `Empty beds: ${stats.empty}` : 'Full'}
                    </span>
                  </div>
                </div>

                {/* Footer action button */}
                <div className={`border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs font-semibold group-hover:text-indigo-800 transition-colors ${
                  currentUser 
                    ? 'bg-slate-50 text-indigo-600' 
                    : 'bg-amber-50/50 text-amber-700'
                }`}>
                  {currentUser ? (
                    <>
                      <span>Check Room Availability</span>
                      <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      <span className="flex items-center">
                        <span className="mr-1.5">🔑</span>
                        Login to Check Room Availability
                      </span>
                      <ChevronRight className="h-4 w-4 text-amber-500 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Detailed Hostel Page
  const renderHostelDetails = () => {
    if (!currentHostel) return null;
    const vacancyStats = getBedsCount(currentHostel);

    return (
      <div className="space-y-6">
        {/* Back navigation button */}
        <button
          onClick={() => setSelectedHostelId(null)}
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Hostels</span>
        </button>

        {/* Grid layout for images and basic hostel details */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Main Hostel Info & Images */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Image Gallery */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-xs">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="h-64 overflow-hidden rounded-2xl bg-slate-100 sm:h-80">
                  <img 
                    src={currentHostel.images[0] || 'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'} 
                    alt={currentHostel.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid grid-rows-2 gap-2">
                  <div className="h-[124px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[156px]">
                    <img 
                      src={currentHostel.images[1] || 'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'} 
                      alt="Facility"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="relative h-[124px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[156px]">
                    <img 
                      src={currentHostel.images[0] || 'https://images.pexels.com/photos/7968273/pexels-photo-7968273.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'} 
                      alt="Room preset"
                      className="h-full w-full object-cover blur-[1px] opacity-75"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white font-bold text-xs p-2 text-center">
                      <span>Real-time owner-uploaded room photos</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Title Details Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      🛡 {currentHostel.vaccinationStatus}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      Verified Owner: {currentHostel.ownerUsername}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{currentHostel.name}</h2>
                  <p className="mt-1.5 flex items-center text-sm text-slate-500 font-medium">
                    <MapPin className="mr-1.5 h-4 w-4 text-indigo-600 shrink-0" />
                    {currentHostel.address}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Vacancy</span>
                  <span className="text-3xl font-extrabold text-indigo-600 block my-1">
                    {vacancyStats.empty}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Beds available / {vacancyStats.total}
                  </span>
                </div>
              </div>

              {/* Ratings Grid */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
                <div className="flex items-center space-x-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Star className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Food Quality Rating</span>
                    <span className="text-base font-bold text-slate-800">{currentHostel.foodRating} / 5.0</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase">Cleaning & Hygiene</span>
                    <span className="text-base font-bold text-slate-800">{currentHostel.cleaningRating} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Sharing Fee Structure Cards */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Room Sharing Options & Monthly Fees</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const fee = currentHostel.sharingFees[num];
                    return (
                      <div 
                        key={num}
                        className={`rounded-2xl border p-3.5 text-center transition-all ${
                          fee 
                            ? 'border-slate-200 bg-white shadow-xs' 
                            : 'border-slate-100 bg-slate-50/40 opacity-50'
                        }`}
                      >
                        <span className="block text-xs font-semibold text-slate-500">{num} Sharing Room</span>
                        {fee ? (
                          <>
                            <span className="text-lg font-bold text-slate-900 mt-1 block">₹{fee}</span>
                            <span className="text-[10px] text-indigo-600 font-medium">Monthly Rent</span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 mt-2 block">Not Available</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 1: Room-wise & Floor-wise availability (Individually displayed) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 flex items-center">
                  <Grid className="h-5 w-5 mr-2 text-indigo-600" />
                  Room-wise & Floor-wise Bed Vacancy Status
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Each floor and room with available beds is listed individually. Select a room to view its interactive bed map and make reservations.
                </p>
              </div>

              <div className="space-y-4">
                {currentHostel.floors.map((floor) => (
                  <div key={floor.floorNo} className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                    <div className="border-b border-slate-200 pb-2 mb-3">
                      <span className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                        Floor {floor.floorNo}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {floor.rooms.map((room) => {
                        const isSelected = activeFloorNo === floor.floorNo && activeRoomNo === room.roomNo;
                        return (
                          <div
                            key={room.roomNo}
                            onClick={() => {
                              setActiveFloorNo(floor.floorNo);
                              setActiveRoomNo(room.roomNo);
                              setSelectedBedId(null);
                              setBookingError('');
                            }}
                            className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-sm">Room {room.roomNo}</span>
                              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {room.sharingType} Sharing
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[11px] border-t border-slate-100 pt-2.5">
                              <div>
                                <span className="block text-slate-400">Total</span>
                                <span className="font-bold text-slate-800">{room.totalBeds} Beds</span>
                              </div>
                              <div>
                                <span className="block text-slate-400">Occupied</span>
                                <span className="font-bold text-amber-700">{room.occupiedBeds} Beds</span>
                              </div>
                              <div>
                                <span className="block text-slate-400">Empty</span>
                                <span className={`font-extrabold ${room.emptyBeds > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {room.emptyBeds} Beds
                                </span>
                              </div>
                            </div>

                            <div className="mt-3 text-center">
                              <span className={`text-[11px] font-bold inline-block px-2.5 py-0.5 rounded-full ${
                                room.emptyBeds > 0 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                {room.emptyBeds > 0 ? '✓ Available for Booking' : '✗ Fully Occupied'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Verified Reviews & Photos</h3>
                  <p className="text-xs text-slate-500">Student & resident feedback. Customer privacy is strictly maintained without profile pictures.</p>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Category */}
                  <select
                    value={reviewFilterCategory}
                    onChange={(e) => setReviewFilterCategory(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Food">Food Reviews</option>
                    <option value="Rooms">Room Reviews</option>
                    <option value="Facilities">Facilities</option>
                    <option value="General">General</option>
                  </select>

                  {/* Sort Order */}
                  <select
                    value={reviewSortOrder}
                    onChange={(e) => setReviewSortOrder(e.target.value as any)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              {sortedReviews.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">No reviews found in this category. Be the first to write one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedReviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* Name only, privacy maintained: no photo */}
                          <span className="font-bold text-slate-800 text-sm">{review.customerName}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-sm">
                            {review.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">{review.date}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3.5 w-3.5 ${i < Math.floor(review.rating) ? 'fill-current' : 'text-slate-200'}`} 
                          />
                        ))}
                        <span className="ml-1 text-xs font-bold text-slate-700">{review.rating} Stars</span>
                      </div>

                      {/* Comment */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {review.feedback}
                      </p>

                      {/* Uploaded Review Images (Real-time) */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {review.images.map((imgUrl, imgIdx) => (
                            <div key={imgIdx} className="h-16 w-24 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 shadow-2xs cursor-zoom-in group">
                              <img 
                                src={imgUrl} 
                                alt="Real-time feedback upload" 
                                className="h-full w-full object-cover group-hover:scale-110 transition-all duration-300"
                                onClick={() => window.open(imgUrl, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Submit a Review Form */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm flex items-center">
                    <Sparkles className="h-4 w-4 mr-1.5 text-indigo-600" />
                    Submit a Review & Upload Real-Time Photos
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your feedback helps others make informed decisions. We value your privacy: <strong>profile photos are excluded</strong>.
                  </p>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-3">
                  {newReviewError && (
                    <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">{newReviewError}</p>
                  )}
                  {newReviewSuccess && (
                    <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg">✓ Review submitted and verified successfully!</p>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Stars Select */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Rating</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Exceptional</option>
                        <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
                        <option value="3">⭐⭐⭐ 3 Stars - Average</option>
                        <option value="2">⭐⭐ 2 Stars - Poor</option>
                        <option value="1">⭐ 1 Star - Terrible</option>
                      </select>
                    </div>

                    {/* Category Select */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Category</label>
                      <select
                        value={reviewCategory}
                        onChange={(e) => setReviewCategory(e.target.value as any)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                      >
                        <option value="general">General Stay</option>
                        <option value="food">Food & Dining</option>
                        <option value="rooms">Rooms & Sleeping Space</option>
                        <option value="facilities">Facilities & Amenities</option>
                      </select>
                    </div>
                  </div>

                  {/* Feedback comment */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Your Review Feedback</label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Share your honest feedback about the hostel rooms, cleanliness, food taste, Wi-Fi speed, etc..."
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Real-time image upload (Simulated / Local file + Presets) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Upload Real-Time Images (Optional)
                    </label>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Local File Selector */}
                      <label className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-indigo-400">
                        <Upload className="h-4 w-4 text-slate-400" />
                        <span className="text-[10px] text-slate-500 mt-1 font-medium">Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* Display Preset choices to easily demo the uploader */}
                      {REVIEW_IMAGE_PRESETS.map((preset, idx) => {
                        const selected = reviewImages.includes(preset.url);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addPresetImage(preset.url)}
                            className={`relative h-16 w-24 overflow-hidden rounded-xl border transition-all ${
                              selected ? 'ring-2 ring-indigo-600 border-transparent scale-95' : 'border-slate-200'
                            }`}
                            title={`Add preset: ${preset.name}`}
                          >
                            <img src={preset.url} alt={preset.name} className="h-full w-full object-cover" />
                            {selected && (
                              <div className="absolute inset-0 bg-indigo-600/35 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-white fill-indigo-600" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Render Uploaded image thumbnails preview */}
                    {reviewImages.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 block">Selected Images for Upload:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {reviewImages.map((url, idx) => (
                            <div key={idx} className="relative h-12 w-12 rounded-lg overflow-hidden border border-slate-200">
                              <img src={url} alt="Preview" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                                className="absolute -top-1 -right-1 rounded-full bg-slate-900/60 p-0.5 text-white hover:bg-rose-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit review button */}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
                  >
                    Submit Verified Review
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Bed Map (Movie Ticket Style) & Tenant Joining Form */}
          <div className="space-y-6">
            
            {/* Interactive Bed Selector Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Bed Selection Board</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a room from the vacancy list, then click an empty bed below to pick your spot.
                </p>
              </div>

              {activeFloorNo === null || activeRoomNo === null || !currentRoom ? (
                <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 text-center border border-dashed border-slate-200">
                  <BedIcon className="h-10 w-10 text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-600">No Room Selected</span>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[180px]">
                    Click any room on Floor 1, Floor 2, or Floor 5 in the vacancy list to view available beds.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Room Header */}
                  <div className="rounded-xl bg-indigo-50/50 p-3 border border-indigo-100 text-center">
                    <span className="block text-xs font-bold text-indigo-800">
                      Floor {activeFloorNo} → Room {activeRoomNo}
                    </span>
                    
                    {/* Dynamic availability message required by the prompt */}
                    <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                      “Room {activeRoomNo} – Total Beds: {currentRoom.totalBeds} – Filled Beds: {currentRoom.occupiedBeds} – Empty Beds: {currentRoom.emptyBeds} – {currentRoom.emptyBeds > 0 ? 'Available for Booking' : 'Fully Occupied'}”
                    </p>
                  </div>

                  {/* Movie ticket layout instructions */}
                  <div className="flex items-center justify-around text-[11px] font-semibold text-slate-500 py-1 border-y border-slate-100">
                    <div className="flex items-center">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-500 mr-1.5 inline-block"></span>
                      <span>Empty / Available</span>
                    </div>
                    <div className="flex items-center">
                      <span className="h-3.5 w-3.5 rounded bg-slate-300 mr-1.5 inline-block"></span>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center">
                      <span className="h-3.5 w-3.5 rounded bg-indigo-600 mr-1.5 inline-block"></span>
                      <span>Selected</span>
                    </div>
                  </div>

                  {/* Bed Grid (Movie-ticket styled layout) */}
                  <div className="bg-slate-900 p-6 rounded-2xl relative shadow-inner overflow-hidden">
                    {/* Screen / Room Entry Wall simulation */}
                    <div className="mx-auto w-2/3 h-1 bg-slate-700 rounded-full shadow-sm shadow-white mb-8 text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                      ROOM ENTRY / DOORWAY
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {currentRoom.beds.map((bed) => {
                        const isOccupied = bed.status === 'occupied';
                        const isSelected = selectedBedId === bed.id;
                        
                        return (
                          <div key={bed.id} className="flex flex-col">
                            <button
                              type="button"
                              onClick={() => handleBedClick(bed)}
                              className={`w-full flex flex-col items-center justify-center rounded-xl p-3 transition-all relative ${
                                isOccupied
                                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-indigo-600 text-white border border-indigo-500 scale-95 shadow-md shadow-indigo-500/30 ring-2 ring-white/20'
                                    : 'bg-emerald-600 text-white border border-emerald-500 hover:scale-102 hover:bg-emerald-500 shadow-sm shadow-emerald-700/25'
                              }`}
                            >
                              <BedIcon className="h-6.5 w-6.5" />
                              <span className="text-xs font-bold mt-1">{bed.name}</span>
                              
                              {/* Status label */}
                              <span className="text-[9px] font-medium opacity-90 block">
                                {isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
                              </span>
                            </button>

                            {/* Tenant Info Roster under the Bed (Only if Occupied/Joined) */}
                            {isOccupied && (bed.tenantName || bed.joiningDate) && (
                              <div className="mt-1 text-[9px] bg-slate-800/80 border border-slate-700 rounded-lg p-1.5 text-center text-slate-300">
                                <span className="font-bold block truncate text-white">{bed.tenantName || 'Resident'}</span>
                                <span className="block text-[8px] text-slate-400">Join Date: {bed.joiningDate || '2026-03-01'}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tenant Joining Form Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tenant Joining Form</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm your personal details below to submit a bed reservation request.
                </p>
              </div>

              {bookingSuccess && (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-center space-y-2">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-800 text-sm">Request Submitted!</h4>
                  <p className="text-xs text-emerald-700">
                    Your booking request has been sent to the hostel owner ({currentHostel.ownerUsername}). You can check status in "My Bookings" tab.
                  </p>
                </div>
              )}

              {!bookingSuccess && (
                <form onSubmit={handleConfirmBooking} className="space-y-3">
                  {bookingError && (
                    <div className="rounded-lg bg-rose-50 p-2.5 text-xs font-semibold text-rose-600 border border-rose-100">
                      {bookingError}
                    </div>
                  )}

                  {/* Chosen bed summary */}
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 block mb-1 uppercase tracking-wider text-[9px]">Your Selection Details:</span>
                    {selectedBedId && currentRoom ? (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{currentHostel.name}</p>
                        <p className="text-indigo-600 font-semibold">
                          Floor {activeFloorNo} • Room {activeRoomNo} • Bed {currentRoom.beds.find(b => b.id === selectedBedId)?.name}
                        </p>
                        <p className="text-slate-600">
                          Rent Amount: <strong className="text-indigo-600 text-sm">₹{currentHostel.sharingFees[currentRoom.sharingType]}</strong> / month
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Please select an available bed from the grid above first.</span>
                    )}
                  </div>

                  {/* Input details */}
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tenant Full Name</label>
                      <input
                        type="text"
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Enter your full name"
                        disabled={!currentUser}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={bookingMobile}
                        onChange={(e) => setBookingMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit primary number"
                        disabled={!currentUser}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Emergency Contact Number</label>
                      <input
                        type="tel"
                        value={bookingEmergency}
                        onChange={(e) => setBookingEmergency(e.target.value.replace(/\D/g, ''))}
                        placeholder="Parent / Guardian mobile number"
                        disabled={!currentUser}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Date of Joining</label>
                      <input
                        type="date"
                        value={dateOfJoining}
                        onChange={(e) => setDateOfJoining(e.target.value)}
                        disabled={!currentUser}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none bg-white disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  {currentUser ? (
                    <button
                      type="submit"
                      disabled={!selectedBedId}
                      className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition-all ${
                        selectedBedId
                          ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                          : 'bg-slate-300 cursor-not-allowed'
                      }`}
                    >
                      Confirm Bed Reservation & Send Request
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onLoginClick}
                      className="w-full rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition-all"
                    >
                      Log In to Reserve Bed
                    </button>
                  )}
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  };

  // Switch tabs
  switch (selectedHostelId ? 'details' : 'list') {
    case 'details':
      return renderHostelDetails();
    case 'list':
    default:
      return renderExploreList();
  }
};
