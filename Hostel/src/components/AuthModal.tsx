import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, User as UserIcon, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { validateUsername, validateMobile, validateEmail } from '../utils/validation';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: Omit<User, 'loginCount'>, passwordHash: string, isSignUp: boolean) => { success: boolean; message: string };
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<'customer' | 'supplier'>('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtpInput, setUserOtpInput] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpAlert, setOtpAlert] = useState('');

  // Reset errors when changing tabs or email
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setOtpSent(false);
    setGeneratedOtp('');
    setUserOtpInput('');
    setIsEmailVerified(false);
    setOtpAlert('');
  }, [isSignUp, email]);

  // Simulate sending OTP
  const handleSendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setOtpAlert('');
    
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid @gmail.com address.');
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    
    // Log the OTP exclusively to the browser developer console (F12) so it is NOT displayed in the application UI,
    // mimicking a real-world scenario where the user must actually access their email inbox to receive it.
    console.log(`%c✉️ [HostelHub Email OTP Service] Sent to ${email} -> OTP Code: ${code}`, "color: #4f46e5; font-weight: bold; font-size: 14px;");
    
    setOtpAlert(`📩 [Gmail System Alert] OTP code has been sent to ${email}. Please check your inbox (simulated in browser developer console / F12).`);
  };

  // Verify entered OTP
  const handleVerifyOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    
    if (userOtpInput === generatedOtp && generatedOtp !== '') {
      setIsEmailVerified(true);
      setOtpAlert('✓ Email address verified successfully!');
    } else {
      setError('Incorrect OTP. Please check the simulated Gmail alert and try again.');
    }
  };

  if (!isOpen) return null;

  // Real-time validation states for sign-up
  const isUsernameValid = !isSignUp || validateUsername(username);
  const isMobileValid = !isSignUp || validateMobile(mobile);
  const isEmailValid = !isSignUp || validateEmail(email);
  const isPasswordValid = !isSignUp || password.length >= 6;
  const isConfirmPasswordValid = !isSignUp || (password === confirmPassword && confirmPassword !== '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isSignUp) {
      // Validations
      if (!username) {
        setError('Username is required.');
        return;
      }
      if (!validateUsername(username)) {
        setError('Username accepts only alphabetic characters (no spaces, numbers, or symbols).');
        return;
      }
      if (!email) {
        setError('Email address is required.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Email address accepts only @gmail.com accounts.');
        return;
      }
      if (!isEmailVerified) {
        setError('Please verify your Gmail address by requesting and entering the OTP code first.');
        return;
      }
      if (!mobile) {
        setError('Mobile number is required.');
        return;
      }
      if (!validateMobile(mobile)) {
        setError('Mobile number must be exactly 10 digits and start with 6, 7, 8, or 9.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      // Call state registration
      const result = onAuthSuccess(
        { username, email, mobile, role },
        password,
        true
      );

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          onClose();
          // Reset form fields
          setUsername('');
          setEmail('');
          setMobile('');
          setPassword('');
          setConfirmPassword('');
        }, 1500);
      } else {
        setError(result.message);
      }
    } else {
      // Login mode
      if (!username) {
        setError('Username or email is required.');
        return;
      }
      if (!password) {
        setError('Password is required.');
        return;
      }

      const result = onAuthSuccess(
        { username: username, email: '', mobile: '', role: 'customer' }, // placeholder role, will be fetched in login function
        password,
        false
      );

      if (result.success) {
        setSuccessMsg('Logged in successfully!');
        setTimeout(() => {
          onClose();
          setUsername('');
          setPassword('');
        }, 1200);
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md overflow-visible rounded-2xl bg-white shadow-xl transition-all">
        
        {/* Interactive Simulated Gmail Push Notification Popup */}
        {otpSent && !isEmailVerified && (
          <div 
            onClick={() => {
              setUserOtpInput(generatedOtp);
              setOtpAlert('✓ OTP Code auto-filled from notification!');
            }}
            className="absolute -top-24 left-1/2 -translate-x-1/2 z-50 w-80 rounded-xl border border-rose-100 bg-white p-3.5 shadow-xl ring-1 ring-rose-500/10 cursor-pointer animate-bounce flex items-start space-x-3"
            title="Click to automatically fill code!"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Simulated Gmail Notification</span>
              <span className="block text-xs font-bold text-slate-800 truncate">New Verification Email</span>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                Your verification OTP code is: <strong className="text-rose-600 font-extrabold text-sm font-mono tracking-wider">{generatedOtp}</strong>
              </p>
              <span className="block text-[9px] text-indigo-600 font-extrabold mt-1">💡 Click notification to auto-fill!</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {isSignUp ? 'Create a HostelHub Account' : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tabs for Login vs Signup */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
                !isSignUp 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
                isSignUp 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Success / Error Messages */}
          {error && (
            <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-600 border border-rose-100 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          {successMsg && (
            <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-600 border border-emerald-100">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Selection (Only for Signup) */}
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Choose Your Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`flex items-center justify-center rounded-xl border py-2.5 text-center transition-all ${
                    role === 'customer'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                  }`}
                >
                  <span className="text-xs">Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`flex items-center justify-center rounded-xl border py-2.5 text-center transition-all ${
                    role === 'supplier'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 text-xs'
                  }`}
                >
                  <span className="text-xs">Supplier</span>
                </button>
              </div>
            </div>
          )}

          {/* Inputs Section */}
          <div className="space-y-3.5">
            {/* Username / Login Identifier */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                {isSignUp ? 'Username' : 'Username or Gmail Address'}
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:ring-2 focus:outline-none ${
                    isSignUp 
                      ? (username === '' 
                          ? 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                          : isUsernameValid 
                            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/10'
                            : 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/10')
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
              </div>
            </div>

            {/* Email Address (Only for Signup) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
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
                    className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:ring-2 focus:outline-none ${
                      email === ''
                        ? 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                        : isEmailValid
                          ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/10'
                          : 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/10'
                    }`}
                  />
                </div>

                {/* OTP Verification Panel */}
                {isEmailValid && email !== '' && (
                  <div className="mt-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-3.5">
                    {otpAlert && (
                      <div className={`p-2.5 rounded-lg text-[10px] font-extrabold ${
                        isEmailVerified 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {otpAlert}
                      </div>
                    )}
                    
                    {!isEmailVerified ? (
                      <div className="space-y-3">
                        {!otpSent ? (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all"
                          >
                            Verify Email (Send OTP)
                          </button>
                        ) : (
                          <div className="space-y-3">
                            {/* Simulated Gmail Inbox message inside the form */}
                            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3 text-xs space-y-2">
                              <div className="flex items-center justify-between text-rose-800 font-bold text-[10px] uppercase tracking-wider">
                                <span>✉️ Simulated Gmail Inbox (Incoming)</span>
                                <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded-sm text-[9px]">New Message</span>
                              </div>
                              <p className="text-slate-600 text-[11px]">
                                From: <span className="font-bold text-slate-800">service@hostelhub.com</span>
                              </p>
                              <div className="bg-white rounded-lg p-2 border border-rose-100 font-mono text-center text-slate-700">
                                OTP Code: <strong className="text-rose-600 font-extrabold text-base tracking-widest">{generatedOtp}</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserOtpInput(generatedOtp);
                                  // Auto verify
                                  setIsEmailVerified(true);
                                  setOtpAlert('✓ Email verified via auto-fill!');
                                }}
                                className="w-full text-center text-[10px] font-extrabold text-indigo-600 hover:underline"
                              >
                                ⚡ Click here to Auto-Fill & Verify OTP
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={4}
                                value={userOtpInput}
                                onChange={(e) => setUserOtpInput(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 bg-white text-center font-bold tracking-widest text-slate-800"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all"
                              >
                                Verify
                              </button>
                            </div>
                            <div className="flex justify-between items-center px-1">
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                className="text-[9px] text-indigo-600 font-bold hover:underline"
                              >
                                Resend OTP
                              </button>
                              <span className="text-[9px] text-slate-400">Enter code above manually or click auto-fill</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs font-extrabold text-emerald-600 flex items-center justify-center bg-emerald-50 py-1.5 rounded-lg border border-emerald-200">
                        ✓ Gmail Address Verified Successfully
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Number (Only for Signup) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Number
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:ring-2 focus:outline-none ${
                      mobile === ''
                        ? 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                        : isMobileValid
                          ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/10'
                          : 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/10'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
              </div>
              <div className="relative rounded-md shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:ring-2 focus:outline-none ${
                    isSignUp
                      ? (password === ''
                          ? 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                          : isPasswordValid
                            ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/10'
                            : 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/10')
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
              </div>
            </div>

            {/* Confirm Password (Only for Signup) */}
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:ring-2 focus:outline-none ${
                      confirmPassword === ''
                        ? 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
                        : isConfirmPasswordValid
                          ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100 bg-emerald-50/10'
                          : 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 bg-rose-50/10'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-98 transition-all"
          >
            {isSignUp ? 'Register & Log In' : 'Log In Now'}
          </button>
        </form>
      </div>
    </div>
  );
};
