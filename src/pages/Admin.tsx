import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, ShieldCheck, ShieldAlert, ExternalLink, User as UserIcon, Hash } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'users'>('ads');

  useEffect(() => {
    if (!isAdmin) return;

    // Listen to Ads with Unique ID mapping
    const unsubAds = onSnapshot(collection(db, 'ads'), (snapshot) => {
      setAds(snapshot.docs.map(d => ({ 
        id: d.id, // Explicitly capturing the Firestore Doc ID
        ...d.data() 
      })));
    });

    // Listen to Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ 
        uid: d.id, 
        ...d.data() 
      })));
    });

    return () => { unsubAds(); unsubUsers(); };
  }, [isAdmin]);

  const handleDeleteAd = async (adId: string) => {
    if (!window.confirm('Permanent Delete? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'ads', adId));
      toast.success('Ad removed from database');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-green-700">Loading Cloud Data...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-black mb-2 text-gray-900">Restricted Area</h2>
          <p className="text-gray-500 mb-6 text-sm">Admin privileges required for hellisop0@gmail.com</p>
          <button onClick={() => navigate('/')} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Back to Safety</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">CITYCARE Control</h1>
          <div className="flex gap-4 mt-2">
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Live Ads: {ads.length}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Total Users: {users.length}</span>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl border w-full md:w-auto">
          <button onClick={() => setActiveTab('ads')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'ads' ? 'bg-white text-green-700 shadow-md' : 'text-gray-400'}`}>Ads</button>
          <button onClick={() => setActiveTab('users')} className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-white text-green-700 shadow-md' : 'text-gray-400'}`}>Users</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{activeTab === 'ads' ? 'Listing & ID' : 'User Profile'}</th>
              <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{activeTab === 'ads' ? 'Seller Name' : 'Email Address'}</th>
              <th className="p-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeTab === 'ads' ? ads.map(ad => (
              <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5">
                  <div className="font-bold text-gray-900 leading-tight">{ad.title}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Hash size={10} className="text-blue-400" />
                    <span className="text-[10px] font-mono font-bold text-blue-500 uppercase">{ad.id}</span>
                  </div>
                </td>
                <td className="p-5 text-sm font-medium text-gray-600 italic">{ad.sellerName || 'Pending...'}</td>
                <td className="p-5">
                  <div className="flex gap-2">
                    <Link to={`/ad/${ad.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"><ExternalLink size={18} /></Link>
                    <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            )) : users.map(u => (
              <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center font-black text-green-700 text-xs">
                    {u.displayName?.charAt(0) || u.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-bold text-gray-900 text-sm">{u.displayName || 'Guest User'}</div>
                </td>
                <td className="p-5 text-sm text-gray-500 font-medium">{u.email}</td>
                <td className="p-5">
                   <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'users', u.uid), { isVerified: !u.isVerified });
                      toast.success('Status Synced');
                    }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${u.isVerified ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}
                  >
                    {u.isVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {u.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}