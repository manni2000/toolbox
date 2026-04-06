import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
}

export const SkeletonLoader = ({ className, lines = 3, height = "h-4" }: SkeletonLoaderProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-slate-700 rounded animate-pulse",
            height,
            i === lines - 1 && "w-3/4" // Last line is shorter
          )}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1.5s"
          }}
        />
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  className?: string;
}

export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div className={cn("bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-xl animate-pulse" />
        <div className="flex-1">
          <div className="h-4 sm:h-5 bg-slate-700 rounded animate-pulse mb-2 w-1/2" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
        </div>
      </div>
      <SkeletonLoader lines={2} />
    </div>
  );
};

interface ButtonSkeletonProps {
  className?: string;
  width?: string;
}

export const ButtonSkeleton = ({ className, width = "w-20" }: ButtonSkeletonProps) => {
  return (
    <div className={cn("h-9 bg-slate-700 rounded-lg animate-pulse", width, className)} />
  );
};

interface ResponseSkeletonProps {
  className?: string;
}

export const ResponseSkeleton = ({ className }: ResponseSkeletonProps) => {
  return (
    <div className={cn("bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-xl animate-pulse" />
        <div className="flex-1">
          <div className="h-4 sm:h-5 bg-slate-700 rounded animate-pulse mb-2 w-1/3" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="bg-slate-950/50 border border-slate-700 rounded-lg p-4">
        <div className="space-y-2">
          <div className="h-3 bg-slate-700 rounded animate-pulse w-full" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-4/5" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
        </div>
      </div>
    </div>
  );
};
