import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 type-micro", {
  variants: {
    tone: {
      shared: "bg-brand-soft text-brand-strong",
      private: "bg-surface-2 text-ink-muted",
      roee: "bg-person-roee-soft text-person-roee",
      aviv: "bg-person-aviv-soft text-person-aviv",
      soon: "bg-surface-2 text-ink-muted",
    },
  },
  defaultVariants: {
    tone: "shared",
  },
});

function Badge({ className, tone, ...props }) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export { Badge };
