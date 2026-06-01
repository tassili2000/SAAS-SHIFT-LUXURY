import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Pencil, Trash2, X, Save, Image as ImageIcon, 
  Zap, Gauge, DollarSign, AlertTriangle, Check, FileText, Layers
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const GOLD = "#D4AF37";

export default function FleetView() {
  const { vehicles: initialVehicles } = useStore();
  const [vehicles, setVehicles] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [formData, setFormData] = useState({});

  // Charger la flotte depuis le localStorage ou le store initial
  useEffect(() => {
    const savedFleet = localStorage.getItem('SHIFT_FLEET_DATA');
    if (savedFleet) {
      setVehicles(JSON.parse(savedFleet));
    } else {
      setVehicles(initialVehicles);
      localStorage.setItem('SHIFT_FLEET_DATA', JSON.stringify(initialVehicles));
    }
  }, [initialVehicles]);

  const syncFleet = (newFleet) => {
    setVehicles(newFleet);
    localStorage.setItem('SHIFT_FLEET_DATA', JSON.stringify(newFleet));
    // Déclencher l'événement pour la synchronisation cross-tab (Client/Marchand)
    window.dispatchEvent(new Event('storage'));
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({ 
      ...vehicle,
      description: vehicle.description || '',
      doors: vehicle.doors || 5,
      deposit: vehicle.deposit || 2000
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    const newFleet = vehicles.filter(v => v.id !== selectedVehicle.id);
    syncFleet(newFleet);
    setIsDeleteModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newFleet = vehicles.map(v => v.id === formData.id ? formData : v);
    syncFleet(newFleet);
    setIsEditModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleAddNew = () => {
    const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
    const newVehicle = {
      id: newId,
      agencyId: 'PAR-001',
      model: "Nouveau Modèle",
      price: 500,
      fuel: "Essence",
      seats: 2,
      hp: 400,
      speed: 300,
      image: "https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      description: '',
      doors: 5,
      deposit: 2000
    };
    handleEdit(newVehicle);
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Ma <span className="text-[#D4AF37]">Flotte</span></h2>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gestion des actifs et tarification</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="w-full md:w-auto px-8 py-4 bg-white text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-2xl hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-3 group"
        >
          <Plus size={16} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Ajouter un véhicule
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {vehicles.map(v => (
          <motion.div 
            layoutId={`vehicle-${v.id}`}
            key={v.id} 
            className="group bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden p-8 hover:border-[#D4AF37]/30 transition-all relative"
          >
            {/* Actions Floatantes */}
            <div className="absolute top-6 right-6 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(v)}
                className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={() => handleDeleteClick(v)}
                className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:text-red-500 hover:border-red-500/50 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="relative h-48 mb-8 overflow-hidden rounded-3xl">
              <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={v.model} />
              <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">{v.agencyId}</span>
              </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{v.model}</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{v.fuel} • {v.seats} Places</p>
              </div>
              <div className="text-right">
                <div className="text-[#D4AF37] font-black text-2xl">{v.price}€</div>
                <div className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Par Jour</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-zinc-600" />
                <span className="text-[10px] font-bold text-zinc-400">{v.hp} CV</span>
              </div>
              <div className="flex items-center gap-2">
                <Gauge size={14} className="text-zinc-600" />
                <span className="text-[10px] font-bold text-zinc-400">{v.speed} KM/H</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal de Modification */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 sticky top-0 z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Édition <span className="text-[#D4AF37]">Véhicule</span></h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:text-[#D4AF37] transition-colors"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Modèle</label>
                    <input 
                      type="text" 
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Prix Journalier (€)</label>
                    <input 
                      type="number" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Puissance (CV)</label>
                    <input 
                      type="number" 
                      value={formData.hp}
                      onChange={(e) => setFormData({...formData, hp: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Vitesse Max (km/h)</label>
                    <input 
                      type="number" 
                      value={formData.speed}
                      onChange={(e) => setFormData({...formData, speed: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Nombre de Portes</label>
                    <input 
                      type="number" 
                      min="2"
                      max="6"
                      value={formData.doors}
                      onChange={(e) => setFormData({...formData, doors: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Caution (€)</label>
                    <input 
                      type="number" 
                      value={formData.deposit}
                      onChange={(e) => setFormData({...formData, deposit: parseInt(e.target.value)})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Décrivez les caractéristiques et équipements du véhicule..."
                    rows="4"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:border-[#D4AF37] outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">URL de l'image</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 text-xs font-bold focus:border-[#D4AF37] outline-none transition-all" 
                    />
                    <ImageIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-[#D4AF37] text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Enregistrer les modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmation de Suppression */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[250] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-red-500/20 rounded-[2.5rem] w-full max-w-md p-10 text-center shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Retirer du catalogue ?</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-10">
                Êtes-vous sûr de vouloir retirer la <span className="text-white">{selectedVehicle?.model}</span> de votre flotte active ? Cette action est irréversible.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all"
                >
                  Confirmer la suppression
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Garder le véhicule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
