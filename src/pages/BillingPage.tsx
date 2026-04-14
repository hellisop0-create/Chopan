import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { CreditCard, CheckCircle, ArrowLeft, Clock, Zap } from 'lucide-react';

export default function BillingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const adId = queryParams.get('adId');

  // 1. Pricing Plans Configuration
  const plans = [
    { id: 'basic', label: 'Basic Boost', days: 3, price: 500 },
    { id: 'standard', label: 'Standard Pro', days: 7, price: 1000 },
    { id: 'gold', label: 'Gold Premium', days: 30, price: 3500 },
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to 7 days
  const [tid, setTid] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid) return toast.error("Please enter Transaction ID");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'payments'), {
        adId,
        serviceTitle: selectedPlan.label,
        durationDays: selectedPlan.days, // Timeline
        amount: selectedPlan.price,      // Pricing
        tid,
        sellerUid: user?.uid,
        sellerEmail: user?.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      
      toast.success(`Payment for ${selectedPlan.days} days submitted!`);
      navigate('/profile');
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!adId) return <div className="p-20 text-center font-bold">Error: No Ad ID Linked</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-700 p-8 text-white text-center">
          <h1 className="text-2xl font-bold">Feature Your Ad</h1>
          <p className="opacity-80 text-sm">Targeting Ad: {adId.slice(0, 8)}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* 2. Timeline & Pricing Selector */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-700" /> Select Duration
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition-all flex justify-between items-center ${
                    selectedPlan.id === plan.id ? 'border-green-700 bg-green-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-900">{plan.label}</p>
                    <p className="text-sm text-gray-500">{plan.days} Days Featured</p>
                  </div>
                  <p className="font-extrabold text-green-700 text-lg">Rs. {plan.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-green-700" /> Payment Details
            </h3>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase">Send Rs. {selectedPlan.price} to:</p>
              <div className="mt-2 flex justify-between items-center">
                <div>
                  <p className="text-lg font-mono font-bold">0300-1234567</p>
                  <p className="text-sm text-gray-600">JazzCash / EasyPaisa (Admin Name)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Enter Transaction ID (TID)</label>
            <input 
              type="text"
              required
              placeholder="11 or 12 digit number"
              className="w-full p-4 border-2 rounded-2xl focus:border-green-700 outline-none"
              value={tid}
              onChange={(e) => setTid(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-800 transition-all flex items-center justify-center"
          >
            <Zap className="w-5 h-5 mr-2 fill-current" />
            {isSubmitting ? "Processing..." : `Promote for ${selectedPlan.days} Days`}
          </button>
        </form>
      </div>
    </div>
  );
}