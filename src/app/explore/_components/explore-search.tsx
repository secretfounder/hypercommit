import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface ExploreSearchProps {
  placeholder: string;
}

export function ExploreSearch({ placeholder }: ExploreSearchProps) {
  return (
    <div className="w-full px-4 py-6">
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="w-full pl-9"
        />
      </div>
    </div>
  );
}
