import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green" | "red" | "orange" | "amber"
  | "blue" | "gray" | "emerald" | "yellow" | "teal";

const VARIANTS: Record<BadgeVariant, string> = {
  green:   "bg-green-100 text-green-700",
  red:     "bg-red-100 text-red-700",
  orange:  "bg-orange-100 text-orange-700",
  amber:   "bg-amber-100 text-amber-700",
  blue:    "bg-blue-100 text-blue-700",
  gray:    "bg-gray-100 text-gray-600",
  emerald: "bg-emerald-100 text-emerald-700",
  yellow:  "bg-yellow-100 text-yellow-700",
  teal:    "bg-teal-100 text-teal-700",
};

export function Badge({
  variant = "gray",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
