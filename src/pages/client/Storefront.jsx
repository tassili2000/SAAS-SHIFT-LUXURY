import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, User, LogOut, 
  Search, Bell, Zap, Users, ChevronRight, PhoneCall,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { calculateDynamicPrice } from '../../utils/pricingEngine';
import ThemeToggle from '../../components/ThemeToggle';
import VehicleDetail from './VehicleDetail';
import BookingPage from './BookingPage';
import ClientProfile from './ClientProfile';

export default function Storefront({ onLogout }) {
  const { vehicles } = useStore();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('fleet');
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (data) setStoreSettings(data);
    } catch (err) {
      console.error("Erreur settings:", err);
    }
  };

  const handleVehicleSelect = (id) => {
    setSelectedVehicleId(id);
    setActiveTab('detail');
  };

  const handleStartBooking = (vehicle, start, end) => {
    setBookingData({ vehicle, start, end });
    setActiveTab('booking');
  };

  const renderContent = () => {
    if (activeTab === 'detail' && selectedVehicleId) {
      return (
        <VehicleDetail 
          vehicleId={selectedVehicleId} 
          onBack={() => setActiveTab('fleet')} 
          onBook={handleStartBooking}
          storeSettings={storeSettings}
        />
      );
    }

    if (activeTab === 'booking' && bookingData) {
      return (
        <BookingPage 
          vehicle={bookingData.vehicle} 
          initialDates={{ start: bookingData.start, end: bookingData.end }}
          onBack={() => setActiveTab('detail')}
          storeSettings={storeSettings}
        />
      );
    }

    if (activeTab === 'profile') {
      return <ClientProfile />;
    }

    return (
      <div className="p-8 max-w-7xl mx-auto space-y-12">
        <header className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-6xl font-black uppercase tracking-tighter leading-none theme-text">
                {storeSettings?.shop_name?.split(' ')[0] || 'Elite'} <br /> 
                <span className="text-[#D4AF37]">{storeSettings?.shop_name?.split(' ').slice(1).join(' ') || 'Showroom'}</span>
              </h1>
            </div>
            <div className="flex gap-3">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <button className="w-12 h-12 theme-card rounded-full flex items-center justify-center theme-text-muted hover:text-[#D4AF37] transition-colors">
                <Bell size={20} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Rechercher un modèle, une marque..."
              className="w-full theme-card rounded-[2rem] py-6 pl-16 pr-8 text-sm font-bold outline-none focus:border-[#D4AF37]/30 transition-all theme-text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles
            .filter(v => v.model.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((vehicle) => {
              const pricing = calculateDynamicPrice(vehicle.price, storeSettings);
              
              return (
                <motion.div 
                  key={vehicle.id}
                  whileHover={{ y: -10 }}
                  onClick={() => handleVehicleSelect(vehicle.id)}
                  className="group cursor-pointer theme-card rounded-[2.5rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={vehicle.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={vehicle.model} />
                    
                    <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                      <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                        <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                          {pricing.finalPrice}€ / jour
                        </span>
                      </div>
                      {pricing.isSurge && (
                        <motion.div 
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37] text-black rounded-full shadow-lg"
                        >
                          <TrendingUp size={10} />
                          <span className="text-[8px] font-black uppercase tracking-tighter">Tarif Weekend</span>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter theme-text">{vehicle.model}</h3>
                        <p className="text-[10px] font-bold theme-text-muted uppercase tracking-widest">Prestige Edition</p>
                      </div>
                      <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-black transition-all text-[#D4AF37]">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4 border-t theme-border">
                      <div className="flex items-center gap-2 text-[10px] font-bold theme-text-muted uppercase">
                        <Zap size={14} className="text-[#D4AF37]" /> {vehicle.hp} CV
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold theme-text-muted uppercase">
                        <Users size={14} className="text-[#D4AF37]" /> {vehicle.seats} Places
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme-bg pb-32 transition-colors duration-300">
      {renderContent()}

      {storeSettings?.concierge_phone && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md"
        >
          <a 
            href={`tel:${storeSettings.concierge_phone}`}
            className="flex items-center justify-between bg-black border border-[#D4AF37]/30 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group hover:border-[#D4AF37] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#D4AF37] rounded-xl flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                <PhoneCall size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Service Conciergerie 24/7</p>
                <p className="text-white font-bold text-sm">{storeSettings.concierge_phone}</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-lg text-[8px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-[#D4AF37]">
              Appeler
            </div>
          </a>
        </motion.div>
      )}

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 theme-nav px-8 py-4 rounded-[2.5rem] flex items-center gap-12 shadow-2xl z-50">
        {[
          { id: 'fleet', icon: Car, label: 'Showroom' },
          { id: 'profile', icon: User, label: 'Profil' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedVehicleId(null);
            }}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-[#D4AF37]' : 'theme-text-muted hover:text-[#D4AF37]'}`}
          >
            <item.icon size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button onClick={onLogout} className="flex flex-col items-center gap-1 text-zinc-500 hover:text-red-500 transition-all">
          <LogOut size={20} />
          <span className="text-[8px] font-black uppercase tracking-widest">Quitter</span>
        </button>
      </nav>
    </div>
  );
}
