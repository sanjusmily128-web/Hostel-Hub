export interface Bed {
  id: string;
  name: string;
  status: 'empty' | 'occupied' | 'selected';
  bookedBy?: string; // email of customer
  tenantName?: string;
  tenantMobile?: string;
  joiningDate?: string;
}

export interface Room {
  roomNo: string;
  sharingType: number; // e.g. 1, 2, 3, 4, 5, 6 sharing
  totalBeds: number;
  occupiedBeds: number;
  emptyBeds: number;
  beds: Bed[];
}

export interface Floor {
  floorNo: number;
  rooms: Room[];
}

export interface Hostel {
  id: string;
  name: string;
  address: string;
  area: string; // surrounding area for search
  gstNumber?: string;
  aadhaarNumber?: string;
  panCardNumber?: string;
  vaccinationStatus: '100% Vaccinated Staff' | 'Fully Sanitized' | 'Standard Precautions';
  foodRating: number;
  cleaningRating: number;
  images: string[];
  sharingFees: { [key: number]: number }; // sharing type (1..6) -> fee in ₹
  floors: Floor[];
  ownerUsername: string;
}

export interface Booking {
  id: string;
  hostelId: string;
  hostelName: string;
  floorNo: number;
  roomNo: string;
  bedId: string;
  bedName: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
  sharingType: number;
  fee: number;
  dateOfJoining: string;
  emergencyContact: string;
  status: 'pending' | 'approved' | 'rejected';
  bookingDate: string;
}

export interface Review {
  id: string;
  hostelId: string;
  customerName: string;
  rating: number;
  feedback: string;
  images: string[]; // URLs or base64 of uploaded real-time images
  category: 'food' | 'rooms' | 'facilities' | 'general';
  date: string;
  isVerified: boolean;
}

export interface User {
  username: string; // letters only
  email: string; // @gmail.com only
  mobile: string; // 10 digits starting with 6,7,8,9
  role: 'customer' | 'supplier';
  loginCount: number;
}
