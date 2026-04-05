import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Trash2, LayoutDashboard, Users, Star, 
  CheckCircle2, XCircle, ExternalLink, ImagePlus, Loader2, Megaphone, Clock, Calendar, X
} from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAILS = ['saadatali1403@gmail.com', 'hellisop0@gmail.com', 'mehreensaadat2@gmail.com'].map(e => e.toLowerCase().trim());

export default function Admin() {
  const { user, isAdmin: isAuthAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeAds, setActiveAds] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ads' | 'users' | 'promotions'>('ads');

  // Ad Manager State
  const [adImage, setAdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientLink, setClientLink] = useState("");
  const [duration, setDuration] = useState("7");
  const [isUploading, setIsUploading] = useState(false);

  const currentUserEmail = user?.email?.toLowerCase().trim();
  const isAdmin = isAuthAdmin || (currentUserEmail && ADMIN_EMAILS.includes(currentUserEmail));

  // DEBUG LOG: Open F12 to see this
  useEffect(() => {
    console.log("Logged in as:", currentUserEmail, "| Admin Access:", isAdmin);
  }, [currentUserEmail, isAdmin]);

  // Handle Image Preview
  useEffect(() => {
    if (!adImage) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(adImage);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [adImage]);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/admin-login');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubAds = onSnapshot(collection(db, 'ads'), (s) => setAds(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubUsers = onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ uid: d.id, ...d.data() }))));
    const q = query(collection(db, 'active_ads'), orderBy('createdAt', 'desc'));
    const unsubPromos = onSnapshot(q, (s) => setActiveAds(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubAds(); unsubUsers(); unsubPromos(); };
  }, [isAdmin]);

  const handleRunAd = async () => {
    if (!adImage || !clientLink) return toast.error("Provide image and link");
    setIsUploading(true);
    try {
      // Use a unique name to avoid cache issues
      const fileName = `${Date.now()}_${adImage.name}`;
      const storageRef = ref(storage, `site-ads/${fileName}`);
      
      const uploadResult = await uploadBytes(storageRef, adImage);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(duration));

      await addDoc(collection(db, "active_ads"), {
        imageUrl,
        targetUrl: clientLink,
        createdAt: serverTimestamp(),
        expiresAt: expiryDate.toISOString(),
        isActive: true
      });

      toast.success("Ad is now live!");
      setAdImage(null);
      setClientLink("");
      setActiveTab('ads'); 
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error("Upload failed. Ensure CORS and Rules are set.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteActiveAd = async (id: string) => {
    if (!window.confirm('Remove this ad?')) return;
    try {
      await deleteDoc(doc(db, 'active_ads', id));
      toast.success('Ad removed');
    } catch { toast.error('Delete failed'); }
  };

  // Missing Function Fix
  const handleDelete = async (type: 'ads' | 'users', id: string) => {
    if (!window.confirm(`Permanently delete this ${type === 'ads' ? 'listing' : 'user'}?`)) return;
    try {
      await deleteDoc(doc(db, type, id));
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
  };

  if (authLoading) return <div className="p-10 text-center font-black text-blue-600 animate-pulse uppercase">Verifying Admin Identity...</div>;
  if (!isAdmin) return <div className="p-20 text-center font-bold text-red-500 uppercase">Unauthorized Access</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col space-y-4 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Admin <span className="text-blue-600">Control</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{currentUserEmail}</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border shadow-sm w-full overflow-x-auto">
            <button onClick={() => setActiveTab('ads')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase transition-all whitespace-nowrap ${activeTab === 'ads' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <LayoutDashboard size={14} /> Listings ({ads.length})
            </button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Users size={14} /> Sellers ({users.length})
            </button>
            <button onClick={() => setActiveTab('promotions')} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-[11px] uppercase transition-all whitespace-nowrap ${activeTab === 'promotions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Megaphone size={14} /> Run Ads
            </button>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}

        {activeTab === 'promotions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-300">
            {/* LEFT: UPLOAD FORM */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border shadow-xl h-fit">
              <div className="mb-6">
                <h2 className="text-lg font-black uppercase">New Campaign</h2>
                <p className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Homepage Banner Ad</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  {previewUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 aspect-[12/4] bg-gray-100 shadow-inner">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      <button onClick={() => setAdImage(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"><X size={16}/></button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                      <ImagePlus className="text-gray-300 group-hover:text-blue-400 mb-2 transition-colors" size={40} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Click to Select Banner</span>
                      <input type="file" accept="image/*" onChange={(e) => setAdImage(e.target.files?.[0] || null)} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Destination URL</label>
                  <input 
                    type="url" 
                    placeholder="https://example.com" 
                    value={clientLink}
                    onChange={(e) => setClientLink(e.target.value)}
                    className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Ad Duration</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                    <option value="1">24 Hours</option>
                    <option value="7">7 Days (Weekly)</option>
                    <option value="30">30 Days (Monthly)</option>
                  </select>
                </div>

                <button onClick={handleRunAd} disabled={isUploading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest disabled:bg-gray-300 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-100">
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : "Activate Now"}
                </button>
              </div>
            </div>

            {/* RIGHT: LIST OF LIVE ADS */}
            <div className="lg:col-span-7 space-y-4">
               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Currently Running ({activeAds.length})</h3>
               {activeAds.length === 0 ? (
                 <div className="bg-gray-100 border-2 border-dashed rounded-3xl p-10 text-center text-gray-400 font-bold uppercase text-xs italic">No ads currently active</div>
               ) : (
                 activeAds.map(ad => (
                   <div key={ad.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between group shadow-sm hover:border-blue-200 transition-all">
                     <div className="flex items-center gap-4">
                       <img src={ad.imageUrl} className="w-20 h-10 rounded-lg object-cover border" />
                       <div>
                         <p className="text-[10px] font-black uppercase text-gray-900">Campaign Active</p>
                         <div className="flex items-center gap-1 text-[8px] text-orange-500 font-bold uppercase italic">
                           <Clock size={10} /> Expires: {new Date(ad.expiresAt).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                     <button onClick={() => handleDeleteActiveAd(ad.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"><Trash2 size={20} /></button>
                   </div>
                 ))
               )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-3xl border shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-5">{activeTab === 'ads' ? 'Listing' : 'Seller'}</th>
                    <th className="p-5">Details</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeTab === 'ads' ? ads.map(ad => (
                    <tr key={ad.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 flex items-center gap-4">
                        <img src={ad.images?.[0]} className="w-12 h-10 rounded object-cover border bg-gray-100" />
                        <span className="font-bold text-sm uppercase truncate max-w-[200px]">{ad.title}</span>
                      </td>
                      <td className="p-5">
                         <span className="text-green-600 font-black text-xs">Rs {Number(ad.price).toLocaleString()}</span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                           <Link to={`/ad/${ad.id}`} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><ExternalLink size={18}/></Link>
                           <button onClick={() => handleDelete('ads', ad.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : users.map(u => (
                    <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">{u.displayName?.charAt(0) || 'U'}</div>
                        <span className="font-bold text-sm truncate max-w-[150px]">{u.displayName || 'Seller'}</span>
                      </td>
                      <td className="p-5 text-xs text-gray-400 italic font-medium">{u.email}</td>
                      <td className="p-5 text-right">
                        <button onClick={() => handleDelete('users', u.uid)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (Restored properly) */}
            <div className="lg:hidden space-y-3">
               {activeTab === 'ads' ? ads.map(ad => (
                 <div key={ad.id} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <img src={ad.images?.[0]} className="w-12 h-12 rounded-lg object-cover border" />
                     <div>
                       <p className="font-bold text-xs uppercase truncate max-w-[120px]">{ad.title}</p>
                       <p className="text-green-600 font-black text-[10px]">Rs {Number(ad.price).toLocaleString()}</p>
                     </div>
                   </div>
                   <button onClick={() => handleDelete('ads', ad.id)} className="text-red-400 p-2"><Trash2 size={18}/></button>
                 </div>
               )) : users.map(u => (
                 <div key={u.uid} className="bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase">{u.displayName?.charAt(0) || 'U'}</div>
                     <div>
                       <p className="font-bold text-xs uppercase">{u.displayName || 'Seller'}</p>
                       <p className="text-gray-400 text-[10px] italic truncate max-w-[150px]">{u.email}</p>
                     </div>
                   </div>
                   <button onClick={() => handleDelete('users', u.uid)} className="text-red-400 p-2"><Trash2 size={18}/></button>
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}