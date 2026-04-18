import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';

const AdBanner = ({ location }) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const adsRef = collection(db, "advertisements");
        const q = query(
          adsRef,
          where("location", "==", location),
          where("isActive", "==", true)
        );

        const querySnapshot = await getDocs(q);
        const adsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (adsList.length > 0) {
          const randomAd = adsList[Math.floor(Math.random() * adsList.length)];
          setAd(randomAd);
        }
      } catch (error) {
        console.error("Error fetching ad:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [location]);

  const handleAdClick = async () => {
    if (ad) {
      const adRef = doc(db, "advertisements", ad.id);
      await updateDoc(adRef, {
        clickCount: increment(1)
      });
      window.open(ad.targetUrl, '_blank');
    }
  };

  if (loading || !ad) return null;

  return (
    <button
      onClick={handleAdClick}
      className="w-full h-full relative rounded-xl overflow-hidden bg-white flex items-center justify-center transition-transform active:scale-[0.98]"
    >
      <picture className="w-full h-full flex items-center justify-center">
        {/* Desktop Image */}
        <source
          media="(min-width: 768px)"
          srcSet={ad.imageUrl}
          className="w-full h-full object-contain"
        />

        {/* Mobile Image */}
        <img
          src={ad.mobileImageUrl || ad.imageUrl}
          alt={ad.title || "Advertisement"}
          /* 'max-h-full' ensures it never exceeds 128px (h-32) on mobile.
             'w-auto' ensures it doesn't stretch sideways and get blurry.
          */
          className="max-w-full max-h-full w-auto h-auto object-contain mx-auto"
        />
      </picture>

      <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
        Ad
      </div>
    </button>
  );
};

export default AdBanner;