import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  FileText, 
  MessageSquare,
  Sparkles,
  Phone
} from 'lucide-react';
import { SecurityOfficer } from '../types';
import { 
  generateSecurityOfficersPdfFile, 
  formatRosterWhatsAppMessage 
} from '../services/pdfExport';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  officers: SecurityOfficer[];
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  officers
}) => {
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const messageText = formatRosterWhatsAppMessage(officers);

  // Clean phone number (strip spaces, dashes, brackets)
  const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^00/, '+');

  // Handle Native Share (WhatsApp with PDF attached)
  const handleNativeSharePdf = async () => {
    try {
      setIsSharing(true);
      setStatusNote('Generating A4 PDF file...');
      const { file, filename } = await generateSecurityOfficersPdfFile(officers);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        setStatusNote('Opening WhatsApp share sheet...');
        await navigator.share({
          files: [file],
          title: 'Security Officers Recruitment Roster',
          text: messageText
        });
        setStatusNote('Shared successfully!');
      } else {
        // Fallback for browsers that don't support file sharing via Web Share API
        fallbackDownloadAndOpenWhatsApp(file, filename);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('Native share failed or dismissed, using WhatsApp Web link:', err);
        // Fallback
        const { file, filename } = await generateSecurityOfficersPdfFile(officers);
        fallbackDownloadAndOpenWhatsApp(file, filename);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Fallback: Download PDF file & Open WhatsApp Chat with prefilled text
  const fallbackDownloadAndOpenWhatsApp = (file: File, filename: string) => {
    // 1. Trigger PDF download
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 2. Open WhatsApp Web / Mobile chat
    const encodedText = encodeURIComponent(messageText);
    const targetPhone = cleanPhone.replace(/^\+/, '');
    const waUrl = targetPhone 
      ? `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setStatusNote('PDF downloaded to your device! WhatsApp opened — attach the downloaded PDF to your chat.');
  };

  // Direct WhatsApp Open
  const handleOpenWhatsAppDirect = async () => {
    try {
      setIsSharing(true);
      setStatusNote('Downloading PDF for WhatsApp...');
      const { file, filename } = await generateSecurityOfficersPdfFile(officers);
      fallbackDownloadAndOpenWhatsApp(file, filename);
    } catch (e: any) {
      console.error('Error:', e);
      setStatusNote('Failed to generate PDF: ' + (e.message || 'unknown error'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  const supportsFileShare = typeof navigator !== 'undefined' && 
    typeof navigator.canShare === 'function' && 
    navigator.canShare({ files: [new File([], 'test.pdf', { type: 'application/pdf' })] });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header (WhatsApp Brand Color #25D366 / #128C7E) */}
        <div className="bg-[#128C7E] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Send Roster via WhatsApp</h3>
              <p className="text-xs text-emerald-100">
                A4 Landscape PDF Report • {officers.length} Security Officers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Optional Phone Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Recipient WhatsApp Number (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +44 7436 232695 or 07436232695"
                className="w-full pl-3.5 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400 font-mono text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to pick any contact or group directly from WhatsApp.
            </p>
          </div>

          {/* Formatted Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                WhatsApp Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 whitespace-pre-line max-h-36 overflow-y-auto">
              {messageText}
            </div>
          </div>

          {/* Status / Alert box */}
          {statusNote && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusNote}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {/* Primary Button: Direct Native Share with PDF File */}
            <button
              onClick={handleNativeSharePdf}
              disabled={isSharing}
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSharing 
                  ? 'Preparing WhatsApp PDF...' 
                  : supportsFileShare 
                  ? 'Send PDF Directly via WhatsApp' 
                  : 'Download PDF & Open WhatsApp'}
              </span>
            </button>

            {/* Alternative Button: Open in WhatsApp Web / App */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWhatsAppDirect}
                disabled={isSharing}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Save PDF & Chat</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Generates high-definition A4 Landscape vector PDF with all {officers.length} security officer records.
          </div>
        </div>
      </div>
    </div>
  );
};
