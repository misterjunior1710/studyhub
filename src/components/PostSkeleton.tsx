import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PostSkeleton = () => {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Vote buttons skeleton */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          
          <div className="flex-1 space-y-3">
            {/* Badges skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>
            
            {/* Title skeleton */}
            <Skeleton className="h-6 w-full max-w-md" />
            
            {/* Author and time skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <span className="text-muted-foreground">•</span>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Content skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[75%]" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export const PostSkeletonList = memo(({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
});

PostSkeletonList.displayName = "PostSkeletonList";

export default memo(PostSkeleton);
