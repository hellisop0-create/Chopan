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
    /* Change: added md:w-[728px] and fixed height md:h-[90px] */
    <div className="w-full md:w-[728px] mx-auto p-4">
      <a
        href={ad.targetUrl && ad.targetUrl.trim() !== "" ? ad.targetUrl : "#"}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block group relative overflow-hidden rounded-lg shadow-sm transition-all hover:shadow-md"
      >
        <div className="relative w-full h-auto md:h-[90px] bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={ad.imageUrl}
            alt="Sponsored Advertisement"
            /* w-full on mobile, but strictly controlled by the parent div on desktop */
            className="w-full h-full object-contain md:object-fill"
          />
        </div>

        {/* Professional "Ad" Badge */}
        <div className="absolute top-1 right-1 bg-black/40 backdrop-blur-sm text-white text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter">
          Ad
        </div>
      </a>
    </div>
  );
}