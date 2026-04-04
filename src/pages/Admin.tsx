import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trash2, ExternalLink, Hash, LayoutDashboard, Users, 
  Star, CheckCircle2, XCircle, Image as ImageIcon, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { user, isAdmin: isAuthAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');

  const isSessionAdmin = sessionStorage.getItem('admin_session_active') === 'true';
  const isAdmin = isAuthAdmin || isSessionAdmin || user?.email === 'saadatali1403@gmail.com';

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin-login');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setAds(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ uid: d.id, ...d.data() })));
    });
    return () => { unsubAds(); unsubUsers(); };
  }, [isAdmin]);

  const handleUpdateAdStatus = async (adId: string, status: 'active' | 'declined') => {
    try {
      await updateDoc(doc(db, 'ads', adId), { status });
      toast.success(`Ad marked as ${status}`);
    } catch (error) { toast.error('Failed to update status'); }
  };

  const handleToggleFeatured = async (adId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'ads', adId), { isFeatured: !currentStatus });
      toast.success(!currentStatus ? 'Ad Featured (Gold)' : 'Featured removed');
    } catch (error) { toast.error('Feature toggle failed'); }
  };

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('PERMANENT DELETE?')) return;
    try {
      await deleteDoc(doc(db, 'ads', adId));
      toast.success('Ad deleted');
    } catch (error) { toast.error('Delete failed'); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-green-700 uppercase tracking-widest p-6 text-center">Accessing Secure Layer...</div>;
  if (!isAdmin) return <div className="p-10 text-center font-black text-red-600 uppercase">Unauthorized Access.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight text-center md:text-left">ADMIN PANEL</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1 text-center md:text-left">Mandi Operations</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border shadow-sm w-full md:w-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('ads')} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all whitespace-nowrap ${activeTab === 'ads' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              <LayoutDashboard size={14} /> Listings ({ads.length})
            </button>
            <button 
              onClick={() => setActiveTab('users')} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              <Users size={14} /> Sellers ({users.length})
            </button>
          </div>
        </div>

        {/* Mobile-Friendly Grid (Visible only on small screens) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {activeTab === 'ads' ? ads.map(ad => (
            <div key={ad.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <img src={ad.images?.[0]} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt="" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-sm">{ad.title}</h3>
                  <p className="text-green-600 font-black text-xs">Rs {Number(ad.price).toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-mono">ID: {ad.id.substring(0, 8)}...</p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded border uppercase ${ad.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {ad.status || 'Pending'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleUpdateAdStatus(ad.id, 'active')} className="p-2 text-green-600"><CheckCircle2 size={18} /></button>
                  <button onClick={() => handleToggleFeatured(ad.id, ad.isFeatured)} className={`p-2 rounded-md ${ad.isFeatured ? 'bg-yellow-400 text-white' : 'text-gray-400 border'}`}><Star size={18} fill={ad.isFeatured ? 'white' : 'none'} /></button>
                  <button onClick={() => handleDeleteAd(ad.id)} className="p-2 text-red-600"><Trash2 size={18} /></button>
                  <Link to={`/ad/${ad.id}`} className="p-2 text-blue-600"><ExternalLink size={18} /></Link>
                </div>
              </div>
            </div>
          )) : users.map(u => (
            <div key={u.uid} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                  {u.displayName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{u.displayName || 'Guest'}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{u.email}</p>
                </div>
              </div>
              <button onClick={() => {/* Delete User Logic */}} className="text-red-500 p-2"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>

        {/* Desktop View (Visible only on md screens and up) */}
        <div className="hidden md:block bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                  <th className="p-5">Listing/User</th>
                  <th className="p-5">Price/Email</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTab === 'ads' ? ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <img src={ad.images?.[0]} className="w-12 h-10 rounded bg-gray-100 object-cover" alt="" />
                        <div className="text-sm font-bold truncate max-w-[150px]">{ad.title}</div>
                      </div>
                    </td>
                    <td className="p-5 text-xs font-black text-green-600">Rs {Number(ad.price).toLocaleString()}</td>
                    <td className="p-5">
                      <span className="text-[9px] font-black px-2 py-0.5 rounded border uppercase bg-gray-50">{ad.status}</span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-1">
                       <button onClick={() => handleUpdateAdStatus(ad.id, 'active')} className="p-2 text-green-600"><CheckCircle2 size={18} /></button>
                       <button onClick={() => handleDeleteAd(ad.id)} className="p-2 text-red-600"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )) : users.map(u => (
                  <tr key={u.uid}>
                    <td className="p-5 text-sm font-bold">{u.displayName}</td>
                    <td className="p-5 text-sm text-gray-500">{u.email}</td>
                    <td className="p-5">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-full ${u.isVerified ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                         {u.isVerified ? 'VERIFIED' : 'USER'}
                       </span>
                    </td>
                    <td className="p-5 text-right">
                       <button className="text-red-400"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}