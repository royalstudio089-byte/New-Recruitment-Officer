import React, { useState, useEffect } from 'react';
import { X, UserPlus, Phone, MapPin, User, Car, Shield, Award } from 'lucide-react';
import { SecurityOfficer, CarOption, DogHandlerOption } from '../types';
import { STATUS_OPTIONS, CITY_OPTIONS, DOG_HANDLER_OPTIONS } from '../data/initialOfficers';

interface AddOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (officer: Omit<SecurityOfficer, 'id' | 'srNo'>, editId?: string) => void;
  editOfficer?: SecurityOfficer | null;
  nextSrNo: number;
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
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editOfficer) {
      setName(editOfficer.name);
      setCity(editOfficer.city || 'London');
      setPhoneNumber(editOfficer.phoneNumber);
      setStatus(editOfficer.status);
      setCar(editOfficer.car);
      setDogHandler(editOfficer.dogHandler || 'No');
      setNotes(editOfficer.notes || '');
    } else {
      setName('');
      setCity('London');
      setPhoneNumber('');
      setStatus('Full timer');
      setCar('No');
      setDogHandler('No');
      setNotes('');
    }
    setError('');
  }, [editOfficer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide officer full name.');
      return;
    }
    if (!city.trim()) {
      setError('Please select a city or deployment base.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Please enter contact phone number.');
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
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {error}
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
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Phone Number (Text Format) *
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0300-1234567"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 font-mono text-slate-800"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Preserves leading zeros (e.g. 0300-1234567)
              </p>
            </div>
          </div>

          {/* Status, Car & Dog Handler Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
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
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all bg-white font-medium text-slate-800"
              >
                <option value="Yes">Yes (K9 Certified)</option>
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
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              {editOfficer ? 'Update Record' : 'Add to Recruitment Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
