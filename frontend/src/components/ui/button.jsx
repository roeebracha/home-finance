import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md px-4 type-body-strong disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action",
        ghost: "bg-transparent text-brand-strong hover:bg-brand-soft",
        destructive: "bg-coral-soft text-coral-strong hover:bg-surface-2",
      },
      size: {
        default: "min-h-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({ className, variant, size, type = "button", ...props }) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { Button };
