import { Button } from "@/components/ui/button";

export type NewsCategory = "All" | "India" | "Global" | "Technology" | "Banking" | "Energy";

interface NewsFilterProps {
  selected: NewsCategory;
  onSelect: (category: NewsCategory) => void;
}

export default function NewsFilter({ selected, onSelect }: NewsFilterProps) {
  const categories: NewsCategory[] = ["All", "India", "Global", "Technology", "Banking", "Energy"];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? "default" : "ghost"}
          size="sm"
          onClick={() => onSelect(category)}
          data-testid={`button-filter-${category.toLowerCase()}`}
          className="flex-shrink-0"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
