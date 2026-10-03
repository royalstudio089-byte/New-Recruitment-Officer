import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Phone, 
  MapPin, 
  User, 
  Car, 
  Shield, 
  Award, 
  AlertCircle, 
  CheckCircle2,
  Move
} from 'lucide-react';
import { SecurityOfficer, CarOption, DogHandlerOption, EasyToMoveOption } from '../types';
import { STATUS_OPTIONS, CITY_OPTIONS, DOG_HANDLER_OPTIONS, EASY_TO_MOVE_OPTIONS } from '../data/initialOfficers';

interface AddOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (officer: Omit<SecurityOfficer, 'id' | 'srNo'>, editId?: string) => void;
  editOfficer?: SecurityOfficer | null;
  nextSrNo: number;
}

/**
 * Validates phone numbers ensuring correct character set, length, and digit requirements
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; digitCount: number } {
  const trimmed = phone.trim();
  const digitCount = (trimmed.match(/\d/g) || []).length;

  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required.', digitCount: 0 };
  }

  // Allowed characters: optional leading +, digits, spaces, hyphens, dots, parentheses
  const allowedPattern = /^[+]?[\d\s\-().]+$/;
  if (!allowedPattern.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Invalid characters. Use digits, spaces, hyphens, or a leading "+".', 
      digitCount 
    };
  }

  // Length check on pure digits (international / UK standards: 10 to 15 digits)
  if (digitCount < 10) {
    return { 
      isValid: false, 
      error: `Too short (${digitCount} digits). Valid phone numbers require at least 10 digits (e.g. 07436232695).`, 
      digitCount 
    };
  }

  if (digitCount > 15) {
    return { 
      isValid: false, 
      error: `Too long (${digitCount} digits). Standard phone numbers cannot exceed 15 digits.`, 
      digitCount 
    };
  }

  return { isValid: true, digitCount };
}

export const AddOfficerModal: React.FC<AddOfficerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editOfficer,
  nextSrNo
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState<string>('London');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<string>('Full timer');
  const [car, setCar] = useState<CarOption>('No');
  const [dogHandler, setDogHandler] = useState<DogHandlerOption>('No');
  const [easyToMove, setEasyToMove] = useState<EasyToMoveOption>('Yes');
  const [notes, setNotes] = useState('');
  
  // Validation states
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isPhoneTouched, setIsPhoneTouched] = useState(false);

  useEffect(() => {
    if (editOfficer) {
      setName(editOfficer.name);
      setCity(editOfficer.city || 'London');
      setPhoneNumber(editOfficer.phoneNumber);
      setStatus(editOfficer.status);
      setCar(editOfficer.car);
      setDogHandler(editOfficer.dogHandler || 'No');
      setEasyToMove(editOfficer.easyToMove || 'Yes');
      setNotes(editOfficer.notes || '');
    } else {
      setName('');
      setCity('London');
      setPhoneNumber('');
      setStatus('Full timer');
      setCar('No');
      setDogHandler('No');
      setEasyToMove('Yes');
      setNotes('');
    }
    setError('');
    setPhoneError(null);
    setIsPhoneTouched(false);
  }, [editOfficer, isOpen]);

  if (!isOpen) return null;

  // Real-time phone change handler
  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    if (isPhoneTouched || val.length >= 3) {
      const validation = validatePhoneNumber(val);
      if (!validation.isValid) {
        setPhoneError(validation.error || 'Invalid phone format');
      } else {
        setPhoneError(null);
      }
    }
  };

  const handlePhoneBlur = () => {
    setIsPhoneTouched(true);
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.isValid) {
      setPhoneError(validation.error || 'Invalid phone format');
    } else {
      setPhoneError(null);
    }
  };

  const phoneValidationResult = validatePhoneNumber(phoneNumber);
  const isPhoneValid = phoneValidationResult.isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide officer full name.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Officer name must be at least 2 characters.');
      return;
    }

    if (!city.trim()) {
      setError('Please select a city or deployment base.');
      return;
    }

    // Comprehensive Phone Number Validation
    setIsPhoneTouched(true);
    const phoneCheck = validatePhoneNumber(phoneNumber);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.error || 'Invalid phone format');
      setError(phoneCheck.error || 'Please enter a valid phone number before saving.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        city: city.trim(),
        phoneNumber: phoneNumber.trim(),
        status,
        car,
        dogHandler,
        easyToMove,
        notes: notes.trim()
      },
      editOfficer?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                {editOfficer ? 'Edit Security Officer' : 'Add New Security Officer'}
              </h3>
              <p className="text-xs text-slate-300">
                {editOfficer ? `Editing Sr. No. ${editOfficer.srNo}` : `Assigning Sr. No. ${nextSrNo}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Officer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Officer Name (First & Surname) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Muhammad Tariq Khan"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* City & Phone in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                City *
              </label>
              <select
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Select officer deployment city
              </p>
            </div>

            {/* Phone Number Field with Active Input Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Phone Number *
                </label>
                {isPhoneTouched && isPhoneValid && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Valid ({phoneValidationResult.digitCount} digits)
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  placeholder="07436232695"
                  className={`w-full px-3.5 py-2 text-sm border rounded-lg outline-none transition-all font-mono placeholder:text-slate-400 text-slate-800 ${
                    phoneError && isPhoneTouched
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                      : isPhoneTouched && isPhoneValid
                      ? 'border-emerald-400 bg-emerald-50/20 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
                      : 'border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Validation Feedback message */}
              {phoneError && isPhoneTouched ? (
                <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">
                  Enter 10–15 digits (e.g. 07436232695, +44 7770 577295)
                </p>
              )}
            </div>
          </div>

          {/* Status, Car, Dog Handler & Easy to Move Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                <optgroup label="Work / Visa Status (Primary)">
                  <option value="Student">Student</option>
                  <option value="Full timer">Full timer</option>
                  <option value="E-Visa">E-Visa</option>
                </optgroup>
                <optgroup label="Pipeline Stages">
                  <option value="New Applicant">New Applicant</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Interviewed">Interviewed</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                Car *
              </label>
              <select
                value={car}
                onChange={(e) => setCar(e.target.value as CarOption)}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                <option value="Yes">Yes (Has car)</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                Dog Handler *
              </label>
              <select
                value={dogHandler}
                onChange={(e) => setDogHandler(e.target.value as DogHandlerOption)}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                <option value="Yes">Yes (K9)</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-slate-400" />
                Easy to Move *
              </label>
              <select
                value={easyToMove}
                onChange={(e) => setEasyToMove(e.target.value as EasyToMoveOption)}
                className="w-full px-2.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                <option value="Yes">Yes (Can Move)</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes & Deployment Availability
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SIA credentials verified, available for night patrol..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-slate-800"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              {editOfficer ? 'Update Record' : 'Add to Recruitment Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
