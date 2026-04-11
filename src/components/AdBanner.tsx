import { useEffect, useState } from 'react';
import { db } from '../firebase'; // Import your firebase config
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
          // If you have multiple ads for one spot, this picks one at random
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
      // 1. Update the click count in Firestore
      const adRef = doc(db, "advertisements", ad.id);
      await updateDoc(adRef, {
        clickCount: increment(1)
      });

      // 2. Open the client's link (WhatsApp, etc.)
      window.open(ad.targetUrl, '_blank');
    }
  };

  if (loading || !ad) return null;

  return (
    /* Centralized Wrapper: Controls the banner size for the whole site */
    <div className="w-full my-4">
      <button 
        onClick={handleAdClick}
        className="w-full relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white flex items-center justify-center h-32 md:h-40 transition-transform active:scale-[0.98]"
      >
        <img 
          src={ad.imageUrl} 
          alt={ad.title || "Advertisement"} 
          /* Fixed centering: w-full h-full + object-cover ensures it fills the box perfectly */
          className="w-full h-full object-cover object-center"
        />
        
        {/* Optional 'Ad' badge to make it look professional */}
        <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-md text-[10px] text-white px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
          Ad
        </div>
      </button>
    </div>
  );
};

export default AdBanner;