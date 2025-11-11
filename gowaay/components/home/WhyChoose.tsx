'use client';

import { MapPin, Star, MessageCircle } from 'lucide-react';

interface WhyChooseProps {
  className?: string;
}

export function WhyChoose({ className }: WhyChooseProps) {
  const features = [
    {
      icon: MapPin,
      title: 'Best Locations',
      description: 'Find rooms in the most convenient locations across Bangladesh',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'All rooms are verified and rated by our community',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: MessageCircle,
      title: '24/7 Support',
      description: 'Get help whenever you need it with our dedicated support team',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <section className={`py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden ${className}`}>
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-brand/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block px-4 py-2 bg-brand/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-brand">Why Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 mb-6">
            Why Choose GoWaay?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We make finding and booking the perfect accommodation simple, safe, and enjoyable.
            Experience the difference with our trusted platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 md:p-10 text-center group border-2 border-gray-100 hover:border-brand/20"
            >
              {/* Number Badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                {index + 1}
              </div>

              <div className={`w-20 h-20 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                <feature.icon className={`h-10 w-10 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-base">
                {feature.description}
              </p>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-brand to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand mb-2">99%</div>
            <div className="text-sm text-gray-600">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support Available</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand mb-2">5K+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-brand mb-2">100%</div>
            <div className="text-sm text-gray-600">Secure Payments</div>
          </div>
        </div>
      </div>
    </section>
  );
}
