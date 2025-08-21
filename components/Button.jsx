// 'use client';
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const Button = ({ children, className,onclick, href = "#", ...props }) => {
  return (
    <Link
      href={href || "#"}
      onClick={onclick}
      {...props}
      className={cn(
        `rounded-lg font-semibold bg-gradient-to-br from-blue-100 to-blue-200 group sm:px-5  px-3 py-2 flex items-center gap-x-1 flex-shrink-0 transition-all duration-200 text-sm md:text-base  xl:text-h6 justify-center select-none`,
        className
      )}
    >
      <span>{children}</span>
      <div className="relative overflow-hidden ">
        <ArrowRight
          className="group-hover:translate-x-5 transition-all duration-500"
          size={18}
        />
        <ArrowRight
          className="absolute top-0 -translate-x-5 group-hover:translate-x-0 transition-all duration-500"
          size={18}
        />
      </div>
    </Link>
  );
};

export default Button;
