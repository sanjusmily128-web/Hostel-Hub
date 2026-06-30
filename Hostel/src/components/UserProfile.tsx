import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertCircle, Smartphone, Mail } from 'lucide-react';
import { validateMobile, validateEmail } from '../utils/validation';
import { User } from '../types';

interface UserProfileProps {
  currentUser: User | null;
  onUpdateProfile: (username: string, updatedData: Partial<User>) => boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onUpdateProfile
}) => {
  if (!currentUser) return null;

  const [email, setEmail] = useState(currentUser.email);
  const [mobile, setMobile] = useState(currentUser.mobile);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate changes
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Email address accepts only @gmail.com accounts.');
      return;
    }
    if (!mobile) {
      setError('Mobile number is required.');
      return;
    }
    if (!validateMobile(mobile)) {
      setError('Mobile number must be exactly 10 digits and start only with 6, 7, 8, or 9.');
      return;
    }

    const successUpdate = onUpdateProfile(currentUser.username, { email, mobile });
    if (successUpdate) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('Failed to update profile.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Your User Profile</h2>
        <p className="text-sm text-slate-500">Manage your credentials, roles, and review authentication telemetry</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & Telemetry */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="text-center space-y-3">
            {/* Avatar block */}
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white shadow-md ${
              currentUser.role === 'supplier' 
                ? 'bg-purple-600 shadow-purple-100' 
                : 'bg-indigo-600 shadow-indigo-100'
            }`}>
              <span className="text-3xl font-black uppercase">
                {currentUser.username.slice(0, 2)}
              </span>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-slate-800">{currentUser.username}</h3>
              <span className={`mt-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${
                currentUser.role === 'supplier' 
                  ? 'bg-purple-50 text-purple-700 ring-purple-700/10' 
                  : 'bg-indigo-50 text-indigo-700 ring-indigo-700/10'
              }`}>
                {currentUser.role === 'supplier' ? 'Hostel Owner (Supplier)' : 'Resident (Customer)'}
              </span>
            </div>
          </div>

          {/* Telemetry Block */}
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Login Activity Stats</span>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">Authentication Count:</span>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                ⚡ {currentUser.loginCount} Logins
              </span>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-relaxed">
              We track your login counts in local storage. You do not need to repeatedly log in after successful authentication.
            </p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manage Profile Information</h3>
            <p className="text-xs text-slate-500">Update your email or mobile. Form fields are validated in real-time.</p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-600 border border-rose-100">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Username (Locked) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Username (Alphabetic Only)
                </label>
                <div className="relative rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 cursor-not-allowed">
                  {currentUser.username}
                  <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold uppercase">Locked</span>
                </div>
              </div>

              {/* Role (Locked) */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Role
                </label>
                <div className="relative rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-500 border border-slate-200 cursor-not-allowed uppercase">
                  {currentUser.role}
                  <span className="absolute right-3 top-2.5 text-[9px] text-slate-400 font-bold uppercase">Locked</span>
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Gmail Address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Accepts only valid @gmail.com accounts</span>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Smartphone className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile number"
                  className="block w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-xs focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Must be exactly 10 digits and start only with 6, 7, 8, or 9</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-98 transition-all"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Validation Rules Reference Banner */}
          <div className="rounded-2xl bg-indigo-50/40 p-4 border border-indigo-100 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center">
              <ShieldAlert className="h-4 w-4 mr-1.5 text-indigo-600" />
              HostelHub System Validation Rules Reference:
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
              <li><strong>Username:</strong> Only alphabetic characters allowed (e.g. Ramesh, Amit).</li>
              <li><strong>Mobile Number:</strong> Exactly 10 digits starting only with 6, 7, 8, or 9 (e.g. 9876543210).</li>
              <li><strong>Email:</strong> Only accounts ending in <strong>@gmail.com</strong> are acceptable.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
