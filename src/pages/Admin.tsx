import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trash2, Hash, LayoutDashboard, Users, Star, 
  CheckCircle2, XCircle, ExternalLink, ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

// 1. Updated Admin List (Case Insensitive)
const ADMIN_EMAILS = [
  'saadatali1403@gmail.com',
  'hellisop0@gmail.com',
  'anotheradmin@gmail.com'
].map(email => email.toLowerCase().trim());

export default function Admin() {
  const { user, isAdmin: isAuthAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');

  const userEmail = user?.email?.toLowerCase().trim();
  const isAdmin = isAuthAdmin || (userEmail && ADMIN_EMAILS.includes(userEmail));

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/admin-login');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubAds = onSnapshot(collection(db, 'ads'), (s) => setAds(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() }))));
    return () => { unsubAds(); unsubUsers(); };
  }, [isAdmin]);

  // --- RESTORED ACTIONS ---
  const handleUpdateAdStatus = async (adId: string, status: 'active' | 'declined') => {
    try {
      await updateDoc(doc(db, 'ads', adId), { status });
      toast.success(`Ad marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleToggleFeatured = async (adId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { isFeatured: !currentStatus });
      toast.success(!currentStatus ? 'Ad Featured (Gold)' : 'Featured removed');
    } catch { toast.error('Feature toggle failed'); }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('PERMANENT DELETE? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'ads', adId));
      toast.success('Ad wiped from database');
    } catch { toast.error('Delete failed'); }
  };

  if (authLoading) return <div className="p-10 text-center font-bold text-green-700 uppercase tracking-widest">Accessing CityCare Secure Layer...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="text-center md:text-left w-full md:w-auto">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight uppercase">Admin Panel</h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Mandi Operations & Verification</p>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto">
            <button onClick={() => setActiveTab('ads')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'ads' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <LayoutDashboard size={14} /> Listings ({ads.length})
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${activeTab === 'users' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}>
              <Users size={14} /> Sellers ({users.length})
            </button>
          </div>
        </div>

        {/* MOBILE LIST (Visible on small/medium screens) */}
        <div className="block lg:hidden space-y-4">
          {activeTab === 'ads' ? ads.map(ad => (
            <div key={ad.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex gap-4 items-start mb-4">
                <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border relative">
                  {ad.images?.[0] ? <img src={ad.images[0]} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-gray-300"><ImageIcon size={16} /></div>}
                  {ad.isFeatured && <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-br-md"></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{ad.title}</h3>
                  <p className="text-green-600 font-black text-xs">Rs {Number(ad.price).toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Hash size={10} className="text-blue-500" />
                    <span className="text-[9px] font-mono font-black text-blue-600 uppercase truncate">{ad.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 border-t justify-between items-center">
                <div className="flex gap-1.5">
                  <button onClick={() => handleUpdateAdStatus(ad.id, 'active')} className="p-2.5 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={18} /></button>
                  <button onClick={() => handleUpdateAdStatus(ad.id, 'declined')} className="p-2.5 bg-orange-50 text-orange-600 rounded-xl"><XCircle size={18} /></button>
                  <button onClick={() => handleToggleFeatured(ad.id, ad.isFeatured)} className={`p-2.5 rounded-xl ${ad.isFeatured ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-400'}`}><Star size={18} fill={ad.isFeatured ? 'white' : 'none'} /></button>
                </div>
                <div className="flex gap-1.5">
                  <Link to={`/ad/${ad.id}`} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><ExternalLink size={18} /></Link>
                  <button onClick={() => handleDeleteAd(ad.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          )) : users.map(u => (
             <div key={u.uid} className="bg-white p-4 rounded-xl border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 uppercase">{u.displayName?.charAt(0)}</div>
                  <div><div className="text-sm font-bold">{u.displayName || 'Guest'}</div><div className="text-[10px] text-gray-400">{u.email}</div></div>
                </div>
                <button onClick={() => handleDeleteAd(u.uid)} className="text-red-400 p-2"><Trash2 size={18} /></button>
             </div>
          ))}
        </div>

        {/* DESKTOP VIEW (Visible only on Large screens) */}
        <div className="hidden lg:block bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="p-5">{activeTab === 'ads' ? 'Listing Thumbnail & ID' : 'User Profile'}</th>
                <th className="p-5">{activeTab === 'ads' ? 'Seller & Price' : 'Email Address'}</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activeTab === 'ads' ? ads.map(ad => (
                <tr key={ad.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden border relative">
                        {ad.images?.[0] ? <img src={ad.images[0]} className="w-full h-full object-cover" /> : <div className="flex justify-center h-full text-gray-300"><ImageIcon size={16} /></div>}
                        {ad.isFeatured && <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-400 rounded-br-md"></div>}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{ad.title}</div>
                        <div className="flex items-center gap-1"><Hash size={10} className="text-blue-500" /><span className="text-[10px] font-mono font-black text-blue-600 uppercase">{ad.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-xs font-bold text-gray-800">{ad.sellerName || 'Anonymous'}</div>
                    <div className="text-[10px] text-green-600 font-black mt-0.5">Rs {Number(ad.price).toLocaleString()}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${ad.status === 'active' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>{ad.status || 'Pending'}</span>
                      {ad.isFeatured && <span className="flex items-center gap-1 bg-yellow-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-sm"><Star size={8} fill="currentColor" /> GOLD</span>}
                    </div>
                  </td>
                  <td className="p-5 text-right flex justify-end gap-1">
                    <button onClick={() => handleUpdateAdStatus(ad.id, 'active')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle2 size={20} /></button>
                    <button onClick={() => handleUpdateAdStatus(ad.id, 'declined')} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"><XCircle size={20} /></button>
                    <button onClick={() => handleToggleFeatured(ad.id, ad.isFeatured)} className={`p-2 rounded-lg ${ad.isFeatured ? 'bg-yellow-400 text-white shadow-md shadow-yellow-100' : 'bg-gray-100 text-gray-400'}`}><Star size={20} fill={ad.isFeatured ? 'white' : 'none'} /></button>
                    <Link to={`/ad/${ad.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ExternalLink size={20} /></Link>
                    <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 size={20} /></button>
                  </td>
                </tr>
              )) : users.map(u => (
                <tr key={u.uid}>
                  <td className="p-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-black text-blue-600 border border-blue-200 overflow-hidden">{u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : u.displayName?.charAt(0) || 'U'}</div>
                    <div><div className="font-bold text-gray-900 text-sm">{u.displayName || 'Guest User'}</div><div className="text-[9px] text-gray-400 font-mono">ID: {u.uid}</div></div>
                  </td>
                  <td className="p-5 text-sm text-gray-500 font-medium">{u.email}</td>
                  <td className="p-5"><span className={`text-[10px] font-black px-3 py-1 rounded-full ${u.isVerified ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{u.isVerified ? 'VERIFIED SELLER' : 'STANDARD'}</span></td>
                  <td className="p-5 text-right"><button onClick={() => handleDeleteAd(u.uid)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}