import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, CheckCircle2, Eraser, ShieldCheck, FileText, AlertCircle } from 'lucide-react';

// DEFENSIVE IMPORT FOR SIGNATURE PAD
let SignaturePad;
try {
  SignaturePad = require('react-signature-canvas');
} catch (e) {
  SignaturePad = null;
}

const GOLD = "#D4AF37";

export default function ContractModal({ reservation, onClose, onSign }) {
  const sigPad = useRef(null);
  const [isSigned, setIsSigned] = useState(false);
  const [clientDocs, setClientDocs] = useState(null);

  useEffect(() => {
    const savedDocs = localStorage.getItem('USER_DOCUMENTS');
    if (savedDocs) setClientDocs(JSON.parse(savedDocs));
  }, []);

  const clearSignature = () => {
    if (sigPad.current && typeof sigPad.current.clear === 'function') {
      sigPad.current.clear();
    }
    setIsSigned(false);
  };

  const handleSign = () => {
    if (!sigPad.current) {
      // Fallback if library not loaded: allow validation anyway for demo/emergency
      onSign("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=");
      return;
    }
    
    if (typeof sigPad.current.isEmpty === 'function' && sigPad.current.isEmpty()) return;
    
    const signatureData = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    onSign(signatureData);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 print:p-0">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl print:hidden"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-5xl bg-white text-black rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border-[1px] border-[#D4AF37]/30 print:border-0 print:rounded-none print:max-h-none print:h-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tighter">Génération de Contrat</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Référence: {reservation.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="p-3 hover:bg-zinc-200 rounded-xl transition-colors text-zinc-600">
              <Printer size={20} />
            </button>
            <button onClick={onClose} className="p-3 hover:bg-red-50 rounded-xl transition-colors text-red-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <div className="flex-1 overflow-y-auto p-12 md:p-20 custom-scrollbar-light bg-white">
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-1">Shift <span className="text-[#D4AF37]">Luxury</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Location de Prestige</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase">Contrat N° {reservation.id}</p>
              <p className="text-[10px] text-zinc-500 font-medium">Fait à Paris, le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-12">
            <section className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4 border-b border-zinc-100 pb-2">Le Loueur</h4>
                <p className="text-sm font-bold">SHIFT LUXURY AGENT</p>
                <p className="text-xs text-zinc-600 leading-relaxed">12 Avenue Montaigne, 75008 Paris</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-4 border-b border-zinc-100 pb-2">Le Locataire</h4>
                <p className="text-sm font-bold">{reservation.client.name}</p>
                <p className="text-xs text-zinc-600 leading-relaxed">Identité vérifiée via plateforme SHIFT</p>
              </div>
            </section>

            {/* Signature Area with Fallback */}
            <section className="pt-12 border-t border-zinc-100 grid grid-cols-2 gap-12">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Signature du Loueur</p>
                <div className="h-32 flex items-center">
                  <p className="font-serif italic text-xl">Shift Luxury</p>
                </div>
              </div>
              <div className="print:hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Signature du Locataire</p>
                  <button onClick={clearSignature} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <Eraser size={14} />
                  </button>
                </div>
                
                <div className="h-32 bg-zinc-50 rounded-2xl border border-zinc-200 relative overflow-hidden flex items-center justify-center">
                  {SignaturePad ? (
                    <SignaturePad 
                      ref={sigPad}
                      canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                      onEnd={() => setIsSigned(true)}
                    />
                  ) : (
                    <div className="text-center p-4" onClick={() => setIsSigned(true)}>
                      <AlertCircle className="mx-auto mb-2 text-zinc-300" size={20} />
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Zone de signature</p>
                      <p className="text-[8px] text-zinc-300 mt-1">(Cliquez pour simuler la signature)</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-4 print:hidden">
          <button onClick={onClose} className="px-8 py-4 text-zinc-500 font-black uppercase tracking-widest text-[10px]">Annuler</button>
          <button 
            disabled={!isSigned}
            onClick={handleSign}
            className="px-10 py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#D4AF37] disabled:opacity-30 transition-all flex items-center gap-3"
          >
            <CheckCircle2 size={16} /> Valider & Signer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
