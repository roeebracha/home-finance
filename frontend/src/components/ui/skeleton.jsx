import { cn } from "@/lib/utils";

function Skeleton({ className, static: isStatic = false, ...props }) {
  return (
    <div
      className={cn("skeleton rounded-sm", isStatic && "skeleton-static", className)}
      {...props}
    />
  );
}

export { Skeleton };
