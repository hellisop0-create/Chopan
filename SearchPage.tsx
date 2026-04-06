import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Ad } from '../types';
import AdCard from '../components/AdCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // Get values from URL: /search?q=iphone&location=Lahore
  const queryTerm = searchParams.get('q') || "";
  const locationTerm = searchParams.get('location') || "";

  useEffect(() => {
    setLoading(true);
    // Fetch all active ads (filtering happens in memory for better speed)
    const q = query(collection(db, 'ads'), where('status', '==', 'active'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allAds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
      
      // Filter based on URL params
      const filtered = allAds.filter(ad => {
        const matchesSearch = ad.title.toLowerCase().includes(queryTerm.toLowerCase());
        const matchesLocation = !locationTerm || ad.location === locationTerm;
        return matchesSearch && matchesLocation;
      });

      setAds(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [queryTerm, locationTerm]); // Re-run if URL changes

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">
        {queryTerm ? `Results for "${queryTerm}"` : "All Ads"} 
        {locationTerm && ` in ${locationTerm}`}
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {ads.map(ad => <AdCard key={ad.id} ad={ad} />)}
          {ads.length === 0 && <p className="col-span-full text-center py-20 text-gray-500">No ads found matching your search.</p>}
        </div>
      )}
    </div>
  );
}