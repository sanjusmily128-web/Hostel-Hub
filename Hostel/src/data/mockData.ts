import { Hostel, Review, Booking } from '../types';

// Helper to generate beds for a room
export const generateBeds = (roomNo: string, totalBeds: number, occupiedCount: number): any[] => {
  const beds = [];
  for (let i = 1; i <= totalBeds; i++) {
    // Determine status (first 'occupiedCount' beds are occupied, rest empty)
    const isOccupied = i <= occupiedCount;
    beds.push({
      id: `${roomNo}-bed-${i}`,
      name: `Bed ${i}`,
      status: isOccupied ? 'occupied' : 'empty',
      bookedBy: isOccupied ? 'test-resident@gmail.com' : undefined,
    });
  }
  return beds;
};

export const INITIAL_HOSTELS: Hostel[] = [
  {
    id: 'h1',
    name: 'Starlight Premium Residency',
    address: 'Plot 42, Near Metro Station, Madhapur',
    area: 'Madhapur, Hyderabad',
    gstNumber: '36AAAAA1111A1Z1',
    aadhaarNumber: '999988887777',
    panCardNumber: 'ABCDE1234F',
    vaccinationStatus: '100% Vaccinated Staff',
    foodRating: 4.8,
    cleaningRating: 4.6,
    images: [
      'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ],
    sharingFees: {
      1: 12000,
      2: 9000,
      3: 7000,
      4: 6000,
      5: 5000,
      6: 3000
    },
    floors: [
      {
        floorNo: 1,
        rooms: [
          {
            roomNo: '101',
            sharingType: 3,
            totalBeds: 3,
            occupiedBeds: 2,
            emptyBeds: 1,
            beds: generateBeds('101', 3, 2)
          },
          {
            roomNo: '102',
            sharingType: 2,
            totalBeds: 2,
            occupiedBeds: 1,
            emptyBeds: 1,
            beds: generateBeds('102', 2, 1)
          }
        ]
      },
      {
        floorNo: 2,
        rooms: [
          {
            roomNo: '201',
            sharingType: 6,
            totalBeds: 6,
            occupiedBeds: 4,
            emptyBeds: 2,
            beds: generateBeds('201', 6, 4)
          },
          {
            roomNo: '202',
            sharingType: 4,
            totalBeds: 4,
            occupiedBeds: 2,
            emptyBeds: 2,
            beds: generateBeds('202', 4, 2)
          }
        ]
      },
      {
        floorNo: 5,
        rooms: [
          {
            roomNo: '503',
            sharingType: 4,
            totalBeds: 4,
            occupiedBeds: 3,
            emptyBeds: 1,
            beds: generateBeds('503', 4, 3)
          }
        ]
      }
    ],
    ownerUsername: 'RameshHostels'
  },
  {
    id: 'h2',
    name: 'Serene Co-Living Hub',
    address: '12th Cross, ITPL Main Road, Whitefield',
    area: 'Whitefield, Bangalore',
    gstNumber: '29BBBBB2222B2Z2',
    aadhaarNumber: '111122223333',
    panCardNumber: 'WXYZP5678Q',
    vaccinationStatus: 'Fully Sanitized',
    foodRating: 4.2,
    cleaningRating: 4.5,
    images: [
      'https://images.pexels.com/photos/4907430/pexels-photo-4907430.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      'https://images.pexels.com/photos/7968273/pexels-photo-7968273.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ],
    sharingFees: {
      2: 9500,
      3: 7500,
      5: 5000
    },
    floors: [
      {
        floorNo: 1,
        rooms: [
          {
            roomNo: '104',
            sharingType: 5,
            totalBeds: 5,
            occupiedBeds: 4,
            emptyBeds: 1,
            beds: generateBeds('104', 5, 4)
          }
        ]
      },
      {
        floorNo: 3,
        rooms: [
          {
            roomNo: '302',
            sharingType: 3,
            totalBeds: 3,
            occupiedBeds: 1,
            emptyBeds: 2,
            beds: generateBeds('302', 3, 1)
          }
        ]
      }
    ],
    ownerUsername: 'SereneOwner'
  },
  {
    id: 'h3',
    name: 'Zolo Scholars Executive Hostel',
    address: 'Phase 2, Hinjewadi Rajiv Gandhi Infotech Park',
    area: 'Hinjewadi, Pune',
    gstNumber: '27CCCCC3333C3Z3',
    aadhaarNumber: '444455556666',
    panCardNumber: 'LMNOP9012R',
    vaccinationStatus: 'Standard Precautions',
    foodRating: 4.5,
    cleaningRating: 4.3,
    images: [
      'https://images.pexels.com/photos/7968273/pexels-photo-7968273.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ],
    sharingFees: {
      1: 13000,
      3: 8000,
      6: 3500
    },
    floors: [
      {
        floorNo: 2,
        rooms: [
          {
            roomNo: '205',
            sharingType: 6,
            totalBeds: 6,
            occupiedBeds: 5,
            emptyBeds: 1,
            beds: generateBeds('205', 6, 5)
          }
        ]
      },
      {
        floorNo: 4,
        rooms: [
          {
            roomNo: '401',
            sharingType: 1,
            totalBeds: 1,
            occupiedBeds: 0,
            emptyBeds: 1,
            beds: generateBeds('401', 1, 0)
          }
        ]
      }
    ],
    ownerUsername: 'ZoloOwner'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    hostelId: 'h1',
    customerName: 'Aarav Mehta',
    rating: 5,
    feedback: 'Amazing rooms! The cleaning is done daily, and the beds are super comfortable. The food here is outstanding; they serve hot home-cooked meals every single day.',
    images: [
      'https://images.pexels.com/photos/7518987/pexels-photo-7518987.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ],
    category: 'food',
    date: '2026-02-15',
    isVerified: true
  },
  {
    id: 'r2',
    hostelId: 'h1',
    customerName: 'Priya Sharma',
    rating: 4.5,
    feedback: 'The hostel is very well maintained. Wi-Fi speed is good, and the environment is perfect for working professionals and students alike. Highly recommend the 2 sharing option.',
    images: [
      'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ],
    category: 'rooms',
    date: '2026-02-20',
    isVerified: true
  },
  {
    id: 'r3',
    hostelId: 'h2',
    customerName: 'Rahul Verma',
    rating: 4,
    feedback: 'Affordable and clean. The 5 sharing room is well-spaced. Power backup is available, and security is top-notch with CCTV cameras everywhere.',
    images: [],
    category: 'facilities',
    date: '2026-02-18',
    isVerified: true
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b-sample-1',
    hostelId: 'h1',
    hostelName: 'Starlight Premium Residency',
    floorNo: 1,
    roomNo: '101',
    bedId: '101-bed-1',
    bedName: 'Bed 1',
    customerName: 'Amit Patel',
    customerEmail: 'amit.patel@gmail.com',
    customerMobile: '9876543210',
    sharingType: 3,
    fee: 7000,
    dateOfJoining: '2026-03-01',
    emergencyContact: '9898989898',
    status: 'approved',
    bookingDate: '2026-02-22'
  },
  {
    id: 'b-sample-2',
    hostelId: 'h1',
    hostelName: 'Starlight Premium Residency',
    floorNo: 1,
    roomNo: '101',
    bedId: '101-bed-2',
    bedName: 'Bed 2',
    customerName: 'Suresh Kumar',
    customerEmail: 'suresh.kumar@gmail.com',
    customerMobile: '9900990099',
    sharingType: 3,
    fee: 7000,
    dateOfJoining: '2026-03-05',
    emergencyContact: '9988998899',
    status: 'pending',
    bookingDate: '2026-02-24'
  }
];
