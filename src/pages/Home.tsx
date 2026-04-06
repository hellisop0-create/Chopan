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

  // Sync favorites
  useEffect(() => {
    if (user?.favoriteAds) {
      setFavorites(user.favoriteAds);
    } else {
      setFavorites([]);
    }
  }, [user?.favoriteAds]);

  // Real-time Data Fetching
  useEffect(() => {
    const promoQuery = query(collection(db, 'active_ads'), where('isActive', '==', true), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribePromo = onSnapshot(promoQuery, (snapshot) => {
      if (!snapshot.empty) setPromoAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    });

    const featuredQuery = query(collection(db, 'ads'), where('status', '==', 'active'), where('isFeatured', '==', true), limit(4));
    const unsubscribeFeatured = onSnapshot(featuredQuery, (snapshot) => {
      setFeaturedAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    });

    const latestQuery = query(collection(db, 'ads'), where('status', '==', 'active'), orderBy('createdAt', 'desc'), limit(50)); // Increased limit for better searching
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
    const titleMatch = ad.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = ad.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    
    // IMPORTANT: Make sure your Firebase field is exactly 'location'
    const matchesCity = selectedCity === "All Pakistan" || ad.location === selectedCity;

    return matchesSearch && matchesCity;
  });

  // --- DEBUG LOGGER (Check your F12 Console) ---
  useEffect(() => {
    console.log(`Search: "${searchQuery}" | City: ${selectedCity} | Showing: ${filteredLatestAds.length}/${latestAds.length}`);
  }, [searchQuery, selectedCity, filteredLatestAds, latestAds]);

  const toggleFavorite = async (adId: string) => {
    if (!user) {
      toast.error('Please login to favorite ads');
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    const isCurrentlyFavorite = favorites.includes(adId);
    try {
      await updateDoc(userRef, {
        favoriteAds: isCurrentlyFavorite ? arrayRemove(adId) : arrayUnion(adId)
      });
      if (!isCurrentlyFavorite) toast.success('Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
      />
      
      <CategoryGrid />

      {/* Featured Section (Hide when searching) */}
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

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900">
            {searchQuery || selectedCity !== "All Pakistan" ? "Search Results" : t('latest')}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-xl h-80 animate-pulse border border-gray-200" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {filteredLatestAds.map(ad => (
                  <AdCard key={ad.id} ad={ad} isFavorite={favorites.includes(ad.id)} onToggleFavorite={() => toggleFavorite(ad.id)} />
                ))}
              </div>

              {filteredLatestAds.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">No ads match your search criteria.</p>
                  <button onClick={() => {setSearchQuery(""); setSelectedCity("All Pakistan")}} className="mt-4 text-green-700 font-semibold underline">Clear all filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}