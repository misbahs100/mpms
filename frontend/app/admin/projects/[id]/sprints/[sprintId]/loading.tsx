import { Skeleton } from "../../../../../../components/ui/Skeleton";

export default function SprintTasksLoading() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-7 w-1/4" />

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded shadow flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}
