import React, { useState } from 'react';
import { 
  Building, Check, X, AlertCircle, CheckCircle, 
  MapPin, Bed as BedIcon, Upload, Trash2, HelpCircle
} from 'lucide-react';
import { Hostel, Booking, User, Floor } from '../types';
import { validateGST, validateAadhaar, validatePAN } from '../utils/validation';

interface SupplierModuleProps {
  currentUser: User | null;
  hostels: Hostel[];
  bookings: Booking[];
  onRegisterHostel: (hostelData: Omit<Hostel, 'id' | 'floors' | 'ownerUsername'>, ownerUsername: string, initialFloors: Floor[]) => Hostel;
  onUpdateHostelInfo: (hostelId: string, updatedFields: Partial<Omit<Hostel, 'id' | 'floors' | 'ownerUsername'>>) => void;
  onUpdateHostelImages: (hostelId: string, images: string[]) => void;
  onAddFloor: (hostelId: string, floorNo: number) => void;
  onAddRoom: (hostelId: string, floorNo: number, roomNo: string, sharingType: number, totalBeds: number) => void;
  onToggleBedStatus: (hostelId: string, floorNo: number, roomNo: string, bedId: string) => void;
  onBookingDecision: (bookingId: string, decision: 'approved' | 'rejected') => void;
  getHostelVacancyStats: (hostel: Hostel) => { total: number; occupied: number; empty: number };
}

export const SupplierModule: React.FC<SupplierModuleProps> = ({
  currentUser,
  hostels,
  bookings,
  onRegisterHostel,
  onUpdateHostelInfo,
  onUpdateHostelImages,
  onAddFloor,
  onAddRoom,
  onToggleBedStatus,
  onBookingDecision,
  getHostelVacancyStats
}) => {
  if (!currentUser) return null;

  // Find if this supplier already has a hostel
  const myHostel = hostels.find(
    h => h.ownerUsername.toLowerCase() === currentUser.username.toLowerCase()
  );

  // Active Supplier Sub-Tab
  const [supplierTab, setSupplierTab] = useState<'bookings' | 'rooms' | 'edit-hostel'>('bookings');

  // Register Hostel Form States
  const [registerName, setRegisterName] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  const [registerArea, setRegisterArea] = useState('');
  const [registerGst, setRegisterGst] = useState('');
  const [registerAadhaar, setRegisterAadhaar] = useState('');
  const [registerPan, setRegisterPan] = useState('');
  const [registerVaccination, setRegisterVaccination] = useState<'100% Vaccinated Staff' | 'Fully Sanitized' | 'Standard Precautions'>('100% Vaccinated Staff');
  const [registerFoodRating, setRegisterFoodRating] = useState<number>(4.5);
  const [registerCleaningRating, setRegisterCleaningRating] = useState<number>(4.5);

  // Dynamic Room structure initialization during registration
  const [registerRooms, setRegisterRooms] = useState<Array<{
    floorNo: number;
    roomNo: string;
    sharingType: number;
    totalBeds: number;
    occupiedBeds: number;
  }>>([
    { floorNo: 1, roomNo: '101', sharingType: 3, totalBeds: 3, occupiedBeds: 1 },
    { floorNo: 2, roomNo: '201', sharingType: 6, totalBeds: 6, occupiedBeds: 4 },
    { floorNo: 5, roomNo: '503', sharingType: 4, totalBeds: 4, occupiedBeds: 3 }
  ]);

  // Temporary inputs for adding a room during registration
  const [regRoomFloor, setRegRoomFloor] = useState<number>(1);
  const [regRoomNo, setRegRoomNo] = useState<string>('');
  const [regRoomSharing, setRegRoomSharing] = useState<number>(3);
  const [regRoomTotal, setRegRoomTotal] = useState<number>(3);
  const [regRoomOccupied, setRegRoomOccupied] = useState<number>(0);
  
  // Rents per sharing for registration
  const [sharingRents, setSharingRents] = useState<{ [key: number]: number }>({
    3: 7000,
    5: 5000,
    6: 3000
  });
  const [selectedSharingTypes, setSelectedSharingTypes] = useState<number[]>([3, 5, 6]);

  // General Error / Success States
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Add Floor State
  const [newFloorNo, setNewFloorNo] = useState<number | ''>('');

  // Add Room States
  const [addRoomFloorNo, setAddRoomFloorNo] = useState<number | ''>('');
  const [addRoomNo, setAddRoomNo] = useState('');
  const [addRoomSharingType, setAddRoomSharingType] = useState<number>(3);
  const [addRoomTotalBeds, setAddRoomTotalBeds] = useState<number>(3);

  // Edit Hostel Info States
  const [editName, setEditName] = useState(myHostel?.name || '');
  const [editAddress, setEditAddress] = useState(myHostel?.address || '');
  const [editArea, setEditArea] = useState(myHostel?.area || '');
  const [editGst, setEditGst] = useState(myHostel?.gstNumber || '');
  const [editAadhaar, setEditAadhaar] = useState(myHostel?.aadhaarNumber || '');
  const [editPan, setEditPan] = useState(myHostel?.panCardNumber || '');
  const [editVaccination, setEditVaccination] = useState(myHostel?.vaccinationStatus || '100% Vaccinated Staff');
  const [editSharingRents, setEditSharingRents] = useState(myHostel?.sharingFees || {});
  const [editFoodRating, setEditFoodRating] = useState(myHostel?.foodRating || 4.5);
  const [editCleaningRating, setEditCleaningRating] = useState(myHostel?.cleaningRating || 4.5);

  // Sync edit states when myHostel changes
  React.useEffect(() => {
    if (myHostel) {
      setEditName(myHostel.name);
      setEditAddress(myHostel.address);
      setEditArea(myHostel.area);
      setEditGst(myHostel.gstNumber || '');
      setEditAadhaar(myHostel.aadhaarNumber || '');
      setEditPan(myHostel.panCardNumber || '');
      setEditVaccination(myHostel.vaccinationStatus);
      setEditSharingRents(myHostel.sharingFees);
      setEditFoodRating(myHostel.foodRating);
      setEditCleaningRating(myHostel.cleaningRating);
    }
  }, [myHostel]);

  // Handle Hostel Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!registerName.trim() || !registerAddress.trim() || !registerArea.trim()) {
      setFormError('Hostel Name, Full Address, and Area are required.');
      return;
    }

    // Validations
    if (registerGst && !validateGST(registerGst)) {
      setFormError('Invalid GST Number format (e.g. 36AAAAA1111A1Z1).');
      return;
    }
    if (registerAadhaar && !validateAadhaar(registerAadhaar)) {
      setFormError('Invalid Aadhaar Card number. Must be exactly 12 digits.');
      return;
    }
    if (registerPan && !validatePAN(registerPan)) {
      setFormError('Invalid PAN Card number. Must be 10 characters alphanumeric (e.g. ABCDE1234F).');
      return;
    }

    if (selectedSharingTypes.length === 0) {
      setFormError('Please select at least one room sharing category and define its fee.');
      return;
    }

    // Prepare sharing fees object
    const finalFees: { [key: number]: number } = {};
    selectedSharingTypes.forEach(num => {
      finalFees[num] = sharingRents[num] || 5000;
    });

    // Compile dynamic floor levels and room structures entered by the hostel owner
    const initialFloors: Floor[] = [];
    registerRooms.forEach(roomItem => {
      // Find or create floor
      let floor = initialFloors.find(f => f.floorNo === roomItem.floorNo);
      if (!floor) {
        floor = { floorNo: roomItem.floorNo, rooms: [] };
        initialFloors.push(floor);
      }

      // Generate beds for the room according to owner specification
      const beds = [];
      for (let i = 1; i <= roomItem.totalBeds; i++) {
        const isOccupied = i <= roomItem.occupiedBeds;
        beds.push({
          id: `${roomItem.roomNo}-bed-${i}`,
          name: `Bed ${i}`,
          status: (isOccupied ? 'occupied' : 'empty') as 'occupied' | 'empty',
          bookedBy: isOccupied ? 'resident@gmail.com' : undefined,
          tenantName: isOccupied ? `Resident ${i}` : undefined,
          tenantMobile: isOccupied ? '9876543210' : undefined,
          joiningDate: isOccupied ? new Date().toISOString().split('T')[0] : undefined
        });
      }

      floor.rooms.push({
        roomNo: roomItem.roomNo,
        sharingType: roomItem.sharingType,
        totalBeds: roomItem.totalBeds,
        occupiedBeds: roomItem.occupiedBeds,
        emptyBeds: roomItem.totalBeds - roomItem.occupiedBeds,
        beds
      });
    });

    // Sort floors in ascending order
    initialFloors.sort((a, b) => a.floorNo - b.floorNo);

    const defaultImages = [
      'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
    ];

    onRegisterHostel({
      name: registerName,
      address: registerAddress,
      area: registerArea,
      gstNumber: registerGst,
      aadhaarNumber: registerAadhaar,
      panCardNumber: registerPan,
      vaccinationStatus: registerVaccination,
      foodRating: registerFoodRating,
      cleaningRating: registerCleaningRating,
      images: defaultImages,
      sharingFees: finalFees
    }, currentUser.username, initialFloors);

    setFormSuccess('Congratulations! Your hostel has been registered. You can now manage floors, beds, and bookings!');
  };

  // Handle Hostel Info Updates (GST, PAN, Aadhaar, rents, vaccination)
  const handleUpdateHostel = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!myHostel) return;

    if (!editName.trim() || !editAddress.trim() || !editArea.trim()) {
      setFormError('Hostel Name, Address, and Area are required.');
      return;
    }

    if (editGst && !validateGST(editGst)) {
      setFormError('Invalid GST Number format.');
      return;
    }
    if (editAadhaar && !validateAadhaar(editAadhaar)) {
      setFormError('Invalid Aadhaar. Must be exactly 12 digits.');
      return;
    }
    if (editPan && !validatePAN(editPan)) {
      setFormError('Invalid PAN. Must be 10 characters alphanumeric.');
      return;
    }

    onUpdateHostelInfo(myHostel.id, {
      name: editName,
      address: editAddress,
      area: editArea,
      gstNumber: editGst,
      aadhaarNumber: editAadhaar,
      panCardNumber: editPan,
      vaccinationStatus: editVaccination,
      sharingFees: editSharingRents,
      foodRating: editFoodRating,
      cleaningRating: editCleaningRating
    });

    setFormSuccess('Hostel details updated in real-time successfully!');
    setTimeout(() => setFormSuccess(''), 2000);
  };

  // Handle Image Upload Simulation for Supplier
  const handleHostelImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!myHostel) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Add newly uploaded photo to the hostel images
          const updatedImages = [reader.result as string, ...myHostel.images];
          onUpdateHostelImages(myHostel.id, updatedImages);
          setFormSuccess('Image uploaded and updated in real-time!');
          setTimeout(() => setFormSuccess(''), 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFloorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myHostel || newFloorNo === '') return;

    if (myHostel.floors.some(f => f.floorNo === newFloorNo)) {
      alert(`Floor ${newFloorNo} already exists!`);
      return;
    }

    onAddFloor(myHostel.id, Number(newFloorNo));
    setNewFloorNo('');
    setFormSuccess(`Floor ${newFloorNo} added successfully!`);
    setTimeout(() => setFormSuccess(''), 2000);
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myHostel || addRoomFloorNo === '' || !addRoomNo.trim()) {
      alert('Please fill in floor number and room number.');
      return;
    }

    // Check if room already exists on that floor
    const floor = myHostel.floors.find(f => f.floorNo === Number(addRoomFloorNo));
    if (floor && floor.rooms.some(r => r.roomNo === addRoomNo)) {
      alert(`Room ${addRoomNo} already exists on Floor ${addRoomFloorNo}!`);
      return;
    }

    onAddRoom(
      myHostel.id,
      Number(addRoomFloorNo),
      addRoomNo.trim(),
      Number(addRoomSharingType),
      Number(addRoomTotalBeds)
    );

    setAddRoomNo('');
    setFormSuccess(`Room ${addRoomNo} added to Floor ${addRoomFloorNo} successfully!`);
    setTimeout(() => setFormSuccess(''), 2000);
  };

  // Bookings for this hostel
  const myHostelBookings = myHostel 
    ? bookings.filter(b => b.hostelId === myHostel.id)
    : [];

  // Toggle Sharing check boxes in registration helper
  const handleSharingCheckbox = (num: number) => {
    if (selectedSharingTypes.includes(num)) {
      setSelectedSharingTypes(prev => prev.filter(n => n !== num));
    } else {
      setSelectedSharingTypes(prev => [...prev, num]);
    }
  };

  // Helper to change sharing fees in registration
  const handleSharingRentChange = (num: number, val: number) => {
    setSharingRents(prev => ({ ...prev, [num]: val }));
  };

  // Helper to edit sharing rent
  const handleEditRentChange = (num: number, val: number) => {
    setEditSharingRents(prev => ({ ...prev, [num]: val }));
  };

  // Preset images for supplier to quickly choose
  const SUPPLIER_IMAGE_PRESETS = [
    'https://images.pexels.com/photos/5137980/pexels-photo-5137980.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    'https://images.pexels.com/photos/4907226/pexels-photo-4907226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    'https://images.pexels.com/photos/4907430/pexels-photo-4907430.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    'https://images.pexels.com/photos/7968273/pexels-photo-7968273.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'
  ];

  // 1. IF SUPPLIER HAS NO REGISTERED HOSTEL YET, SHOW REGISTRATION FORM
  if (!myHostel) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl"></div>
          <div className="relative z-10 space-y-3 max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-inset ring-purple-500/30">
              👋 Welcome, {currentUser.username}!
            </span>
            <h2 className="text-2xl font-bold sm:text-3xl">List Your Hostel on HostelHub</h2>
            <p className="text-sm text-indigo-200">
              In order to receive bookings, manage floors, and toggle bed availability, you must first register your hostel details below.
            </p>
          </div>
        </div>

        {/* Registration form card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center">
            <Building className="h-5 w-5 mr-2 text-indigo-600" />
            Hostel Registration & Business Details
          </h3>

          <form onSubmit={handleRegisterSubmit} className="space-y-6">
            {formError && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-600 border border-rose-100">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-600 border border-emerald-100">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Hostel Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostel Name *</label>
                <input
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="e.g. Starlight Executive Residency"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Surrounding Area */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surrounding Area / City *</label>
                <input
                  type="text"
                  required
                  value={registerArea}
                  onChange={(e) => setRegisterArea(e.target.value)}
                  placeholder="e.g. Madhapur, Hyderabad or Whitefield, Bangalore"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Complete Address *</label>
              <textarea
                required
                value={registerAddress}
                onChange={(e) => setRegisterAddress(e.target.value)}
                placeholder="Plot no, Street name, Near landmark, pin code..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-indigo-600 focus:outline-none"
              />
            </div>

            {/* Business Verification Details (GST, Aadhaar, PAN) */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-indigo-900 block">Verification & Compliance Documents (Optional for testing, validated)</span>
              
              <div className="grid gap-4 sm:grid-cols-3">
                {/* GST Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">GST Number (15 chars)</label>
                  <input
                    type="text"
                    value={registerGst}
                    onChange={(e) => setRegisterGst(e.target.value.toUpperCase())}
                    placeholder="e.g. 36AAAAA1111A1Z1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Aadhaar Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Aadhaar Card (12 digits)</label>
                  <input
                    type="text"
                    value={registerAadhaar}
                    onChange={(e) => setRegisterAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    placeholder="e.g. 999988887777"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {/* PAN Card Number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">PAN Card (10 chars)</label>
                  <input
                    type="text"
                    value={registerPan}
                    onChange={(e) => setRegisterPan(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. ABCDE1234F"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Vaccination, Food & Cleaning Ratings */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vaccination & Safety Status *</label>
                <select
                  value={registerVaccination}
                  onChange={(e: any) => setRegisterVaccination(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                >
                  <option value="100% Vaccinated Staff">100% Vaccinated Staff</option>
                  <option value="Fully Sanitized">Fully Sanitized</option>
                  <option value="Standard Precautions">Standard Precautions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Food Quality Rating *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  value={registerFoodRating}
                  onChange={(e) => setRegisterFoodRating(parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cleaning Rating *</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  value={registerCleaningRating}
                  onChange={(e) => setRegisterCleaningRating(parseFloat(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Rents & Categories Setup */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase">Room Sharing Categories & Monthly Fees *</label>
              <span className="text-[11px] text-slate-400 block -mt-2">Check the sharing categories your hostel offers and enter the monthly rent.</span>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const isChecked = selectedSharingTypes.includes(num);
                  return (
                    <div 
                      key={num}
                      className={`rounded-xl border p-3 flex items-center justify-between transition-all ${
                        isChecked ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`sharing-${num}`}
                          checked={isChecked}
                          onChange={() => handleSharingCheckbox(num)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <label htmlFor={`sharing-${num}`} className="text-xs font-bold text-slate-700 cursor-pointer">
                          {num} Sharing
                        </label>
                      </div>

                      {isChecked && (
                        <div className="flex items-center space-x-1 w-28">
                          <span className="text-xs text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={sharingRents[num] || ''}
                            onChange={(e) => handleSharingRentChange(num, Number(e.target.value))}
                            placeholder="Rent (₹)"
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-right focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Configure Room Structures & Bed Capacities Panel */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950">Configure Room Structures & Bed Occupancy</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Define your floors, room numbers, total beds, occupied beds, and empty beds. We initialize these with the standard mock setup so you can start instantly.
                </p>
              </div>

              {/* Add Room Form */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 grid gap-3 sm:grid-cols-5 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Level</label>
                  <input
                    type="number"
                    min={1}
                    value={regRoomFloor}
                    onChange={(e) => setRegRoomFloor(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Room No.</label>
                  <input
                    type="text"
                    placeholder="e.g. 104"
                    value={regRoomNo}
                    onChange={(e) => setRegRoomNo(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sharing Type</label>
                  <select
                    value={regRoomSharing}
                    onChange={(e) => setRegRoomSharing(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-600 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <option key={n} value={n}>{n} Sharing</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Total Beds</label>
                  <input
                    type="number"
                    min={1}
                    value={regRoomTotal}
                    onChange={(e) => setRegRoomTotal(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Occupied Beds</label>
                  <input
                    type="number"
                    min={0}
                    value={regRoomOccupied}
                    onChange={(e) => setRegRoomOccupied(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="sm:col-span-5 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!regRoomNo.trim()) {
                        alert('Please enter a room number.');
                        return;
                      }
                      if (regRoomOccupied > regRoomTotal) {
                        alert('Occupied beds cannot be greater than total beds!');
                        return;
                      }
                      const exists = registerRooms.some(r => r.floorNo === regRoomFloor && r.roomNo === regRoomNo);
                      if (exists) {
                        alert(`Room ${regRoomNo} already exists on Floor ${regRoomFloor}!`);
                        return;
                      }
                      setRegisterRooms(prev => [
                        ...prev,
                        {
                          floorNo: regRoomFloor,
                          roomNo: regRoomNo.trim(),
                          sharingType: regRoomSharing,
                          totalBeds: regRoomTotal,
                          occupiedBeds: regRoomOccupied
                        }
                      ]);
                      setRegRoomNo('');
                    }}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                  >
                    + Add Room to Setup
                  </button>
                </div>
              </div>

              {/* Current Rooms List */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Rooms configured for listing:</span>
                <div className="grid gap-2">
                  {registerRooms.map((roomItem, index) => {
                    const emptyBeds = roomItem.totalBeds - roomItem.occupiedBeds;
                    return (
                      <div key={index} className="bg-white rounded-lg p-3 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 mr-2">
                            Floor {roomItem.floorNo}
                          </span>
                          <strong className="text-slate-800">Room {roomItem.roomNo}</strong>
                          <span className="text-slate-400 mx-2">|</span>
                          <span className="text-slate-600 font-semibold">{roomItem.sharingType} Sharing</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-slate-500">Total Beds: <strong className="text-slate-800 font-bold">{roomItem.totalBeds}</strong></span>
                          <span className="text-slate-500">Occupied: <strong className="text-amber-700 font-bold">{roomItem.occupiedBeds}</strong></span>
                          <span className="text-slate-500">Empty: <strong className="text-emerald-600 font-bold">{emptyBeds}</strong></span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (registerRooms.length <= 1) {
                                alert('Your hostel must be initialized with at least one room.');
                                return;
                              }
                              setRegisterRooms(prev => prev.filter((_, idx) => idx !== index));
                            }}
                            className="text-rose-600 hover:text-rose-800 font-bold ml-2 text-[11px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Register Action */}
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              List My Hostel & Open Owner Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. IF SUPPLIER ALREADY HAS A REGISTERED HOSTEL, RENDER COMPREHENSIVE DASHBOARD
  const vacancyStats = getHostelVacancyStats(myHostel);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      {/* Dashboard Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Supplier Portal / Live Dashboard
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {myHostel.name}
            </h2>
            <p className="text-xs text-slate-300 font-medium flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1 text-purple-400" />
              {myHostel.address}
            </p>
          </div>

          {/* Real-time Vacancy Status Widget */}
          <div className="flex gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xs p-3 text-center border border-white/10 min-w-[100px]">
              <span className="text-[9px] font-bold text-slate-300 uppercase block">Total Beds</span>
              <span className="text-2xl font-extrabold text-white block my-0.5">{vacancyStats.total}</span>
              <span className="text-[10px] text-slate-300">Capacity</span>
            </div>
            <div className="rounded-2xl bg-emerald-500/25 backdrop-blur-xs p-3 text-center border border-emerald-500/20 min-w-[100px]">
              <span className="text-[9px] font-bold text-slate-200 uppercase block">Empty Beds</span>
              <span className="text-2xl font-extrabold text-emerald-400 block my-0.5">{vacancyStats.empty}</span>
              <span className="text-[10px] text-emerald-200">Available</span>
            </div>
            <div className="rounded-2xl bg-amber-500/25 backdrop-blur-xs p-3 text-center border border-amber-500/20 min-w-[100px]">
              <span className="text-[9px] font-bold text-slate-200 uppercase block">Occupied</span>
              <span className="text-2xl font-extrabold text-amber-400 block my-0.5">{vacancyStats.occupied}</span>
              <span className="text-[10px] text-amber-200">Filled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 max-w-md">
        <button
          onClick={() => setSupplierTab('bookings')}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition-all ${
            supplierTab === 'bookings' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Booking Requests ({myHostelBookings.length})
        </button>
        <button
          onClick={() => setSupplierTab('rooms')}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition-all ${
            supplierTab === 'rooms' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Floors & Bed Occupancy
        </button>
        <button
          onClick={() => setSupplierTab('edit-hostel')}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition-all ${
            supplierTab === 'edit-hostel' 
              ? 'bg-white text-indigo-600 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Hostel Settings & Rent
        </button>
      </div>

      {formSuccess && (
        <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-600 border border-emerald-100">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* SUB-TAB 1: MANAGING INCOMING CUSTOMER BOOKING REQUESTS */}
      {supplierTab === 'bookings' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Incoming Booking Requests</h3>
            <p className="text-xs text-slate-500">Approve or reject reservations. Approvals instantly occupy the bed and recalculate empty stats.</p>
          </div>

          {myHostelBookings.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No booking requests received yet for your hostel.</p>
              <p className="text-[10px] text-slate-400 mt-1">When customers pick a bed and submit the joining form, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myHostelBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-wrap items-center justify-between gap-4 transition-all hover:bg-slate-50"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm">{booking.customerName}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        booking.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-indigo-600">
                      Floor {booking.floorNo} → Room {booking.roomNo} → {booking.bedName} ({booking.sharingType} Sharing)
                    </p>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <p>Email: <strong className="text-slate-700 font-bold">{booking.customerEmail}</strong></p>
                      <p>Mobile: <strong className="text-slate-700">{booking.customerMobile}</strong> | Emergency Mobile: <strong className="text-slate-700">{booking.emergencyContact}</strong></p>
                      <p>Proposed Date of Joining: <strong className="text-slate-700 font-bold">{booking.dateOfJoining}</strong></p>
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex flex-col items-end justify-between gap-3 min-w-[150px]">
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">Proposed Rent</span>
                      <span className="text-base font-extrabold text-slate-900">₹{booking.fee}</span>
                    </div>

                    {booking.status === 'pending' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onBookingDecision(booking.id, 'rejected')}
                          className="flex items-center space-x-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => onBookingDecision(booking.id, 'approved')}
                          className="flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        Processed on {booking.bookingDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MANAGING FLOORS AND ROOM-WISE BED OCCUPANCY INSTANTLY */}
      {supplierTab === 'rooms' && (
        <div className="space-y-6">
          
          {/* Floor & Room Adding Forms */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Add Floor Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Add New Floor</h4>
                <p className="text-[10px] text-slate-500">Add a floor level to separate rooms accurately.</p>
              </div>

              <form onSubmit={handleAddFloorSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Floor Level (e.g. 3, 4)</label>
                  <input
                    type="number"
                    required
                    value={newFloorNo}
                    onChange={(e) => setNewFloorNo(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Enter Floor Number"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create Floor
                </button>
              </form>
            </div>

            {/* Add Room Card */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Add New Room</h4>
                <p className="text-[10px] text-slate-500">Create a room under a specific floor level.</p>
              </div>

              <form onSubmit={handleAddRoomSubmit} className="grid gap-3 sm:grid-cols-2">
                {/* Floor select */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Floor</label>
                  <select
                    value={addRoomFloorNo}
                    required
                    onChange={(e) => setAddRoomFloorNo(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="">-- Choose Floor --</option>
                    {myHostel.floors.map(f => (
                      <option key={f.floorNo} value={f.floorNo}>Floor {f.floorNo}</option>
                    ))}
                  </select>
                </div>

                {/* Room No */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Room Number (e.g. 201, 503)</label>
                  <input
                    type="text"
                    required
                    value={addRoomNo}
                    onChange={(e) => setAddRoomNo(e.target.value)}
                    placeholder="e.g. 104"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Sharing Category */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sharing Type</label>
                  <select
                    value={addRoomSharingType}
                    onChange={(e) => setAddRoomSharingType(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="1">1 Sharing (Single)</option>
                    <option value="2">2 Sharing</option>
                    <option value="3">3 Sharing</option>
                    <option value="4">4 Sharing</option>
                    <option value="5">5 Sharing</option>
                    <option value="6">6 Sharing</option>
                  </select>
                </div>

                {/* Total Beds */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Beds in Room</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={addRoomTotalBeds}
                    onChange={(e) => setAddRoomTotalBeds(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="sm:col-span-2 rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                >
                  Create & Initialize Room
                </button>
              </form>
            </div>
          </div>

          {/* Room-wise & Floor-wise Bed Management (Toggles occupancy instantly) */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Instant Room-wise Bed Occupancy Manager</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each floor and room is listed separately. Click on any bed in the grids below to toggle its status between <strong>"Occupied" (locked)</strong> and <strong>"Empty" (available)</strong> instantly.
              </p>
            </div>

            <div className="space-y-6">
              {myHostel.floors.map((floor) => (
                <div key={floor.floorNo} className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-4">
                  <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
                    <span className="inline-flex items-center rounded-md bg-purple-600 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                      Floor {floor.floorNo}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      Rooms on floor: {floor.rooms.length}
                    </span>
                  </div>

                  {floor.rooms.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No rooms added to this floor yet. Use the form above to add one.</p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {floor.rooms.map((room) => (
                        <div key={room.roomNo} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
                          
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-slate-900 text-sm">Room {room.roomNo}</span>
                              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {room.sharingType} Sharing
                              </span>
                            </div>
                            
                            <div className="text-[10px] text-slate-400 font-bold">
                              {room.emptyBeds} Empty / {room.totalBeds} Total
                            </div>
                          </div>

                          {/* Interactive bed toggler grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {room.beds.map((bed) => {
                              const isOccupied = bed.status === 'occupied';
                              return (
                                <div key={bed.id} className="flex flex-col space-y-1">
                                  <button
                                    type="button"
                                    onClick={() => onToggleBedStatus(myHostel.id, floor.floorNo, room.roomNo, bed.id)}
                                    className={`w-full rounded-lg p-2 flex flex-col items-center justify-center border transition-all text-center ${
                                      isOccupied
                                        ? 'bg-slate-100 border-slate-300 text-slate-600'
                                        : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                    title="Click to toggle status instantly"
                                  >
                                    <BedIcon className="h-4 w-4" />
                                    <span className="text-[10px] font-bold mt-0.5">{bed.name}</span>
                                    <span className="text-[8px] font-bold block uppercase opacity-85">
                                      {isOccupied ? 'Occupied' : 'Empty'}
                                    </span>
                                  </button>
                                  {isOccupied && (bed.tenantName || bed.tenantMobile || bed.joiningDate) && (
                                    <div className="text-[8px] bg-slate-100 rounded p-1.5 text-center border border-slate-200 space-y-0.5">
                                      <span className="font-extrabold block truncate text-indigo-700" title={bed.tenantName}>{bed.tenantName || 'Resident'}</span>
                                      {bed.tenantMobile && <span className="block text-slate-600 font-semibold">{bed.tenantMobile}</span>}
                                      {bed.joiningDate && <span className="block text-slate-500">Joined: {bed.joiningDate}</span>}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-center">
                            <span className="text-[9px] text-slate-400 italic">
                              Click any bed above to instantly toggle available/occupied status.
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: EDIT HOSTEL SETTINGS, MONTHLY RENTS & COMPLIANCE */}
      {supplierTab === 'edit-hostel' && (
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Settings form */}
          <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hostel Settings</h3>
              <p className="text-xs text-slate-500">Update business licenses, compliance numbers, monthly rates, and details in real-time.</p>
            </div>

            <form onSubmit={handleUpdateHostel} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hostel Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Surrounding Area / City</label>
                  <input
                    type="text"
                    required
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <textarea
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Business Numbers */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-indigo-900 block">Verification Documents</span>
                
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">GST Number</label>
                    <input
                      type="text"
                      value={editGst}
                      onChange={(e) => setEditGst(e.target.value.toUpperCase())}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Aadhaar (12 Digits)</label>
                    <input
                      type="text"
                      value={editAadhaar}
                      onChange={(e) => setEditAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">PAN Card (10 chars)</label>
                    <input
                      type="text"
                      value={editPan}
                      onChange={(e) => setEditPan(e.target.value.toUpperCase().slice(0, 10))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Vaccination, Food & Cleaning Ratings */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Health & Safety Status</label>
                  <select
                    value={editVaccination}
                    onChange={(e: any) => setEditVaccination(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                  >
                    <option value="100% Vaccinated Staff">100% Vaccinated Staff</option>
                    <option value="Fully Sanitized">Fully Sanitized Facility</option>
                    <option value="Standard Precautions">Standard Health Precautions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Food Quality Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={editFoodRating}
                    onChange={(e) => setEditFoodRating(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cleaning Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={editCleaningRating}
                    onChange={(e) => setEditCleaningRating(parseFloat(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-600 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Rent modification */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase">Monthly Rents per Sharing Category</label>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map(num => {
                    const fee = editSharingRents[num];
                    return (
                      <div key={num} className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-600 block">{num} Sharing Rent</span>
                        <div className="mt-1 flex items-center space-x-1">
                          <span className="text-xs text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={fee || ''}
                            onChange={(e) => handleEditRentChange(num, Number(e.target.value))}
                            placeholder="N/A"
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-right focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
              >
                Save Live Settings Changes
              </button>
            </form>
          </div>

          {/* Photo Management Side-Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Live Hostel Photo Gallery</h3>
              <p className="text-[11px] text-slate-500">Upload high-res rooms/food images. Customers see these instantly during search.</p>
            </div>

            {/* Simulated uploader */}
            <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/10 transition-colors">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">Upload Hostel Image</span>
              <span className="text-[10px] text-slate-500 mt-0.5">JPG or PNG. Size up to 5MB.</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleHostelImageUpload}
                className="hidden"
              />
            </label>

            {/* Quick Presets helper for easy testing */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Or Quick-Add Demo Presets:</span>
              <div className="grid grid-cols-2 gap-2">
                {SUPPLIER_IMAGE_PRESETS.map((presetUrl, idx) => {
                  const alreadyHas = myHostel.images.includes(presetUrl);
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={alreadyHas}
                      onClick={() => {
                        onUpdateHostelImages(myHostel.id, [presetUrl, ...myHostel.images]);
                        setFormSuccess('Preset image added to your hostel gallery!');
                        setTimeout(() => setFormSuccess(''), 1500);
                      }}
                      className={`h-16 rounded-xl overflow-hidden border relative transition-all ${
                        alreadyHas ? 'opacity-50 cursor-not-allowed border-slate-100' : 'border-slate-200 hover:scale-102'
                      }`}
                    >
                      <img src={presetUrl} alt="Preset" className="h-full w-full object-cover" />
                      {alreadyHas && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-[9px] text-white font-bold">
                          Added
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active photos list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Hostel Photos ({myHostel.images.length})</span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {myHostel.images.map((img, idx) => (
                  <div key={idx} className="relative h-16 rounded-xl overflow-hidden border border-slate-200 group">
                    <img src={img} alt="Hostel" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        // Keep at least one image
                        if (myHostel.images.length <= 1) {
                          alert('Hostel must have at least 1 photo.');
                          return;
                        }
                        onUpdateHostelImages(myHostel.id, myHostel.images.filter((_, i) => i !== idx));
                        setFormSuccess('Photo deleted successfully!');
                        setTimeout(() => setFormSuccess(''), 1500);
                      }}
                      className="absolute top-1 right-1 rounded-lg bg-slate-900/60 p-1 text-white hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
