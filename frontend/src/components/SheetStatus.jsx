import { Button } from "@/components/ui/button";
import { HeroSkeleton, ListSkeleton } from "@/components/skeletons";
import { useHousehold } from "@/data/HouseholdContext";

export default function SheetStatus({ children, skeleton = "list" }) {
  const { status, error, reload } = useHousehold();

  if (status === "loading") {
    return skeleton === "hero" ? <HeroSkeleton /> : <ListSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="rounded-md bg-coral-soft px-3 py-3" role="alert">
        <p className="type-body text-coral-strong">{error}</p>
        <Button variant="destructive" className="mt-3" onClick={reload}>
          נסו שוב
        </Button>
      </div>
    );
  }

  return children;
}
