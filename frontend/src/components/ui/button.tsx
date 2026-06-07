"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

const VARIANTS = {
  primary:
    "bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-colors",
  secondary:
    "border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
  ghost:
    "text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2 text-sm transition-colors",
};

export function Button({
  variant = "secondary",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 spin-slow" />}
      {children}
    </button>
  );
}
