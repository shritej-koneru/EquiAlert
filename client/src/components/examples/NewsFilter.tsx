import { useState } from 'react';
import React from 'react';
import NewsFilter, { NewsCategory } from '@/components/NewsFilter';

export default function NewsFilterExample() {
  const [selected, setSelected] = useState<NewsCategory>("All");

  return (
    <div className="p-4">
      <NewsFilter
        selected={selected}
        onSelect={(category) => {
          console.log('Selected:', category);
          setSelected(category);
        }}
      />
    </div>
  );
}
