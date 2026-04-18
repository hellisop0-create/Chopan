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
import { useNavigate } from 'react-router-dom';
import AdBanner from '../components/AdBanner'; // Using the fixed responsive banner

export default function Home() {
  const [latestAds, setLatestAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Pakistan");

  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.favoriteAds) setFavorites(user.favoriteAds);
    else setFavorites([]);
  }, [user?.favoriteAds]);

  useEffect(() => {
    const latestQuery = query(
      collection(db, 'ads'), 
      where('status', '==', 'active'), 
      orderBy('createdAt', 'desc'), 
      limit(100)
    );
    const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
      setLatestAds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
      setLoading(false);
    });
    return () => unsubscribeLatest();
  }, []);

  const filteredLatestAds = latestAds.filter((ad) => {
    const normalizedSearch = searchQuery.toLowerCase().trim();
    const matchesSearch = (ad.title || "").toLowerCase().includes(normalizedSearch) || 
                          (ad.description || "").toLowerCase().includes(normalizedSearch);
    const matchesCity = selectedCity === "All Pakistan" || 
                        (ad.city || "").toLowerCase() === selectedCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  // --- START OF ADDED SORTING LOGIC ---
  const sortedAds = [...filteredLatestAds].sort((a, b) => {
    // 1. Featured Ads first
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;

    // 2. Group by Category
    const catA = (a.category || "").toLowerCase();
    const catB = (b.category || "").toLowerCase();
    if (catA !== catB) return catA.localeCompare(catB);

    // 3. Group by Breed
    const breedA = (a.breed || "").toLowerCase();
    const breedB = (b.breed || "").toLowerCase();
    return breedA.localeCompare(breedB);
  });
  // --- END OF ADDED SORTING LOGIC ---

  const toggleFavorite = async (adId: string) => {
    if (!user) return toast.error('Please login to favorite ads');
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { 
        favoriteAds: favorites.includes(adId) ? arrayRemove(adId) : arrayUnion(adId) 
      });
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Hero />
      
      <CategoryGrid />

      <section id="results-section" className="py-12">
        <div className="max-w-7xl mx-auto px-4">

          <div className="flex justify-between items-center mb-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery || selectedCity !== "All Pakistan" ? "Search Results" : t('latest')}
            </h2>
            
            {!searchQuery && selectedCity === "All Pakistan" && (
              <button 
                type="button"
                onClick={() => navigate('/all-listings')}
                className="text-green-700 font-semibold hover:underline cursor-pointer"
              >
                View All
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="bg-white rounded-xl h-80 border border-gray-200" />)}
            </div>
          ) : (
            <>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* Now mapping the sortedAds instead of filteredLatestAds */}
                {sortedAds.slice(0, 8).map(ad => (
                  <AdCard key={ad.id} ad={ad} isFavorite={favorites.includes(ad.id)} onToggleFavorite={() => toggleFavorite(ad.id)} />
                ))}
              </div>

              {sortedAds.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">No matching ads found.</p>
                  <button 
                    onClick={() => {setSearchQuery(""); setSelectedCity("All Pakistan")}} 
                    className="mt-4 text-green-700 font-semibold underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}