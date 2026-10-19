import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md px-4 type-body-strong disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-action text-on-action",
        secondary: "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--border-strong)]",
        ghost: "bg-transparent text-brand-strong",
        destructive: "bg-coral-soft text-coral-strong",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-11 px-3",
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
