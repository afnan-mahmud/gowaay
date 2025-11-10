'use client';

import { SearchBarLarge } from '@/components/home/SearchBarLarge';

export function HeaderSearchBar() {
  return (
    <div className="hidden md:block sticky top-14 z-40 bg-white/80 backdrop-blur border-b">
      <div className="container py-3">
        <SearchBarLarge variant="header" />
      </div>
    </div>
  );
}
