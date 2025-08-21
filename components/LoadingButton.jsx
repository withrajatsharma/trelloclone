"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

import React from "react";

const LoadingButton = ({
  isLoading,
  disabled = false,
  loadingText,
  children,
  type = "button",
  className,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "  rounded-md  text-[15px] select-none",
        (isLoading || disabled) && "opacity-70 cursor-not-allowed",
        "text-super-dark-gray rounded-lg font-semibold bg-gradient-to-br from-blue-100 to-blue-200 group sm:px-5  px-3 py-2 flex items-center gap-x-1 flex-shrink-0 transition-all duration-200 text-sm md:text-base  xl:text-h6 justify-center ",
        className
      )}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div
           
            className="h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2 animate-spin"
          />
          <span>{loadingText}</span>
        </div>
      ) : (
        <>
          {children}
          <div className="relative overflow-hidden ">
            <ArrowRight
              className="group-hover:translate-x-5 transition-all ease-in-out-circ duration-500"
              size={18}
            />
            <ArrowRight
              className="absolute top-0 -translate-x-5 group-hover:translate-x-0 transition-all duration-500 ease-in-out-circ"
              size={18}
            />
          </div>
        </>
      )}
    </button>
  );
};

export default LoadingButton;
