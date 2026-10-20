import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      <Skeleton static className="h-4 w-24" />
      <Skeleton static className="h-11 w-40" />
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton static className="size-10 rounded-md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton static className="h-4 w-1/2" />
            <Skeleton static className="h-3 w-1/3" />
          </div>
          <Skeleton static className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[1120px] flex-col gap-4 bg-background px-4 py-6">
      <span className="sr-only" role="status">
        טוען
      </span>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
