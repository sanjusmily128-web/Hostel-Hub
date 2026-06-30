import React from 'react';
import { ClipboardList, Calendar, Users, Info } from 'lucide-react';
import { Booking, User, Hostel } from '../types';

interface BookingHistoryProps {
  bookings: Booking[];
  currentUser: User | null;
  hostels: Hostel[];
  users: Array<{ user: User; passwordHash: string }>;
  onExploreClick: () => void;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  currentUser,
  hostels,
  users,
  onExploreClick
}) => {
  if (!currentUser) return null;

  // Filter bookings for the logged in customer
  const customerBookings = bookings.filter(
    b => b.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Booking History</h2>
          <p className="text-sm text-slate-500">Track and manage your hostel bed reservations</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
          Total Bookings: {customerBookings.length}
        </span>
      </div>

      {customerBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center border border-slate-200 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Reservations Yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
            You haven't booked a hostel bed yet. Explore available premium hostels and reserve a bed instantly!
          </p>
          <button
            onClick={onExploreClick}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
          >
            Explore & Book Hostels
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customerBookings.map((booking) => {
            // Find the hostel and its owner contact details
            const hostelObj = hostels.find(h => h.id === booking.hostelId);
            const ownerName = hostelObj ? hostelObj.ownerUsername : 'Hostel Manager';
            
            // Search for owner's mobile in users
            const ownerUserObj = users.find(u => u.user.username.toLowerCase() === ownerName.toLowerCase());
            const ownerMobile = ownerUserObj ? ownerUserObj.user.mobile : '9876543210';
            
            return (
            <div 
              key={booking.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow"
            >
              {/* Top Banner indicating status */}
              <div className={`px-4 py-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
                booking.status === 'approved' 
                  ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100' 
                  : booking.status === 'rejected'
                    ? 'bg-rose-50 text-rose-800 border-b border-rose-100'
                    : 'bg-amber-50 text-amber-800 border-b border-amber-100'
              }`}>
                <span>Booking ID: {booking.id}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold ${
                  booking.status === 'approved' 
                    ? 'bg-emerald-500 text-white' 
                    : booking.status === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-500 text-white'
                }`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>

              {/* Booking details body */}
              <div className="p-5 grid gap-4 sm:grid-cols-3">
                
                {/* Hostel details */}
                <div className="space-y-2 sm:col-span-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{booking.hostelName}</h3>
                  <div className="space-y-1 text-xs font-medium text-slate-600">
                    <p className="flex items-center text-indigo-600 font-bold">
                      <span className="inline-block bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md mr-1.5">
                        Floor {booking.floorNo} → Room {booking.roomNo}
                      </span>
                      <span>{booking.bedName}</span>
                    </p>
                    <p className="flex items-center text-slate-500">
                      <Users className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      Room Category: {booking.sharingType} Sharing
                    </p>
                    <p className="flex items-center text-slate-500">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                      Date of Joining: {booking.dateOfJoining}
                    </p>
                  </div>

                  {/* Owner Contact Details Block */}
                  <div className="mt-3 rounded-xl bg-indigo-50/50 p-3 border border-indigo-100 text-xs space-y-1 max-w-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                      📍 Hostel Owner Details:
                    </span>
                    <p className="text-slate-700">
                      Owner Name: <strong className="text-slate-900 font-bold">{ownerName}</strong>
                    </p>
                    <p className="text-slate-700">
                      Owner Mobile: <strong className="text-slate-900 font-bold">{ownerMobile}</strong>
                    </p>
                  </div>
                </div>

                {/* Pricing & Joining Stats */}
                <div className="flex flex-col justify-between items-start sm:items-end bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Monthly Rent Fee</span>
                    <span className="text-xl font-extrabold text-slate-900">₹{booking.fee}</span>
                  </div>
                  
                  <div className="mt-3 text-left sm:text-right text-[11px] text-slate-500">
                    <span className="font-semibold block text-slate-400">Emergency Contact:</span>
                    <span className="font-bold text-slate-700">{booking.emergencyContact}</span>
                  </div>
                </div>

              </div>

              {/* Status explanation footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center space-x-2 text-xs text-slate-500">
                <Info className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>
                  {booking.status === 'approved' && "Your booking is approved! You can move in on your selected date of joining. Please carry your ID proof."}
                  {booking.status === 'rejected' && "Your request was rejected by the owner. Please browse other hostels or check another room."}
                  {booking.status === 'pending' && "Your request is awaiting owner approval. The owner will review your tenant profile shortly."}
                </span>
              </div>

            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
