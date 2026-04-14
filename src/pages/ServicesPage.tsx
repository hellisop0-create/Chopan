import React, { useState } from 'react';
import { Megaphone, Star, BadgeCheck, CreditCard, X } from 'lucide-react';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);

  const premiumServices = [
    {
      id: "paid-ads",
      title: "Paid Advertisements",
      description: "Dominate the market by placing your brand in front of high-intent buyers. Our data-driven targeting ensures your budget is spent on users most likely to convert.",
      image: "https://i.postimg.cc/85702PPM/www_xyz_com.png",
      icon: <Megaphone className="w-6 h-6 text-blue-600" />,
      price: "Starting from Rs. 2,500",
      features: ["Targeted Reach", "Performance Analytics", "Cross-Platform Placement"]
    },
    {
      id: "featured-ads",
      title: "Featured Listings",
      description: "Secure the 'Pole Position.' Featured ads stay pinned to the top of search results, generating up to 10x more engagement than standard listings.",
      image: "https://i.postimg.cc/qRBkyKLQ/Untitled-design-(2).png",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      price: "Rs. 1,000 / week",
      features: ["Top-of-Page Priority", "Highlighted Border", "Daily Re-boost"]
    },
    {
      id: "verified-seller",
      title: "Verified Pro Seller",
      description: "Build instant authority. The Blue Tick badge signals to buyers that you are a trusted, background-checked professional, significantly reducing sales friction.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop",
      icon: <BadgeCheck className="w-6 h-6 text-blue-500" />,
      price: "Rs. 5,000 / year",
      features: ["Verification Badge", "Priority Support", "Buyer Trust Shield"]
    },
  ];

  const paymentMethods = [
    { name: "JazzCash", logo: "https://upload.wikimedia.org/wikipedia/en/2/23/JazzCash_Logo.png" },
    { name: "EasyPaisa", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Easypaisa_logo.png" },
    { name: "Bank Transfer", icon: <CreditCard className="w-5 h-5" /> }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">What We Do</h2>
        <p className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Our Expert Services
        </p>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          We combine technical excellence with strategic design to build digital products that perform.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {premiumServices.map((service, index) => (
          <div
            key={index}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
          >
            {/* Image Wrapper */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-white p-2 rounded-lg shadow-md">
                {service.icon}
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {service.description}
              </p>
              <button
                onClick={() => setSelectedService(service)}
                className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                Learn More <span>&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popup / Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="relative h-56">
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-gray-900 hover:bg-white shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-lg">
                  {selectedService.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedService.title}</h3>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                {selectedService.description}
              </p>

              {/* Price and Payment Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Pricing: {selectedService.price}</p>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Accepted Payments:</p>
                <div className="flex items-center gap-4">
                  {paymentMethods.map((method, idx) => (
                    <div key={idx} className="flex items-center">
                      {method.logo ? (
                        <img src={method.logo} alt={method.name} className="h-6 object-contain grayscale hover:grayscale-0 transition-all" />
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                          {method.icon} <span>BANK</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedService(null)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;