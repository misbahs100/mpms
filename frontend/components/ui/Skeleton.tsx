type Props = {
    className?: string;
  };
  
  export  function Skeleton({ className = "" }: Props) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
      />
    );
  }

export function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded shadow flex justify-between">
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export function ProjectSkeleton() {
    return (
      <div className="space-y-3">
        {Array.from({ length: 1 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded shadow flex justify-between">
            <Skeleton className="h-4 w-60" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }


  export function ProjectCardSkeleton() {
    return (
      <div className="bg-white p-4 rounded shadow">
        {/* title */}
        <Skeleton className="h-5 w-3/4 mb-2" />
  
        {/* client */}
        <Skeleton className="h-4 w-1/2" />
        {/* tasks count */}
        <div className="mt-3">
          <Skeleton className="h-4 w-24" />
        </div>
          <div className="mt-3">
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    );
  }
  

  