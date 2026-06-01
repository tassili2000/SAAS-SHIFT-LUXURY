import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Car, User, Calendar, LogOut, Loader2, 
  MapPin, Navigation, Globe, Save, CheckCircle2, AlertCircle,
  ChevronRight, FileText, Clock, ShieldCheck, CreditCard,
  Download, ExternalLink, Smartphone
} from 'lucide-react';

// Leaflet imports
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet Icon
const goldIcon = new L.DivIcon({
  html: `<div style="background-color: #D4AF37; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(212,175,55,0.5);"></div>`,
  className: 'custom-leaflet-icon',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

export default function ClientAccount() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', address: '' });
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // GHOST DATA (Données de secours élégantes)
  const ghostBookings = [
    { id: 'G1', vehicle_name: 'Ferrari F8 Tributo', status: 'Terminé', start_date: '2023-12-15', total_price: 2400, image: 'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80' },
    { id: 'G2', vehicle_name: 'Lamborghini Huracán', status: 'En attente', start_date: '2024-05-20', total_price: 1850, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80' }
  ];

  const ghostDocs = [
    { name: 'Permis_Recto.pdf', size: '1.2 MB', date: '12/01/2024' },
    { name: 'Justificatif_Domicile.pdf', size: '2.4 MB', date: '15/01/2024' }
  ];

  const agencies = [
    { id: 1, name: "Shift Luxury Paris", coords: [48.8704, 2.3044], address: "8 Avenue George V, 75008 Paris" },
    { id: 2, name: "Shift Luxury Monaco", coords: [43.7384, 7.4246], address: "Place du Casino, 98000 Monaco" }
  ];

  useEffect(() => {
    initializeDashboard();
  }, []);

  async function initializeDashboard() {
    try {
      setLoading(true);
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        window.location.href = '/login';
        return;
      }

      setUser(authUser);

      // Parallel fetching
      const [profileRes, bookingsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authUser.id).single(),
        supabase.from('bookings').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (bookingsRes.data && bookingsRes.data.length > 0) setBookings(bookingsRes.data);
      
      // Fetch documents from storage
      const { data: files } = await supabase.storage.from('client-documents').list(authUser.id);
      if (files) setDocuments(files);

    } catch (err) {
      console.error("Dashboard Init Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleReserveClick = () => {
    window.location.href = '/showroom';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-t-2 border-[#D4AF37] rounded-full animate-spin"></div>
        <span className="text-[#D4AF37] font-black uppercase tracking-[0.3em] text-[10px]">Initialisation de votre espace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* NAVIGATION HEADER */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-2xl px-8 h-24 flex items-center justify-between sticky top-0 z-[1000]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Car className="text-black" size={20} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter">SHIFT</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
            {[
              { id: 'bookings', icon: Calendar, label: 'Réservations' },
              { id: 'documents', icon: FileText, label: 'Documents' },
              { id: 'profile', icon: User, label: 'Profil' },
              { id: 'agencies', icon: Navigation, label: 'Agences' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <button onClick={handleLogout} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">Déconnexion</span>
          <LogOut size={18} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-16">
        
        {/* 1. TAB: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12">
              <h2 className="text-6xl font-black italic uppercase leading-none mb-4">Vos <span className="text-[#D4AF37]">Expériences</span></h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Historique et réservations en cours</p>
            </div>

            {bookings.length === 0 && ghostBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 px-8">
                <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-8 border-2 border-[#D4AF37]/30">
                  <Calendar size={48} className="text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-3 text-center">Aucune Réservation</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] text-center mb-12 max-w-md leading-relaxed">
                  Vous n'avez pas encore réservé de véhicule. Explorez notre collection exclusive et réservez votre prochaine expérience de luxe.
                </p>
                <button 
                  onClick={handleReserveClick}
                  className="px-10 py-5 bg-[#D4AF37] text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:scale-105 transition-transform shadow-lg shadow-[#D4AF37]/20 flex items-center gap-3 group"
                >
                  <Car size={18} className="group-hover:rotate-12 transition-transform" />
                  Réserver un Véhicule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(bookings.length > 0 ? bookings : ghostBookings).map((booking, idx) => (
                  <div key={booking.id} className="group bg-zinc-900/30 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row hover:border-[#D4AF37]/30 transition-all duration-500">
                    <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden">
                      <img src={booking.image || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">{booking.status}</span>
                      </div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black uppercase italic mb-2">{booking.vehicle_name}</h3>
                          <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(booking.start_date).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-emerald-500" /> Assurance Premium</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-zinc-500 text-[9px] font-black uppercase mb-1">Total TTC</p>
                          <p className="text-2xl font-black text-[#D4AF37]">{booking.total_price}€</p>
                        </div>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <button className="bg-white text-black px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37] transition-colors">Détails Réservation</button>
                        <button className="border border-white/10 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors">Facture PDF</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. TAB: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12">
              <h2 className="text-6xl font-black italic uppercase leading-none mb-4">Coffre <span className="text-[#D4AF37]">Fort</span></h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Vos documents officiels sécurisés</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(documents.length > 0 ? documents : ghostDocs).map((doc, idx) => (
                <div key={idx} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2rem] hover:border-[#D4AF37]/30 transition-all group">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                    <FileText size={24} />
                  </div>
                  <h3 className="font-black uppercase text-sm mb-1 truncate">{doc.name}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">{doc.size || 'N/A'} • Ajouté le {doc.date || 'Récemment'}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                      <Download size={12} /> Télécharger
                    </button>
                    <button className="w-12 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center transition-colors">
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Upload Card */}
              <div className="border-2 border-dashed border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-[#D4AF37]/50 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe size={20} className="text-zinc-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ajouter un document</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase mt-2">PDF, JPG (Max 5MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. TAB: PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12">
              <h2 className="text-6xl font-black italic uppercase leading-none mb-4">Mon <span className="text-[#D4AF37]">Profil</span></h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Informations de compte</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Prénom</label>
                  <input type="text" value={profile.first_name} className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-5 focus:border-[#D4AF37] outline-none transition-all" readOnly />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Nom</label>
                  <input type="text" value={profile.last_name} className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-5 focus:border-[#D4AF37] outline-none transition-all" readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-4">Email</label>
                <input type="text" value={user?.email} className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-5 text-zinc-500" disabled />
              </div>
              <button className="w-full bg-[#D4AF37] text-black font-black uppercase py-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all group">
                <Save size={20} className="group-hover:scale-110 transition-transform" />
                Mettre à jour mes informations
              </button>
            </div>
          </div>
        )}

        {/* 4. TAB: AGENCIES */}
        {activeTab === 'agencies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in duration-700">
            <div className="lg:col-span-4 space-y-8">
              <div>
                <h2 className="text-6xl font-black italic uppercase leading-none mb-4">Nos <span className="text-[#D4AF37]">Points</span></h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Présence internationale</p>
              </div>
              <div className="space-y-4">
                {agencies.map((agency) => (
                  <div key={agency.id} className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2rem] hover:border-[#D4AF37]/30 transition-all cursor-pointer group">
                    <h3 className="font-black uppercase text-[#D4AF37] mb-2">{agency.name}</h3>
                    <p className="text-[10px] font-bold uppercase text-zinc-500 leading-relaxed">{agency.address}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8 h-[600px] rounded-[3rem] overflow-hidden border border-white/5 relative">
              <MapContainer center={[46.2276, 2.2137]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <ResizeMap />
                {agencies.map((agency) => (
                  <Marker key={agency.id} position={agency.coords} icon={goldIcon}>
                    <Popup className="custom-popup">{agency.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 rounded-[3rem]"></div>
            </div>
          </div>
        )}

      </main>

      <style>{`
        .leaflet-container { background: #050505 !important; }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #111 !important;
          color: #D4AF37 !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          border-radius: 12px !important;
          padding: 5px !important;
        }
        .custom-popup .leaflet-popup-tip { background: #111 !important; }
      `}</style>
    </div>
  );
}
