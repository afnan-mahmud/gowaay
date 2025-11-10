'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Hotel, Home } from 'lucide-react';
import { MobileSearchTrigger } from '@/components/search/MobileSearchTrigger';

export default function MobileHeaderBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type') || 'apartments';
  const [hideCategories, setHideCategories] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const categories = [
    { 
      key: 'apartments', 
      label: 'Apartments', 
      type: 'apartment', 
      icon: Building2 
    },
    { 
      key: 'rooms', 
      label: 'Rooms', 
      type: 'room', 
      icon: Home 
    },
    { 
      key: 'hotels', 
      label: 'Hotels', 
      type: 'hotel', 
      icon: Hotel 
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide categories when scrolling down (more than 50px)
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setHideCategories(true);
      } 
      // Show categories when scrolling up
      else if (currentScrollY < lastScrollY) {
        setHideCategories(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const handleCategoryClick = (type: string) => {
    router.push(`/?type=${type}`);
  };

  return (
    <div className="block md:hidden bg-white shadow-sm sticky top-0 z-30 overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        {/* Search trigger */}
        <MobileSearchTrigger />

        {/* Category tabs with smooth animation */}
        <div 
          className={`transition-all duration-300 ease-in-out ${
            hideCategories 
              ? 'max-h-0 opacity-0 mt-0' 
              : 'max-h-24 opacity-100 mt-4'
          }`}
        >
          <div className="flex items-center justify-around border-b border-gray-200">
            {categories.map((category) => {
              const isActive = currentType === category.type || (!currentType && category.key === 'apartments');
              return (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.type)}
                  className={`flex flex-col items-center gap-2 pb-3 px-4 relative transition-colors ${
                    isActive 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <category.icon className={`h-6 w-6 ${isActive ? 'text-gray-900' : ''}`} />
                  <span className="text-sm font-medium">{category.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
