import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Star, BadgeCheck, X, CheckCircle2 } from 'lucide-react';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const navigate = useNavigate();

  const premiumServices = [
    {
      id: "paid-ads",
      title: "Paid Advertisements",
      status: "coming-soon",
      description: "Dominate the market by placing your brand in front of high-intent buyers. Our data-driven targeting ensures your budget is spent on users most likely to convert.",
      image: "https://i.postimg.cc/85702PPM/www_xyz_com.png",
      icon: <Megaphone className="w-6 h-6 text-blue-600" />,
      pros: ["Massive Reach", "City-Specific Targeting", "Budget Control"]
    },
    {
      id: "featured-ads",
      title: "Featured Listings",
      status: "active",
      description: "Secure the 'Pole Position.' Featured ads stay pinned to the top of search results, generating up to 10x more engagement than standard listings.",
      image: "https://i.postimg.cc/qRBkyKLQ/Untitled-design-(2).png",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      pros: ["Quick Sales", "Maximum Visibility", "Professional Look"]
    },
    {
      id: "verified-seller",
      title: "Verified Pro Seller",
      status: "coming-soon",
      description: "Build instant authority. The Blue Tick badge signals to buyers that you are a trusted, background-checked professional, significantly reducing sales friction.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
      icon: <BadgeCheck className="w-6 h-6 text-blue-500" />,
      pros: ["Increased Trust", "Higher Sales Volume", "Verified Status"]
    },
  ];

  const handleAction = (service: any) => {
    if (service.id === 'featured-ads' && service.status === 'active') {
      // Redirect to profile with the promote flag
      navigate('/profile?action=promote');
    } else {
      setSelectedService(null);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">What We Do</h2>
        <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">Our Expert Services</p>
      </div>

      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {premiumServices.map((service, index) => (
          <div key={index} className={`group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col ${service.status === 'coming-soon' ? 'opacity-90' : ''}`}>
            <div className="relative h-48 overflow-hidden">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">{service.icon}</div>
              {service.status === 'coming-soon' && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Coming Soon</div>
              )}
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">{service.description}</p>
              <div className="mb-6 space-y-2 mt-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pros / فوائد</p>
                {service.pros.map((pro, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedService(service)} className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-transform hover:translate-x-1">
                Learn More <span>&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative h-56">
              <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedService(null)} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-900 shadow-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-xl">{selectedService.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedService.title}</h3>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-6">{selectedService.description}</p>
              <button
                onClick={() => handleAction(selectedService)}
                className={`w-full py-4 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${
                  selectedService.status === 'coming-soon' ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {selectedService.status === 'coming-soon' ? "Close" : "Get Started"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;