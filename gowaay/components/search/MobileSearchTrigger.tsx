'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { MobileSearchModal } from './MobileSearchModal';

export function MobileSearchTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full h-14 flex items-center gap-3 rounded-full border-2 border-gray-200 bg-white shadow-md hover:shadow-lg px-5 text-gray-900 transition-shadow"
      >
        <Search className="h-5 w-5 text-gray-900" />
        <span className="text-base font-normal">Start your search</span>
      </button>
      
      <MobileSearchModal open={open} onOpenChange={setOpen} />
    </>
  );
}
