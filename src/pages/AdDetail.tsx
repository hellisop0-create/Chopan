import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../lib/utils';
// 1. Import your chat service
import { getOrCreateChat } from '../lib/chat-service';
import { 
  MapPin, Phone, MessageCircle, MessageSquare, ShieldCheck, Share2, 
  ChevronLeft, ChevronRight, Calendar, Weight, 
  Activity, Info, Crown, Star, Hash, EyeOff 
} from 'lucide-react';
import AdCard from '../components/AdCard';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [ad, setAd] = useState<any | null>(null);
  const [relatedAds, setRelatedAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchAd = async () => {
      setLoading(true);
      try {
        const adDoc = await getDoc(doc(db, 'ads', id));
        if (adDoc.exists()) {
          const adData = { id: adDoc.id, ...adDoc.data() } as Ad;
          setAd(adData);
          
          await updateDoc(doc(db, 'ads', id), { viewCount: increment(1) });

          const relatedQuery = query(
            collection(db, 'ads'),
            where('category', '==', adData.category),
            where('status', '==', 'active'),
            limit(4)
          );
          const unsubscribe = onSnapshot(relatedQuery, (snapshot) => {
            setRelatedAds(snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() } as Ad))
              .filter(a => a.id !== id)
            );
          });
          return () => unsubscribe();
        } else {
          toast.error('Ad not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching ad:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id, navigate]);

  // 2. Chat Logic
  const handleStartChat = async () => {
    if (!user) {
      toast.error("Please login to message the seller");
      return;
    }

    try {
      // Creates or gets existing chat and returns chatId
      const chatId = await getOrCreateChat(
        user.uid, 
        ad.sellerUid, 
        ad.id, 
        ad.title
      );
      // Navigate to your messages page and pass the ID to auto-select it
      navigate('/messages', { state: { selectedChatId: chatId } });
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Could not start chat. Please try again.");
    }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-96 bg-gray-200 rounded-2xl mb-8"></div>
      <div className="h-10 bg-gray-200 w-3/4 rounded mb-4"></div>
    </div>
  );

  if (!ad) return null;

  const isGold = ad.isFeatured === true || ad.featured === true;
  const isOwner = user?.uid === ad.sellerUid;
  const canSeePrivateInfo = isOwner || user?.email === 'hellisop0@gmail.com';

  const cleanPhone = ad.phoneNumber?.replace(/\D/g, '');
  const finalWhatsappLink = ad.whatsappLink?.startsWith('http') 
    ? ad.whatsappLink 
    : `https://wa.me/${cleanPhone}`;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: ad.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumbs (Simplified for brevity) */}
        <nav className="flex mb-6 text-sm text-gray-500">
           <Link to="/" className="hover:text-green-700">Home</Link>
           <span className="mx-2">/</span>
           <span className="text-gray-900 font-medium">{ad.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative aspect-video bg-black flex items-center justify-center">
                {ad.images?.length > 0 ? (
                  <img src={ad.images[currentImageIndex]} className="max-h-full object-contain" alt="" />
                ) : (
                  <Info className="text-white opacity-20 w-12 h-12" />
                )}
            </div>

            {/* Main Details */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
              <div className="text-3xl font-black text-green-700 mb-6">{formatPrice(ad.price)}</div>
              <p className="whitespace-pre-wrap text-gray-700">{ad.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Owner Management Dashboard */}
            {canSeePrivateInfo && (
              <div className="bg-blue-600 rounded-2xl p-5 shadow-lg text-white">
                <div className="flex items-center gap-2 text-xs font-black uppercase mb-3">
                  <ShieldCheck className="w-4 h-4" /> Management
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 font-mono text-sm">
                  ID: {ad.id}
                </div>
              </div>
            )}

            {/* Seller Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 border-b pb-2">Seller Details</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-xl border border-green-200">
                  {ad.sellerName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{ad.sellerName}</div>
                  <div className="text-xs text-gray-500 italic">Verified Seller</div>
                </div>
              </div>

              <div className="space-y-3">
                {/* 3. INTERNAL CHAT OPTION */}
                {!isOwner && (
                  <button 
                    onClick={handleStartChat}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Chat with Seller
                  </button>
                )}

                {/* External Contacts */}
                {(!ad.hidePhoneNumber || canSeePrivateInfo) ? (
                  <>
                    <a 
                      href={finalWhatsappLink} 
                      target="_blank" 
                      className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </a>
                    <a 
                      href={`tel:${ad.phoneNumber}`} 
                      className="w-full border-2 border-green-600 text-green-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" /> Call Now
                    </a>
                  </>
                ) : (
                  <div className="bg-gray-50 border p-4 rounded-xl text-center text-sm text-gray-500">
                    <EyeOff className="w-5 h-5 mx-auto mb-2 opacity-30" />
                    Phone number hidden by seller
                  </div>
                )}

                <button onClick={handleShare} className="w-full mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Ad
                </button>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-amber-900">
               <h4 className="font-bold flex items-center gap-2 text-xs uppercase mb-2">
                 <ShieldCheck className="w-4 h-4" /> Safety Tips
               </h4>
               <ul className="text-[11px] space-y-1 list-disc pl-4 opacity-80">
                 <li>Meet the seller in person.</li>
                 <li>Never pay in advance.</li>
               </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}