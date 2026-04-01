import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../LanguageContext';
import { motion } from 'motion/react';

const categories = [
  { id: 'Cow', icon: '🐄', color: 'bg-blue-50' },
  { id: 'Buffalo', icon: '🐃', color: 'bg-slate-50' },
  { id: 'Goat', icon: '🐐', color: 'bg-orange-50' },
  { id: 'Sheep', icon: '🐑', color: 'bg-pink-50' },
  { id: 'Camel', icon: '🐪', color: 'bg-yellow-50' },
  { id: 'Others', icon: '🐾', color: 'bg-green-50' },
];

export default function CategoryGrid() {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('categories')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/browse?category=${cat.id}`}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl ${cat.color} hover:shadow-md transition-all border border-transparent hover:border-gray-200 group`}
              >
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <span className="font-semibold text-gray-700">
                  {t(cat.id.toLowerCase())}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
