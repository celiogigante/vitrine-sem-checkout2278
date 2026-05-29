import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AutocompleteInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  suggestions: string[];
  value: string;
  onValueChange: (val: string) => void;
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ suggestions, value, onValueChange, className, placeholder, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filtered, setFiltered] = useState<string[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!value) {
        setFiltered(suggestions);
      } else {
        const query = value.toLowerCase();
        setFiltered(
          suggestions.filter((item) => item.toLowerCase().includes(query))
        );
      }
    }, [value, suggestions]);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div ref={containerRef} className="relative w-full">
        <Input
          {...props}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={cn("pr-8", className)}
          ref={ref}
          autoComplete="off"
        />
        {isOpen && filtered.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border border-input rounded-md shadow-md max-h-48 overflow-y-auto">
            <ul className="p-1">
              {filtered.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    onValueChange(item);
                    setIsOpen(false);
                  }}
                  className="px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
AutocompleteInput.displayName = "AutocompleteInput";

export { AutocompleteInput };
