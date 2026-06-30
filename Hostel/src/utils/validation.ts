/**
 * Validation utilities for Hostel Booking and Management System
 */

// Username accepts only alphabetic characters (A-Z, a-z), no spaces or numbers
export const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[A-Za-z]+$/;
  return usernameRegex.test(username);
};

// Mobile number must contain exactly 10 digits and start only with 6, 7, 8, or 9
export const validateMobile = (mobile: string): boolean => {
  const mobileRegex = /^[6789]\d{9}$/;
  return mobileRegex.test(mobile);
};

// Email address accepts only @gmail.com accounts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(email);
};

// GST Number (15 characters alphanumeric, e.g. 22AAAAA1111A1Z1)
export const validateGST = (gst: string): boolean => {
  if (!gst) return true; // optional but if provided must be valid format
  const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
  return gstRegex.test(gst.toUpperCase());
};

// Aadhaar Number (12 digits)
export const validateAadhaar = (aadhaar: string): boolean => {
  if (!aadhaar) return true;
  const aadhaarRegex = /^\d{12}$/;
  return aadhaarRegex.test(aadhaar);
};

// PAN Card (5 letters, 4 digits, 1 letter)
export const validatePAN = (pan: string): boolean => {
  if (!pan) return true;
  const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};
