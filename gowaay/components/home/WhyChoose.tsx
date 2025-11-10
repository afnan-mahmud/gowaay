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
    <section className={`py-10 md:py-16 bg-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-900 mb-4">
            Why Choose GoWaay?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We make finding and booking the perfect accommodation simple, safe, and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 text-center group"
            >
              <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
