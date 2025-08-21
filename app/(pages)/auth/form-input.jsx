"use client";

import { cn } from "@/lib/utils";

export const FormInput = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  hasError,
  required = false,
  rightElement,
  className,
}) => {
  return (
    <div className="w-full">
      <div className="relative ">
        {Icon && (
          <div className="absolute inset-y-0 top-6 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-light-gray" />
          </div>
        )}

        <label htmlFor="" className="text-gray-400 text-xs">
          {label}
        </label>

        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "flex h-9 w-full rounded-md   bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            `h-11 pl-10 bg-white rounded-md text-[15px]
    ${
      hasError
        ? "ring-1 ring-red-400 border-red-400"
        : "md:border-light-gray/50 border-light-gray  "
    }
    ${rightElement ? "pr-10" : ""}
      focus:border-dim-gray focus:outline-none  border-[.2px]  outline-none focus-visible:ring-dim-gray focus-visible:ring-1`,
            className
          )}
          placeholder={placeholder}
          required={required}
          autoComplete={type === "password" ? "off" : "on"}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />

        {rightElement && (
          <div className="absolute inset-y-0 top-6 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};
