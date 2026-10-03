/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Printer, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Car, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  Briefcase,
  Sparkles,
  Users,
  LogOut,
  ChevronDown,
  ArrowUpDown,
  FileCheck,
  MapPin,
  Cloud,
  Database,
  Award,
  FileText,
  MessageSquare,
  Move
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SecurityOfficer, CarOption, DogHandlerOption, EasyToMoveOption } from './types';
import { INITIAL_OFFICERS, STATUS_OPTIONS, CAR_OPTIONS, CITY_OPTIONS, DOG_HANDLER_OPTIONS, EASY_TO_MOVE_OPTIONS } from './data/initialOfficers';
import { exportSecurityOfficersWorkbook } from './services/excelExport';
import { exportSecurityOfficersPdf } from './services/pdfExport';
import { createGoogleSheetRoster, syncToGoogleSpreadsheet, GoogleSpreadsheetResult } from './services/googleSheets';
import { initAuth, googleSignIn, getAccessToken, ensureAccessToken, hasActiveToken, logout } from './services/auth';
import { 
  testFirestoreConnection, 
  subscribeToOfficers, 
  saveOfficerToFirestore, 
  deleteOfficerFromFirestore, 
  batchSeedOfficersToFirestore 
} from './services/firestore';
import { AddOfficerModal } from './components/AddOfficerModal';
import { RecruitmentSummaryView } from './components/RecruitmentSummaryView';
import { PrintView } from './components/PrintView';
import { ConfirmationModal } from './components/ConfirmationModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';

export default function App() {
  // Officers state (persisted to localStorage)
  const [officers, setOfficers] = useState<SecurityOfficer[]>(() => {
    try {
      const DATA_VERSION = 'v4_easy_to_move_column';
      const savedVersion = localStorage.getItem('security_officers_data_version');
      if (savedVersion === DATA_VERSION) {
        const saved = localStorage.getItem('security_officers_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any, idx: number) => ({
              ...item,
              dogHandler: item.dogHandler || 'No',
              easyToMove: item.easyToMove || 'Yes',
              srNo: idx + 1
            }));
          }
        }
      }
      // Replaced with updated dataset
      localStorage.setItem('security_officers_data_version', DATA_VERSION);
      localStorage.setItem('security_officers_data', JSON.stringify(INITIAL_OFFICERS));
      return INITIAL_OFFICERS;
    } catch (e) {
      console.error('Error loading saved officers:', e);
    }
    return INITIAL_OFFICERS;
  });

  // Current active tab: 'database' | 'summary'
  const [activeTab, setActiveTab] = useState<'database' | 'summary'>('database');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [carFilter, setCarFilter] = useState('ALL');
  const [dogHandlerFilter, setDogHandlerFilter] = useState('ALL');
  const [easyToMoveFilter, setEasyToMoveFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('ALL');

  // Modal & Print states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<SecurityOfficer | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Google Auth & Workspace state
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(() => hasActiveToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSavingToSheets, setIsSavingToSheets] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [googleSheetResult, setGoogleSheetResult] = useState<GoogleSpreadsheetResult | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Confirmation Modal state for Google Sheets creation (mandatory per workspace skill)
  const [showSheetsConfirmModal, setShowSheetsConfirmModal] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setHasToken(!!token);
      },
      () => {
        setUser(null);
        setHasToken(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Real-time Firestore sync & boot connection test
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setIsFirestoreConnected(connected);
    });

    const unsubscribe = subscribeToOfficers(
      (cloudOfficers) => {
        if (cloudOfficers && cloudOfficers.length > 0) {
          const sorted = [...cloudOfficers].sort((a, b) => a.srNo - b.srNo);
          setOfficers(sorted);
        }
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save to localStorage when officers change
  useEffect(() => {
    try {
      localStorage.setItem('security_officers_data', JSON.stringify(officers));
    } catch (e) {
      console.error('Error persisting officers:', e);
    }
  }, [officers]);

  // Show temporary toast notification
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Push local roster to Firestore
  const handlePushToFirestore = async () => {
    try {
      setIsSyncingCloud(true);
      await batchSeedOfficersToFirestore(officers);
      showToast('All recruitment officer records synchronized with Firebase Firestore cloud database!');
    } catch (e: any) {
      showToast(e.message || 'Error syncing to Firestore cloud.', 'error');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasToken(true);
        showToast(`Connected to Google as ${res.user.displayName || res.user.email}`);
      }
    } catch (error: any) {
      console.error('Sign-in error:', error);
      showToast(error.message || 'Failed to sign in with Google.', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Google Sign-Out Handler
  const handleGoogleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setHasToken(false);
      setGoogleSheetResult(null);
      showToast('Signed out of Google account.', 'info');
    } catch (error: any) {
      showToast(error.message || 'Error signing out.', 'error');
    }
  };

  // Trigger Google Sheets confirmation
  const handleInitiateSaveToSheets = async () => {
    if (!user || !hasToken) {
      // Need fresh authorization
      try {
        setIsSigningIn(true);
        const res = await googleSignIn();
        if (res) {
          setUser(res.user);
          setHasToken(true);
          showToast(`Connected to Google as ${res.user.displayName || res.user.email}`);
          setShowSheetsConfirmModal(true);
        }
      } catch (err: any) {
        showToast(err.message || 'Authentication cancelled.', 'error');
      } finally {
        setIsSigningIn(false);
      }
      return;
    }
    // Show confirmation modal as required by Workspace integration guidelines
    setShowSheetsConfirmModal(true);
  };

  // Confirmed Google Sheets export execution
  const handleExecuteSaveToSheets = async () => {
    try {
      setIsSavingToSheets(true);
      const token = await ensureAccessToken();
      setHasToken(true);

      if (googleSheetResult?.spreadsheetId) {
        // Sync to existing spreadsheet
        await syncToGoogleSpreadsheet(token, googleSheetResult.spreadsheetId, officers);
        showToast('Successfully synchronized recruitment roster with your Google Sheet!');
      } else {
        // Create new Google Spreadsheet
        const result = await createGoogleSheetRoster(
          token,
          officers,
          'NEW RECRUITMENT – SECURITY OFFICERS'
        );
        setGoogleSheetResult(result);
        showToast('Created new Google Spreadsheet: "NEW RECRUITMENT – SECURITY OFFICERS"!');
      }
      setShowSheetsConfirmModal(false);
    } catch (error: any) {
      console.error('Error saving to Google Sheets:', error);
      showToast(error.message || 'Failed to save to Google Sheets.', 'error');
    } finally {
      setIsSavingToSheets(false);
    }
  };

  // Download Microsoft Excel (.xlsx) workbook
  const handleExportToExcel = async () => {
    try {
      setIsExportingExcel(true);
      const blob = await exportSecurityOfficersWorkbook(officers);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NEW_RECRUITMENT_SECURITY_OFFICERS_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast('Microsoft Excel workbook (.xlsx) generated and downloaded successfully!');
    } catch (error: any) {
      console.error('Error exporting Excel workbook:', error);
      showToast(error.message || 'Failed to export Excel file.', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Download A4 Landscape PDF (.pdf) report
  const handleExportToPdf = async () => {
    try {
      setIsExportingPdf(true);
      await exportSecurityOfficersPdf(officers);
      showToast('Official A4 Landscape PDF report generated and downloaded successfully!');
    } catch (error: any) {
      console.error('Error exporting PDF report:', error);
      showToast(error.message || 'Failed to generate PDF.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Add or Update officer
  const handleSaveOfficer = (
    officerData: Omit<SecurityOfficer, 'id' | 'srNo'>,
    editId?: string
  ) => {
    if (editId) {
      setOfficers(prev => {
        const next = prev.map(o => (o.id === editId ? { ...o, ...officerData } : o));
        const updated = next.find(o => o.id === editId);
        if (updated) {
          saveOfficerToFirestore(updated).catch(e => console.warn('Firestore write deferred:', e));
        }
        return next;
      });
      showToast('Security Officer record updated successfully.');
    } else {
      const newOfficer: SecurityOfficer = {
        id: `off-${Date.now()}`,
        srNo: officers.length + 1,
        ...officerData,
        addedAt: new Date().toISOString()
      };
      setOfficers(prev => [...prev, newOfficer]);
      saveOfficerToFirestore(newOfficer).catch(e => console.warn('Firestore write deferred:', e));
      showToast(`Officer "${officerData.name}" added at Sr. No. ${officers.length + 1}.`);
    }
    setEditingOfficer(null);
  };

  // Delete officer
  const handleDeleteOfficer = (id: string) => {
    setOfficers(prev => {
      const updated = prev.filter(o => o.id !== id);
      // Auto-renumber Sr. No. sequentially
      const renumbered = updated.map((item, index) => ({
        ...item,
        srNo: index + 1
      }));
      deleteOfficerFromFirestore(id).catch(e => console.warn('Firestore delete deferred:', e));
      batchSeedOfficersToFirestore(renumbered).catch(e => console.warn('Firestore renumber deferred:', e));
      return renumbered;
    });
    setDeleteTargetId(null);
    showToast('Officer record removed. Sr. No. auto-updated.');
  };

  // Inline City change
  const handleInlineCityChange = (id: string, newCity: string) => {
    setOfficers(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, city: newCity } : o));
      const target = next.find(o => o.id === id);
      if (target) {
        saveOfficerToFirestore(target).catch(e => console.warn('Firestore write deferred:', e));
      }
      return next;
    });
    showToast(`City updated to "${newCity}".`);
  };

  // Inline Status change
  const handleInlineStatusChange = (id: string, newStatus: string) => {
    setOfficers(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, status: newStatus } : o));
      const target = next.find(o => o.id === id);
      if (target) {
        saveOfficerToFirestore(target).catch(e => console.warn('Firestore write deferred:', e));
      }
      return next;
    });
    showToast(`Status updated to "${newStatus}".`);
  };

  // Inline Car change
  const handleInlineCarChange = (id: string, newCar: CarOption) => {
    setOfficers(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, car: newCar } : o));
      const target = next.find(o => o.id === id);
      if (target) {
        saveOfficerToFirestore(target).catch(e => console.warn('Firestore write deferred:', e));
      }
      return next;
    });
    showToast(`Vehicle status updated to "${newCar}".`);
  };

  // Inline Dog Handler change
  const handleInlineDogHandlerChange = (id: string, newDogHandler: DogHandlerOption) => {
    setOfficers(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, dogHandler: newDogHandler } : o));
      const target = next.find(o => o.id === id);
      if (target) {
        saveOfficerToFirestore(target).catch(e => console.warn('Firestore write deferred:', e));
      }
      return next;
    });
    showToast(`Dog Handler status updated to "${newDogHandler}".`);
  };

  // Inline Easy to Move change
  const handleInlineEasyToMoveChange = (id: string, newEasyToMove: EasyToMoveOption) => {
    setOfficers(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, easyToMove: newEasyToMove } : o));
      const target = next.find(o => o.id === id);
      if (target) {
        saveOfficerToFirestore(target).catch(e => console.warn('Firestore write deferred:', e));
      }
      return next;
    });
    showToast(`Easy to move status updated to "${newEasyToMove}".`);
  };

  // Reset to default sample roster
  const handleResetData = () => {
    if (window.confirm('Reset recruitment roster to default sample officers?')) {
      setOfficers(INITIAL_OFFICERS);
      showToast('Recruitment roster restored to default sample data.');
    }
  };

  // Distinct cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const set = new Set(officers.map(o => o.city).filter(Boolean));
    return Array.from(set).sort();
  }, [officers]);

  // Filtered officers list (Sr. No. remains stable based on database rank or display rank)
  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      const matchSearch =
        !searchTerm ||
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'ALL' || officer.status === statusFilter;

      const matchCar = carFilter === 'ALL' || officer.car === carFilter;

      const matchDogHandler = dogHandlerFilter === 'ALL' || officer.dogHandler === dogHandlerFilter;

      const matchEasyToMove = easyToMoveFilter === 'ALL' || (officer.easyToMove || 'Yes') === easyToMoveFilter;

      const matchCity = cityFilter === 'ALL' || officer.city === cityFilter;

      return matchSearch && matchStatus && matchCar && matchDogHandler && matchEasyToMove && matchCity;
    });
  }, [officers, searchTerm, statusFilter, carFilter, dogHandlerFilter, easyToMoveFilter, cityFilter]);

  // Overall recruitment metrics
  const totalOfficers = officers.length;
  const students = officers.filter(o => o.status === 'Student').length;
  const fullTimer = officers.filter(o => o.status === 'Full timer').length;
  const eVisa = officers.filter(o => o.status === 'E-Visa').length;
  const officersWithCar = officers.filter(o => o.car === 'Yes').length;
  const dogHandlers = officers.filter(o => o.dogHandler === 'Yes').length;
  const easyToMoveCount = officers.filter(o => (o.easyToMove || 'Yes') === 'Yes').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 text-sm font-medium ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-blue-900 text-white border-blue-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* TOP EXCEL RIBBON & ACTION HEADER */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
        {/* Ribbon Top Brand Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wide text-white">
                  NEW RECRUITMENT – SECURITY OFFICERS.xlsx
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  Excel & Sheets Workbook
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Corporate security recruitment database • Auto-numbering • Data validation • A4 Print Ready
              </p>
            </div>
          </div>

          {/* Action Buttons: Export to Excel, Google Sheets, Print */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Download Microsoft Excel Workbook */}
            <button
              onClick={handleExportToExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs hover:shadow cursor-pointer"
              title="Export complete Microsoft Excel workbook with formulas and formatting"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingExcel ? 'Generating XLSX...' : 'Export Excel (.xlsx)'}</span>
            </button>

            {/* Google Sheets Integration */}
            {!user ? (
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-slate-800 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors shadow-xs border border-slate-300 cursor-pointer"
                title="Sign in with Google to enable Google Sheets & Drive sync"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isSigningIn ? 'Connecting...' : 'Sign in to Google'}</span>
              </button>
            ) : (
              <div className="flex items-center flex-wrap gap-2">
                {/* Save / Sync to Google Sheets button */}
                <button
                  onClick={handleInitiateSaveToSheets}
                  disabled={isSavingToSheets}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Save or Sync recruitment roster to Google Sheets"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-200" />
                  <span>
                    {isSavingToSheets
                      ? 'Syncing...'
                      : googleSheetResult
                      ? 'Sync to Google Sheets'
                      : 'Save to Google Sheets'}
                  </span>
                </button>

                {/* Sign in again / Re-authenticate button */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  title={`Signed in as ${user.email}. Click to sign in again or switch Google account.`}
                >
                  <RotateCcw className={`w-3 h-3 text-emerald-400 ${isSigningIn ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sign in again</span>
                </button>

                {googleSheetResult && (
                  <a
                    href={googleSheetResult.spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-700 transition-colors"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <button
                  onClick={handleGoogleSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Sign out (${user.email})`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* WhatsApp PDF */}
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Send A4 Landscape PDF and recruitment summary via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp PDF</span>
            </button>

            {/* Export to PDF */}
            <button
              onClick={handleExportToPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Export and download recruitment roster as an A4 Landscape PDF file"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            {/* Export to XLSX */}
            <button
              onClick={handleExportToExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Download Microsoft Excel workbook (.xlsx) with both worksheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExportingExcel ? 'Exporting...' : 'Export XLSX'}</span>
            </button>

            {/* Print A4 Landscape */}
            <button
              onClick={() => setIsPrintOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
              title="Print preview formatted for A4 landscape paper"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print A4</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation: Officer Database vs Recruitment Summary */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'database'
                ? 'border-emerald-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Worksheet 1: Officer Database</span>
            <span className="px-1.5 py-0.2 bg-slate-700 rounded text-[10px] text-slate-300">
              {officers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'summary'
                ? 'border-blue-500 text-white bg-slate-800/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Worksheet 2: Recruitment Summary</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {activeTab === 'summary' ? (
          <RecruitmentSummaryView
            officers={officers}
            onSwitchToDatabase={() => setActiveTab('database')}
          />
        ) : (
          <div className="space-y-5">
            {/* 1. LARGE MERGED TITLE BANNER (EXCEL HEADER) */}
            <div className="bg-[#1e3a8a] text-white rounded-xl shadow-md border border-blue-900/60 overflow-hidden">
              <div className="p-6 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase">
                  NEW RECRUITMENT – SECURITY OFFICERS
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium mt-1.5">
                  Official Recruitment Database • Central Operations Roster • Auto-Numbered Records
                </p>
              </div>

              {/* Sub-strip with quick date and formatting standard */}
              <div className="bg-slate-900/80 px-6 py-2 border-t border-blue-800 flex flex-wrap items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Format: Microsoft Excel & Google Sheets Compliant
                </span>
                <span>Document Status: Active Roster | Print: A4 Landscape</span>
              </div>
            </div>

            {/* GOOGLE SHEETS & FIREBASE INTEGRATION STATUS BANNER */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${user ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Firebase & Google Workspace
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Cloud className="w-3 h-3 text-blue-600" />
                      Firestore DB: Online
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      user ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {user ? `Auth: Connected (${user.email})` : 'Auth: Ready for Sign In'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {user 
                      ? 'Firebase Firestore & Authentication active. Roster syncs to cloud and Google Sheets.'
                      : 'Firebase Firestore cloud database is connected. Sign in with Google to sync across devices.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-2 self-start sm:self-auto">
                {/* Sync to Firestore Cloud button */}
                <button
                  onClick={handlePushToFirestore}
                  disabled={isSyncingCloud}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700 shadow-xs cursor-pointer"
                  title="Upload all current security officers to Firebase Cloud Firestore database"
                >
                  <Cloud className={`w-3.5 h-3.5 text-blue-400 ${isSyncingCloud ? 'animate-pulse' : ''}`} />
                  <span>{isSyncingCloud ? 'Saving...' : 'Sync Cloud DB'}</span>
                </button>

                {!user ? (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <span>{isSigningIn ? 'Connecting...' : 'Sign in to Google'}</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleInitiateSaveToSheets}
                      disabled={isSavingToSheets}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{isSavingToSheets ? 'Saving...' : googleSheetResult ? 'Sync to Google Sheets' : 'Save to Google Sheets'}</span>
                    </button>

                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      title="Re-open Google account selection popup"
                    >
                      <RotateCcw className={`w-3 h-3 text-slate-500 ${isSigningIn ? 'animate-spin' : ''}`} />
                      <span>Sign in again</span>
                    </button>

                    {googleSheetResult && (
                      <a
                        href={googleSheetResult.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 transition-colors"
                      >
                        <span>Open in Sheets</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 2. RECRUITMENT SUMMARY KPI BAR AT TOP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* Total Officers */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <span>Total Officers</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{totalOfficers}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active candidates</div>
              </div>

              {/* Students (Noticeable Highlight) */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 shadow-2xs">
                <div className="flex items-center justify-between text-amber-800 text-xs font-semibold uppercase tracking-wider">
                  <span>Students</span>
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-amber-800">{students}</div>
                <div className="text-[11px] text-amber-700/80 font-medium mt-0.5">
                  Noticeable / flexible hours
                </div>
              </div>

              {/* Full Timer (Neutral) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 shadow-2xs">
                <div className="flex items-center justify-between text-slate-700 text-xs font-semibold uppercase tracking-wider">
                  <span>Full Timer</span>
                  <Briefcase className="w-4 h-4 text-slate-500" />
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-800">{fullTimer}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Neutral standard shift</div>
              </div>

              {/* E-Visa (Positive Highlight) */}
              <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-2xs">
                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <span>E-Visa</span>
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-emerald-800">{eVisa}</div>
                <div className="text-[11px] text-emerald-700/80 font-medium mt-0.5">
                  Positive highlight / ready
                </div>
              </div>

              {/* Officers With Car */}
              <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-2xs">
                <div className="flex items-center justify-between text-blue-800 text-xs font-semibold uppercase tracking-wider">
                  <span>With Car</span>
                  <Car className="w-4 h-4 text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-blue-800">{officersWithCar}</div>
                <div className="text-[11px] text-blue-700/80 font-medium mt-0.5">
                  {totalOfficers ? `${Math.round((officersWithCar / totalOfficers) * 100)}%` : '0%'} mobile response
                </div>
              </div>

              {/* Dog Handlers */}
              <div className="bg-purple-50/70 p-4 rounded-xl border border-purple-200 shadow-2xs">
                <div className="flex items-center justify-between text-purple-800 text-xs font-semibold uppercase tracking-wider">
                  <span>Dog Handlers</span>
                  <Award className="w-4 h-4 text-purple-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-purple-800">{dogHandlers}</div>
                <div className="text-[11px] text-purple-700/80 font-medium mt-0.5">
                  {totalOfficers ? `${Math.round((dogHandlers / totalOfficers) * 100)}%` : '0%'} K9 units
                </div>
              </div>

              {/* Easy to Move */}
              <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 shadow-2xs">
                <div className="flex items-center justify-between text-teal-800 text-xs font-semibold uppercase tracking-wider">
                  <span>Easy to Move</span>
                  <Move className="w-4 h-4 text-teal-600" />
                </div>
                <div className="mt-2 text-2xl font-bold text-teal-800">{easyToMoveCount}</div>
                <div className="text-[11px] text-teal-700/80 font-medium mt-0.5">
                  {totalOfficers ? `${Math.round((easyToMoveCount / totalOfficers) * 100)}%` : '0%'} relocatable
                </div>
              </div>
            </div>

            {/* 3. TOOLBAR: FILTERS, SEARCH, ADD OFFICER */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter officers by name, city, phone, or status..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Student">Student (Amber)</option>
                    <option value="Full timer">Full timer (Neutral)</option>
                    <option value="E-Visa">E-Visa (Emerald)</option>
                    <option value="New Applicant">New Applicant</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Selected">Selected</option>
                    <option value="Active">Active</option>
                  </select>
                </div>

                {/* Car Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Car:</span>
                  <select
                    value={carFilter}
                    onChange={(e) => setCarFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">All</option>
                    <option value="Yes">Yes (Has Car)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Dog Handler Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Dog:</span>
                  <select
                    value={dogHandlerFilter}
                    onChange={(e) => setDogHandlerFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">All</option>
                    <option value="Yes">Yes (K9)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Easy to Move Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg">
                  <Move className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Move:</span>
                  <select
                    value={easyToMoveFilter}
                    onChange={(e) => setEasyToMoveFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">All</option>
                    <option value="Yes">Yes (Can Move)</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* City Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">City:</span>
                  <select
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Cities ({CITY_OPTIONS.length})</option>
                    {CITY_OPTIONS.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Officer Button */}
                <button
                  onClick={() => {
                    setEditingOfficer(null);
                    setIsAddModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs hover:shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Officer</span>
                </button>

                {/* Export to PDF Button */}
                <button
                  onClick={handleExportToPdf}
                  disabled={isExportingPdf}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Download A4 Landscape PDF Document"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                {/* Export to XLSX Button */}
                <button
                  onClick={handleExportToExcel}
                  disabled={isExportingExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Download Microsoft Excel Workbook (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>XLSX</span>
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={() => setIsWhatsAppModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
                  title="Send A4 PDF Report via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp</span>
                </button>

                {/* Reset Data Button */}
                <button
                  onClick={handleResetData}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Reset sample roster"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4. THE MAIN OFFICER DATA TABLE */}
            <div className="bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-left text-xs border-collapse">
                  {/* FROZEN HEADER ROW */}
                  <thead className="bg-[#0f172a] text-white sticky top-0 z-20 shadow-xs uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 text-center font-bold border-r border-slate-700 w-16">
                        Sr. No.
                      </th>
                      <th className="py-3 px-4 font-bold border-r border-slate-700 min-w-[200px]">
                        Officer Name
                      </th>
                      <th className="py-3 px-4 font-bold border-r border-slate-700 min-w-[140px]">
                        City
                      </th>
                      <th className="py-3 px-4 text-center font-bold border-r border-slate-700 min-w-[150px]">
                        Phone Number
                      </th>
                      <th className="py-3 px-4 text-center font-bold border-r border-slate-700 min-w-[160px]">
                        Status
                      </th>
                      <th className="py-3 px-3 text-center font-bold border-r border-slate-700 w-24">
                        Car
                      </th>
                      <th className="py-3 px-3 text-center font-bold border-r border-slate-700 w-28">
                        Dog Handler
                      </th>
                      <th className="py-3 px-3 text-center font-bold border-r border-slate-700 w-28">
                        Easy to Move
                      </th>
                      <th className="py-3 px-3 text-center font-bold w-24">Actions</th>
                    </tr>
                  </thead>

                  {/* DATA ROWS WITH ALTERNATING COLORS */}
                  <tbody className="divide-y divide-slate-200">
                    {filteredOfficers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                          <p className="font-semibold text-slate-700">No security officers match the selected filters.</p>
                          <p className="text-xs text-slate-400 mt-1">Try resetting the search terms or filters above.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOfficers.map((officer, index) => {
                        const isEven = index % 2 === 0;

                        // Conditional formatting per instructions:
                        // Full Timer -> neutral
                        // Student -> noticeable/highlighted (amber)
                        // E-Visa -> positive highlight (emerald)
                        let statusClasses = 'bg-slate-100 text-slate-700 border-slate-200';
                        if (officer.status === 'Student') {
                          statusClasses = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                        } else if (officer.status === 'E-Visa') {
                          statusClasses = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
                        } else if (officer.status === 'Full timer') {
                          statusClasses = 'bg-slate-200 text-slate-800 border-slate-300 font-semibold';
                        }

                        return (
                          <tr
                            key={officer.id}
                            className={`group transition-colors ${
                              isEven ? 'bg-white hover:bg-blue-50/40' : 'bg-slate-50/70 hover:bg-blue-50/40'
                            }`}
                          >
                            {/* 1. Sr. No. (Center Aligned, Auto-numbered) */}
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50/40 group-hover:bg-blue-50/60">
                              {officer.srNo}
                            </td>

                            {/* 2. Officer Name (Left Aligned) */}
                            <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-200">
                              <div className="flex flex-col">
                                <span className="text-sm">{officer.name}</span>
                                {officer.notes && (
                                  <span className="text-[11px] font-normal text-slate-400 line-clamp-1">
                                    {officer.notes}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 3. City (Dropdown Select, Left Aligned) */}
                            <td className="py-2.5 px-3 text-slate-800 border-r border-slate-200">
                              <select
                                value={officer.city}
                                onChange={(e) => handleInlineCityChange(officer.id, e.target.value)}
                                className="w-full py-1 px-2 text-xs font-medium rounded-md border border-slate-200 hover:border-slate-300 focus:border-blue-600 bg-white text-slate-800 outline-none cursor-pointer transition-colors"
                              >
                                {CITY_OPTIONS.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* 4. Phone Number (Formatted as Text, Center Aligned, preserves leading zero) */}
                            <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-800 border-r border-slate-200 tracking-wider">
                              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                                {officer.phoneNumber}
                              </span>
                            </td>

                            {/* 5. Status (Dropdown with Conditional Formatting, Center Aligned) */}
                            <td className="py-2.5 px-3 text-center border-r border-slate-200">
                              <div className="relative inline-block w-full max-w-[150px]">
                                <select
                                  value={officer.status}
                                  onChange={(e) => handleInlineStatusChange(officer.id, e.target.value)}
                                  className={`w-full py-1 px-2.5 text-xs rounded-md border text-center font-medium outline-none cursor-pointer transition-all ${statusClasses}`}
                                >
                                  <optgroup label="Work / Visa Status (Primary)">
                                    <option value="Student">Student</option>
                                    <option value="Full timer">Full timer</option>
                                    <option value="E-Visa">E-Visa</option>
                                  </optgroup>
                                  <optgroup label="Recruitment Stages">
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
                            </td>

                            {/* 6. Car (Dropdown: Yes / No, Center Aligned) */}
                            <td className="py-2.5 px-3 text-center border-r border-slate-200">
                              <select
                                value={officer.car}
                                onChange={(e) => handleInlineCarChange(officer.id, e.target.value as CarOption)}
                                className={`py-1 px-2 text-xs font-bold rounded-md border text-center outline-none cursor-pointer transition-colors ${
                                  officer.car === 'Yes'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>

                            {/* 7. Dog Handler (Dropdown: Yes / No, Center Aligned) */}
                            <td className="py-2.5 px-3 text-center border-r border-slate-200">
                              <select
                                value={officer.dogHandler || 'No'}
                                onChange={(e) => handleInlineDogHandlerChange(officer.id, e.target.value as DogHandlerOption)}
                                className={`py-1 px-2 text-xs font-bold rounded-md border text-center outline-none cursor-pointer transition-colors ${
                                  officer.dogHandler === 'Yes'
                                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>

                            {/* 8. Easy to Move (Dropdown: Yes / No, Center Aligned) */}
                            <td className="py-2.5 px-3 text-center border-r border-slate-200">
                              <select
                                value={officer.easyToMove || 'Yes'}
                                onChange={(e) => handleInlineEasyToMoveChange(officer.id, e.target.value as EasyToMoveOption)}
                                className={`py-1 px-2 text-xs font-bold rounded-md border text-center outline-none cursor-pointer transition-colors ${
                                  (officer.easyToMove || 'Yes') === 'Yes'
                                    ? 'bg-teal-100 text-teal-900 border-teal-300'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </td>

                            {/* Actions Column */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingOfficer(officer);
                                    setIsAddModalOpen(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit officer details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTargetId(officer.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Delete officer record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER STRIP (EXCEL STATUS BAR) */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span>
                    Showing <strong>{filteredOfficers.length}</strong> of <strong>{officers.length}</strong> officers
                  </span>
                  <span>•</span>
                  <span>
                    Auto-numbering active (<strong>Sr. No. 1 to {officers.length}</strong>)
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEditingOfficer(null);
                    setIsAddModalOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert New Row</span>
                </button>
              </div>
            </div>

            {/* QUICK FORMULA / METRIC NOTES */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Excel Formula Integration:</strong> Summary statistics are configured with native formulas in both the exported Excel file and Google Sheets.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('summary')}
                className="text-blue-700 hover:underline font-semibold text-xs shrink-0"
              >
                Open Full Summary Worksheet →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM EXCEL WORKSHEET TABS BAR */}
      <footer className="bg-slate-200 border-t border-slate-300 px-4 py-1.5 flex items-center justify-between text-xs text-slate-600 select-none">
        <div className="flex items-center gap-1">
          {/* Sheet 1: Officer Database */}
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
              activeTab === 'database'
                ? 'bg-white text-slate-900 border-emerald-600 shadow-xs'
                : 'bg-slate-300 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Officer Database</span>
          </button>

          {/* Sheet 2: Recruitment Summary */}
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1 text-xs font-semibold rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
              activeTab === 'summary'
                ? 'bg-white text-slate-900 border-blue-600 shadow-xs'
                : 'bg-slate-300 text-slate-700 border-transparent hover:bg-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Recruitment Summary</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
          <span>Orientation: Landscape</span>
          <span>Paper Size: A4</span>
          <span>Ready</span>
        </div>
      </footer>

      {/* Add / Edit Officer Modal */}
      <AddOfficerModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingOfficer(null);
        }}
        onSave={handleSaveOfficer}
        editOfficer={editingOfficer}
        nextSrNo={officers.length + 1}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        title="Remove Security Officer Record?"
        message="Are you sure you want to remove this security officer from the recruitment roster? Sr. No. values will automatically renumber sequentially."
        confirmLabel="Remove Officer"
        isDestructive
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) handleDeleteOfficer(deleteTargetId);
        }}
      />

      {/* Google Sheets Sync/Creation Confirmation Modal (MANDATORY per Workspace Skill) */}
      <ConfirmationModal
        isOpen={showSheetsConfirmModal}
        title={
          googleSheetResult
            ? 'Synchronize Recruitment Roster to Google Sheets?'
            : 'Create "NEW RECRUITMENT – SECURITY OFFICERS" in Google Sheets?'
        }
        message={
          googleSheetResult
            ? `This will update the existing spreadsheet in your Google Drive with current records (${officers.length} officers) and refresh formula calculations.`
            : `This will create a new, professionally formatted Google Spreadsheet titled "NEW RECRUITMENT – SECURITY OFFICERS" in your Google Drive with both 'Officer Database' and 'Recruitment Summary' worksheets.`
        }
        confirmLabel={googleSheetResult ? 'Synchronize Now' : 'Create Google Spreadsheet'}
        isLoading={isSavingToSheets}
        onCancel={() => setShowSheetsConfirmModal(false)}
        onConfirm={handleExecuteSaveToSheets}
      />

      {/* Print View Modal */}
      {isPrintOpen && (
        <PrintView officers={officers} onClose={() => setIsPrintOpen(false)} />
      )}

      {/* WhatsApp PDF Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        officers={officers}
      />
    </div>
  );
}
