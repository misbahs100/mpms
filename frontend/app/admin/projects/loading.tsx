import { Skeleton } from "../../../components/ui/Skeleton";

export default function LoadingProjects() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded shadow">
          <Skeleton className="h-40 w-full mb-3" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
