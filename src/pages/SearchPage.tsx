import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types';
import AdCard from '../components/AdCard';
import { useLanguage } from '../contexts/LanguageContext';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // 1. Get query params from URL: /search?q=iphone&location=Karachi
  const queryTerm = searchParams.get('q') || "";
  const locationTerm = searchParams.get('location') || "";

  useEffect(() => {
    setLoading(true);
    // Fetch active ads from Firebase
    const q = query(collection(db, 'ads'), where('status', '==', 'active'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allAds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      
      // 2. Perform the filter based on what's in the address bar
      const filtered = allAds.filter(ad => {
        const matchesSearch = (ad.title || "").toLowerCase().includes(queryTerm.toLowerCase().trim());
        const matchesLocation = !locationTerm || locationTerm === "All Pakistan" || 
                               (ad.location || "").toLowerCase() === locationTerm.toLowerCase();
        return matchesSearch && matchesLocation;
      });

      setAds(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [queryTerm, locationTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {queryTerm ? `Results for "${queryTerm}"` : "Showing all ads"}
        </h1>
        {locationTerm && locationTerm !== "All Pakistan" && (
          <p className="text-gray-500 mt-2">Location: {locationTerm}</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {ads.map(ad => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>

          {ads.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border">
              <p className="text-gray-500 text-lg">We couldn't find any ads matching your search.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}