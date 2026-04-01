import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShieldCheck, Zap } from 'lucide-react';
import { Ad } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';

interface AdCardProps {
  ad: Ad;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

const AdCard: React.FC<AdCardProps> = ({ ad, isFavorite, onToggleFavorite }) => {
  const { t, language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn(
        "bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all group relative",
        ad.isFeatured && "ring-2 ring-orange-400"
      )}
    >
      <Link to={`/ad/${ad.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={ad.images[0] || 'https://picsum.photos/seed/livestock/400/300'}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {ad.isFeatured && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 fill-current" />
                FEATURED
              </span>
            )}
            {ad.isUrgent && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                {t('urgent')}
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-600 hover:text-red-500 transition-colors shadow-sm"
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-red-500 text-red-500")} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xl font-bold text-green-800">
              {formatPrice(ad.price)}
            </span>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {t(ad.category.toLowerCase())}
            </span>
          </div>
          
          <h3 className={cn(
            "font-semibold text-gray-800 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors",
            language === 'ur' && "font-urdu text-sm"
          )}>
            {ad.title}
          </h3>

          <div className="flex items-center text-gray-500 text-xs mb-3">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{ad.area}, {ad.city}</span>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                {ad.sellerName.charAt(0)}
              </div>
              <span className="text-xs font-medium text-gray-600 truncate max-w-[80px]">
                {ad.sellerName}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(ad.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AdCard;
