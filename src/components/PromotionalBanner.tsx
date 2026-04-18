import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, limit, onSnapshot, orderBy } from 'firebase/firestore';

export default function PromotionalBanner() {
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    // Get the latest active ad
    // Change 'active_ads' to 'advertisements'
    const q = query(
      collection(db, 'advertisements'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setAd(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!ad) return null;

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <a
        href={ad.targetUrl && ad.targetUrl.trim() !== "" ? ad.targetUrl : "#"}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block group relative overflow-hidden rounded-xl shadow-lg transition-all hover:scale-[1.01]"
      >
        <div className="relative w-full bg-gray-100 flex items-center justify-center min-h-[50px] md:h-[90px]">
          <img
            src={ad.imageUrl}
            alt="Sponsored Advertisement"
            className="w-full h-full object-contain md:object-fill"
          />
        </div>

        {/* Professional "Ad" Badge */}
        <div className="absolute top-1 right-1 bg-black/40 backdrop-blur-sm text-white text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
          Ad
        </div>
      </a>
    </div>
  );
}