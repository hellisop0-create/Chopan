import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
}

export default function Hero({ searchQuery, setSearchQuery, selectedCity, setSelectedCity }: HeroProps) {
  const { t, language } = useLanguage();
  
  return (
    <div className="relative bg-green-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative z-10 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("text-4xl sm:text-6xl font-extrabold text-white mb-4", language === 'ur' && "font-urdu")}>
          {t('appName')}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cn("text-xl text-green-100 mb-8", language === 'ur' && "font-urdu")}>
          {t('tagline')}
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Search Input */}
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none text-gray-700"
            />
          </div>
          
          {/* City Selection */}
          <div className="w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-100 px-4 py-2 flex items-center space-x-2">
            <MapPin className="text-gray-400 w-5 h-5" />
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-600 font-medium cursor-pointer"
            >
              <option>All Pakistan</option>
              <option>Lahore</option>
              <option>Karachi</option>
              <option>Islamabad</option>
              <option>Faisalabad</option>
              <option>Multan</option>
            </select>
          </div>

          <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all">
            {t('search').split(' ')[0]}
          </button>
        </motion.div>
      </div>
    </div>
  );
}