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
  
  // New State for Client Ads
  const [promoAd, setPromoAd] = useState<any>(null);
  
  const [favorites, setFavorites] = useState<string[]>([]);
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

    setFavorites(prev => 
      isCurrentlyFavorite 
        ? prev.filter(id => id !== adId) 
        : [...prev, adId]
    );

    try {
      await updateDoc(userRef, {
        favoriteAds: isCurrentlyFavorite 
          ? arrayRemove(adId) 
          : arrayUnion(adId)
      });
      
      if (!isCurrentlyFavorite) {
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error('Failed to update favorites');
      setFavorites(prev => 
        isCurrentlyFavorite ? [...prev, adId] : prev.filter(id => id !== adId)
      );
    }
  };

  useEffect(() => {
    // 1. Fetch Client Promotional Ad (The new ad you created)
    const promoQuery = query(
      collection(db, 'active_ads'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribePromo = onSnapshot(promoQuery, (snapshot) => {
      if (!snapshot.empty) {
        setPromoAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setPromoAd(null);
      }
    });

    // 2. Fetch Featured Ads
    const featuredQuery = query(
      collection(db, 'ads'),
      where('status', '==', 'active'),
      where('isFeatured', '==', true),
      limit(4)
    );

    const unsubscribeFeatured = onSnapshot(featuredQuery, (snapshot) => {
      setFeaturedAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ads');
    });

    // 3. Fetch Latest Ads
    const latestQuery = query(
      collection(db, 'ads'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );

    const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
      setLatestAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'ads');
    });

    return () => {
      unsubscribePromo();
      unsubscribeFeatured();
      unsubscribeLatest();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <CategoryGrid />

      {/* NEW PROMOTIONAL AD SECTION */}
      {promoAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group overflow-hidden rounded-3xl shadow-lg border border-gray-100"
          >
            <a href={promoAd.targetUrl} target="_blank" rel="sponsored noopener noreferrer">
              <img 
                src={promoAd.imageUrl} 
                alt="Sponsored Content" 
                className="w-full h-auto object-cover max-h-[200px] sm:max-h-[300px] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-900 shadow-sm border border-gray-200">
                Sponsored
              </div>
            </a>
          </motion.div>
        </section>
      )}

      {/* Featured Section */}
      {featuredAds.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{t('featured')}</h2>
              <button className="text-green-700 font-semibold hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredAds.map(ad => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  isFavorite={favorites.includes(ad.id)} 
                  onToggleFavorite={() => toggleFavorite(ad.id)} 
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{t('latest')}</h2>
            <button className="text-green-700 font-semibold hover:underline">View All</button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-gray-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {latestAds.map(ad => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  isFavorite={favorites.includes(ad.id)} 
                  onToggleFavorite={() => toggleFavorite(ad.id)} 
                />
              ))}
            </div>
          )}

          {latestAds.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No ads found. Be the first to post!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}