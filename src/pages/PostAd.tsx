import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Video, MapPin, Phone, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateWhatsAppLink } from '../lib/utils';

const adSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.enum(['Cow', 'Buffalo', 'Goat', 'Sheep', 'Camel', 'Others']),
  breed: z.string().min(2, 'Breed is required'),
  age: z.string().min(1, 'Age is required'),
  weight: z.string().min(1, 'Weight is required'),
  healthCondition: z.string().min(2, 'Health condition is required'),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  phoneNumber: z.string().regex(/^(\+92|0)3[0-9]{9}$/, 'Invalid Pakistani phone number'),
});

type AdFormData = z.infer<typeof adSchema>;

export default function PostAd() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      category: 'Cow',
      phoneNumber: user?.phoneNumber || '',
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 mb-8">You must be logged in to post an advertisement.</p>
          <button onClick={() => navigate('/')} className="bg-green-700 text-white px-8 py-3 rounded-full font-bold">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: AdFormData) => {
    setLoading(true);
    try {
      const adData = {
        ...data,
        images: images.length > 0 ? images : ['https://picsum.photos/seed/livestock/800/600'],
        sellerUid: user.uid,
        sellerName: user.displayName,
        status: 'pending',
        isFeatured: false,
        isUrgent: false,
        viewCount: 0,
        whatsappLink: generateWhatsAppLink(data.phoneNumber, data.title),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      await addDoc(collection(db, 'ads'), adData);
      toast.success('Ad posted successfully! It will be active after review.');
      navigate('/profile');
    } catch (error) {
      console.error('Error posting ad:', error);
      toast.error('Failed to post ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageAdd = () => {
    if (images.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    const newImg = `https://picsum.photos/seed/${Math.random()}/800/600`;
    setImages([...images, newImg]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-700 px-8 py-6 text-white">
            <h1 className="text-2xl font-bold">{t('postAd')}</h1>
            <p className="text-green-100 opacity-80">Fill in the details to sell your livestock quickly.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
            {/* Media Upload */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-green-600" />
                Media Upload
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border-2 border-gray-100 relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={handleImageAdd}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-500 transition-all"
                  >
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Add Photo</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Max 5 images. High quality photos sell faster!</p>
            </div>

            <hr className="border-gray-100" />

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Ad Title</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Beautiful Sahiwal Cow for Sale"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  {['Cow', 'Buffalo', 'Goat', 'Sheep', 'Camel', 'Others'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price (PKR)</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="e.g. 250000"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Describe your animal's features, health, and behavior..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                ></textarea>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Animal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Breed</label>
                <input {...register('breed')} placeholder="e.g. Sahiwal, Cholistani" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                <input {...register('age')} placeholder="e.g. 2 Years, 4 Teeth" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Weight (Approx)</label>
                <input {...register('weight')} placeholder="e.g. 350 KG, 10 Mund" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Health Condition</label>
                <input {...register('healthCondition')} placeholder="e.g. Fully Vaccinated, Healthy" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.healthCondition && <p className="text-red-500 text-xs mt-1">{errors.healthCondition.message}</p>}
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Location & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input {...register('city')} placeholder="e.g. Lahore" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area</label>
                <input {...register('area')} placeholder="e.g. DHA Phase 6, Mandi Road" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input {...register('phoneNumber')} placeholder="e.g. 03001234567" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none" />
                </div>
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span>Post Ad Now</span>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
