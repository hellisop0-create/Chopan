import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; 
import { db } from '../firebase';
import { Ad } from '../types';
import Hero from '../components/Hero';
import { useAuth } from '../contexts/AuthContext'; 
import CategoryGrid from '../components/CategoryGrid';
import AdCard from '../components/AdCard';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { toast } from 'sonner'; 
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function Home() {
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [latestAds, setLatestAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoAd, setPromoAd] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // --- SEARCH & LOCATION STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Pakistan");

  const { t } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.favoriteAds) {
      setFavorites(user.favoriteAds);
    } else {
      setFavorites([]);
    }
  }, [user?.favoriteAds]);

  const toggleFavorite = async (adId: string) => {
    if (!user) {
      toast.error('Please login to favorite ads');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    const isCurrentlyFavorite = favorites.includes(adId);
    setFavorites(prev => isCurrentlyFavorite ? prev.filter(id => id !== adId) : [...prev, adId]);

    try {
      await updateDoc(userRef, {
        favoriteAds: isCurrentlyFavorite ? arrayRemove(adId) : arrayUnion(adId)
      });
      if (!isCurrentlyFavorite) toast.success('Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
      setFavorites(prev => isCurrentlyFavorite ? [...prev, adId] : prev.filter(id => id !== adId));
    }
  };

  useEffect(() => {
    // 1. Fetch Promo
    const promoQuery = query(collection(db, 'active_ads'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribePromo = onSnapshot(promoQuery, (snapshot) => {
      if (!snapshot.empty) setPromoAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    });

    // 2. Fetch Featured
    const featuredQuery = query(collection(db, 'ads'), where('status', '==', 'active'), where('isFeatured', '==', true), limit(4));
    const unsubscribeFeatured = onSnapshot(featuredQuery, (snapshot) => {
      setFeaturedAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    });

    // 3. Fetch Latest
    const latestQuery = query(collection(db, 'ads'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(12));
    const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
      setLatestAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      setLoading(false);
    });

    return () => {
      unsubscribePromo();
      unsubscribeFeatured();
      unsubscribeLatest();
    };
  }, []);

  // --- LIVE FILTERING LOGIC ---
  const filteredLatestAds = latestAds.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Checks location field in Firebase
    const matchesCity = selectedCity === "All Pakistan" || ad.location === selectedCity;

    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      
      <CategoryGrid />

      {/* Promotional Section */}
      {promoAd && (
        <section className="max-w-7xl mx-auto px-4 mb-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl shadow-lg">
            <a href={promoAd.targetUrl} target="_blank" rel="sponsored noopener noreferrer">
              <img src={promoAd.imageUrl} alt="Ad" className="w-full h-auto object-cover max-h-[300px]" />
            </a>
          </motion.div>
        </section>
      )}

      {/* Featured (Hidden during search) */}
      {featuredAds.length > 0 && !searchQuery && selectedCity === "All Pakistan" && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">{t('featured')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredAds.map(ad => (
                <AdCard key={ad.id} ad={ad} isFavorite={favorites.includes(ad.id)} onToggleFavorite={() => toggleFavorite(ad.id)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Results Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            {searchQuery || selectedCity !== "All Pakistan" ? "Search Results" : t('latest')}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-gray-200"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {filteredLatestAds.map(ad => (
                <AdCard key={ad.id} ad={ad} isFavorite={favorites.includes(ad.id)} onToggleFavorite={() => toggleFavorite(ad.id)} />
              ))}
            </div>
          )}

          {!loading && filteredLatestAds.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No matching ads found.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}