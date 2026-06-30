import { useState, useEffect } from 'react';
import { Hostel, Review, Booking, User, Bed, Room, Floor } from '../types';
import { INITIAL_HOSTELS, INITIAL_REVIEWS, INITIAL_BOOKINGS } from '../data/mockData';

// User with password for auth simulation
interface UserRecord {
  user: User;
  passwordHash: string;
}

export const useHostelState = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);

  // Load initial data from localStorage or mock data
  useEffect(() => {
    const storedHostels = localStorage.getItem('hostel_system_hostels');
    const storedReviews = localStorage.getItem('hostel_system_reviews');
    const storedBookings = localStorage.getItem('hostel_system_bookings');
    const storedUsers = localStorage.getItem('hostel_system_users');
    const storedCurrentUser = localStorage.getItem('hostel_system_current_user');

    if (storedHostels) {
      setHostels(JSON.parse(storedHostels));
    } else {
      setHostels(INITIAL_HOSTELS);
      localStorage.setItem('hostel_system_hostels', JSON.stringify(INITIAL_HOSTELS));
    }

    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('hostel_system_reviews', JSON.stringify(INITIAL_REVIEWS));
    }

    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    } else {
      setBookings(INITIAL_BOOKINGS);
      localStorage.setItem('hostel_system_bookings', JSON.stringify(INITIAL_BOOKINGS));
    }

    // Default users
    const defaultUsers: UserRecord[] = [
      {
        user: { username: 'RameshHostels', email: 'ramesh@gmail.com', mobile: '9876543210', role: 'supplier', loginCount: 1 },
        passwordHash: 'password123'
      },
      {
        user: { username: 'AmitPatel', email: 'amit@gmail.com', mobile: '8888888888', role: 'customer', loginCount: 1 },
        passwordHash: 'password123'
      }
    ];

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(defaultUsers);
      localStorage.setItem('hostel_system_users', JSON.stringify(defaultUsers));
    }

    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  // Helper to save to localStorage
  const saveHostels = (newHostels: Hostel[]) => {
    setHostels(newHostels);
    localStorage.setItem('hostel_system_hostels', JSON.stringify(newHostels));
  };

  const saveReviews = (newReviews: Review[]) => {
    setReviews(newReviews);
    localStorage.setItem('hostel_system_reviews', JSON.stringify(newReviews));
  };

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('hostel_system_bookings', JSON.stringify(newBookings));
  };

  const saveUsers = (newUsers: UserRecord[]) => {
    setUsers(newUsers);
    localStorage.setItem('hostel_system_users', JSON.stringify(newUsers));
  };

  const saveCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('hostel_system_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hostel_system_current_user');
    }
  };

  // Sign up a new user
  const registerUser = (user: Omit<User, 'loginCount'>, passwordHash: string): { success: boolean; message: string } => {
    // Check if user already exists
    const exists = users.find(u => u.user.username.toLowerCase() === user.username.toLowerCase() || u.user.email.toLowerCase() === user.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username or Email already registered.' };
    }

    const newUserRecord: UserRecord = {
      user: { ...user, loginCount: 1 }, // Starts at 1 on registration/first login
      passwordHash
    };

    const updatedUsers = [...users, newUserRecord];
    saveUsers(updatedUsers);

    // Auto log in after registration
    saveCurrentUser(newUserRecord.user);
    
    // Set login track in localStorage specifically for this username
    localStorage.setItem(`login_count_${user.username}`, '1');

    return { success: true, message: 'Registration successful!' };
  };

  // Log in user
  const loginUser = (usernameOrEmail: string, passwordHash: string): { success: boolean; message: string } => {
    const recordIndex = users.findIndex(u => 
      u.user.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
      u.user.email.toLowerCase() === usernameOrEmail.toLowerCase()
    );

    if (recordIndex === -1) {
      return { success: false, message: 'User not found.' };
    }

    const record = users[recordIndex];
    if (record.passwordHash !== passwordHash) {
      return { success: false, message: 'Incorrect password.' };
    }

    // Increment login count
    const updatedCount = record.user.loginCount + 1;
    const updatedUser = { ...record.user, loginCount: updatedCount };
    
    const updatedUsers = [...users];
    updatedUsers[recordIndex] = { ...record, user: updatedUser };
    
    saveUsers(updatedUsers);
    saveCurrentUser(updatedUser);
    localStorage.setItem(`login_count_${updatedUser.username}`, updatedCount.toString());

    return { success: true, message: 'Logged in successfully!' };
  };

  // Log out user
  const logoutUser = () => {
    saveCurrentUser(null);
  };

  // Edit profile details (e.g. updating mobile/email)
  const updateProfile = (username: string, updatedData: Partial<User>): boolean => {
    const recordIndex = users.findIndex(u => u.user.username === username);
    if (recordIndex === -1) return false;

    const record = users[recordIndex];
    const updatedUser = { ...record.user, ...updatedData };
    
    const updatedUsers = [...users];
    updatedUsers[recordIndex] = { ...record, user: updatedUser };
    
    saveUsers(updatedUsers);
    
    if (currentUser?.username === username) {
      saveCurrentUser(updatedUser);
    }
    return true;
  };

  // Book a bed (Customer)
  const createBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'bookingDate'>): Booking => {
    const newBooking: Booking = {
      ...bookingData,
      id: `b-${Date.now()}`,
      status: 'pending',
      bookingDate: new Date().toISOString().split('T')[0]
    };

    const newBookings = [newBooking, ...bookings];
    saveBookings(newBookings);

    // Note: We don't mark bed as permanently occupied yet; it stays "selected" or "empty" until the owner approves.
    // However, to prevent others from booking the exact same bed in the same session, we can visually label it.
    // Let's update the bed status to 'empty' (with a pending flag) or keep it empty but show that a booking request is made.
    // Let's set the bed status in the hostel to 'empty' but store the pending status so the owner can approve it.
    return newBooking;
  };

  // Approve or Reject Booking (Supplier)
  const handleBookingDecision = (bookingId: string, decision: 'approved' | 'rejected') => {
    const updatedBookings = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: decision };
      }
      return b;
    });
    saveBookings(updatedBookings);

    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // If approved, we must mark the bed in the hostel as 'occupied' and store customer details + joining date
    // If rejected, we make sure it is 'empty'
    const updatedHostels = hostels.map(hostel => {
      if (hostel.id === booking.hostelId) {
        const updatedFloors = hostel.floors.map(floor => {
          if (floor.floorNo === booking.floorNo) {
            const updatedRooms = floor.rooms.map(room => {
              if (room.roomNo === booking.roomNo) {
                const updatedBeds: Bed[] = room.beds.map(bed => {
                  if (bed.id === booking.bedId) {
                    return { 
                      ...bed, 
                      status: (decision === 'approved' ? 'occupied' : 'empty') as 'occupied' | 'empty',
                      bookedBy: decision === 'approved' ? booking.customerEmail : undefined,
                      tenantName: decision === 'approved' ? booking.customerName : undefined,
                      tenantMobile: decision === 'approved' ? booking.customerMobile : undefined,
                      joiningDate: decision === 'approved' ? booking.dateOfJoining : undefined
                    };
                  }
                  return bed;
                });

                const occupied = updatedBeds.filter(b => b.status === 'occupied').length;
                const empty = updatedBeds.length - occupied;

                return {
                  ...room,
                  beds: updatedBeds,
                  occupiedBeds: occupied,
                  emptyBeds: empty
                };
              }
              return room;
            });
            return { ...floor, rooms: updatedRooms };
          }
          return floor;
        });
        return { ...hostel, floors: updatedFloors };
      }
      return hostel;
    });

    saveHostels(updatedHostels);
  };

  // Add a new review with image upload (Customer)
  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'isVerified'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `r-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      isVerified: true // automatically verified since they are a customer in system
    };

    const newReviews = [newReview, ...reviews];
    saveReviews(newReviews);

    // Optionally update hostel ratings (calculate average food and cleaning ratings)
    // Let's recalculate the rating for the hostel based on reviews.
    const hostelReviews = newReviews.filter(r => r.hostelId === reviewData.hostelId);
    
    // Average food ratings (from food category reviews)
    const foodReviews = hostelReviews.filter(r => r.category === 'food' || r.category === 'general');
    const avgFood = foodReviews.length > 0
      ? parseFloat((foodReviews.reduce((sum, r) => sum + r.rating, 0) / foodReviews.length).toFixed(1))
      : 4.0;

    // Average room/cleaning ratings
    const roomReviews = hostelReviews.filter(r => r.category === 'rooms' || r.category === 'facilities' || r.category === 'general');
    const avgCleaning = roomReviews.length > 0
      ? parseFloat((roomReviews.reduce((sum, r) => sum + r.rating, 0) / roomReviews.length).toFixed(1))
      : 4.0;

    const updatedHostels = hostels.map(h => {
      if (h.id === reviewData.hostelId) {
        return {
          ...h,
          foodRating: avgFood,
          cleaningRating: avgCleaning
        };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Supplier: Register new hostel
  const registerHostel = (hostelData: Omit<Hostel, 'id' | 'floors' | 'ownerUsername'>, ownerUsername: string, initialFloors: Floor[]) => {
    const newHostel: Hostel = {
      ...hostelData,
      id: `h-${Date.now()}`,
      floors: initialFloors,
      ownerUsername
    };

    const newHostels = [...hostels, newHostel];
    saveHostels(newHostels);

    // Link owner to their hostel if we store that mapping
    return newHostel;
  };

  // Supplier: Update existing hostel info (GST, Aadhaar, PAN, Vaccination, ratings, sharing fees, etc.)
  const updateHostelInfo = (hostelId: string, updatedFields: Partial<Omit<Hostel, 'id' | 'floors' | 'ownerUsername'>>) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === hostelId) {
        return { ...h, ...updatedFields };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Supplier: Update hostel images directly
  const updateHostelImages = (hostelId: string, images: string[]) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === hostelId) {
        return { ...h, images };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Supplier: Add a floor
  const addFloor = (hostelId: string, floorNo: number) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === hostelId) {
        // Check if floor already exists
        if (h.floors.some(f => f.floorNo === floorNo)) {
          return h; // No duplicates
        }
        const newFloor: Floor = {
          floorNo,
          rooms: []
        };
        const updatedFloors = [...h.floors, newFloor].sort((a, b) => a.floorNo - b.floorNo);
        return { ...h, floors: updatedFloors };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Supplier: Add a room to a specific floor
  const addRoom = (hostelId: string, floorNo: number, roomNo: string, sharingType: number, totalBeds: number) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === hostelId) {
        const updatedFloors = h.floors.map(f => {
          if (f.floorNo === floorNo) {
            // Check if room already exists
            if (f.rooms.some(r => r.roomNo === roomNo)) {
              return f;
            }
            // Generate empty beds
            const beds = [];
            for (let i = 1; i <= totalBeds; i++) {
              beds.push({
                id: `${roomNo}-bed-${i}`,
                name: `Bed ${i}`,
                status: 'empty' as const
              });
            }

            const newRoom: Room = {
              roomNo,
              sharingType,
              totalBeds,
              occupiedBeds: 0,
              emptyBeds: totalBeds,
              beds
            };

            return {
              ...f,
              rooms: [...f.rooms, newRoom].sort((a, b) => a.roomNo.localeCompare(b.roomNo))
            };
          }
          return f;
        });
        return { ...h, floors: updatedFloors };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Supplier: Toggle status of a single bed instantly in a room
  const toggleBedStatus = (hostelId: string, floorNo: number, roomNo: string, bedId: string) => {
    const updatedHostels = hostels.map(h => {
      if (h.id === hostelId) {
        const updatedFloors = h.floors.map(f => {
          if (f.floorNo === floorNo) {
            const updatedRooms = f.rooms.map(r => {
              if (r.roomNo === roomNo) {
                const updatedBeds: Bed[] = r.beds.map(b => {
                  if (b.id === bedId) {
                    const newStatus: 'empty' | 'occupied' = b.status === 'occupied' ? 'empty' : 'occupied';
                    return {
                      ...b,
                      status: newStatus,
                      bookedBy: newStatus === 'occupied' ? 'supplier-manual@gmail.com' : undefined,
                      tenantName: newStatus === 'occupied' ? 'Ramesh (Owner Allocation)' : undefined,
                      tenantMobile: newStatus === 'occupied' ? '9876543210' : undefined,
                      joiningDate: newStatus === 'occupied' ? new Date().toISOString().split('T')[0] : undefined
                    };
                  }
                  return b;
                });

                const occupied = updatedBeds.filter(b => b.status === 'occupied').length;
                const empty = updatedBeds.length - occupied;

                return {
                  ...r,
                  beds: updatedBeds,
                  occupiedBeds: occupied,
                  emptyBeds: empty
                };
              }
              return r;
            });
            return { ...f, rooms: updatedRooms };
          }
          return f;
        });
        return { ...h, floors: updatedFloors };
      }
      return h;
    });
    saveHostels(updatedHostels);
  };

  // Helper to get total & occupied beds across the entire system or a hostel
  const getHostelVacancyStats = (hostel: Hostel) => {
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

  return {
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
  };
};
