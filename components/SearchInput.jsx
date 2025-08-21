"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({
  initialValue = "",
  placeholder = "Search...",
  debounceMs = 300,
  className = "",
  onSearchChange,
}) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef(null);
  const lastSearchRef = useRef(initialValue);
  const inputRef = useRef(null);

  // Sync local state with URL
  useEffect(() => {
    const urlValue = searchParams.get("search") || "";
    if (urlValue !== lastSearchRef.current) {
      setSearchValue(urlValue);
      lastSearchRef.current = urlValue;
      setIsSearching(false);
    }
  }, [searchParams]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Update URL with search
  const updateURL = useCallback(
    (value) => {
      const trimmed = value.trim();
      const params = new URLSearchParams(searchParams);

      if (trimmed === "") params.delete("search");
      else {
        params.set("search", trimmed);

        params.delete("workspace");
      }

      if (trimmed !== lastSearchRef.current) {
        params.set("page", "1");
      }

      const newUrl = `${pathname}?${params.toString()}`;
      const currentUrl = `${pathname}?${searchParams.toString()}`;
      if (newUrl !== currentUrl) router.push(newUrl, { scroll: false });

      lastSearchRef.current = trimmed;
      setIsSearching(false);
      onSearchChange?.(trimmed);
    },
    [pathname, router, searchParams, onSearchChange]
  );

  // Handle input changes
  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setSearchValue(val);
      setIsSearching(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => updateURL(val), debounceMs);
    },
    [updateURL, debounceMs]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchValue("");
    setIsSearching(false);
    updateURL("");
    inputRef.current?.focus();
  }, [updateURL]);

  // Handle Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (searchValue) clearSearch();
        else inputRef.current?.blur();
      }
    },
    [searchValue, clearSearch]
  );

  return (
    <div className={cn("relative w-full", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-10 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        autoComplete="off"
      />

      {searchValue && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
