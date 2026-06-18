
// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import Input from './ui/Input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'ابحث عن خدمات...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1"
      />
      <button className="px-6 py-2 bg-fekrti-primary text-white rounded-lg hover:bg-fekrti-primary/90">
        🔍
      </button>
    </div>
  );
}
