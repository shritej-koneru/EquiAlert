import { useState } from 'react';
import NewsFilter, { NewsCategory } from '../NewsFilter';

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
