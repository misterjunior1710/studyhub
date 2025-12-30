import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SkeletonBox = ({ className }: { className?: string }) => (
  <div 
    className={`bg-muted/60 rounded animate-skeleton-shimmer bg-gradient-to-r from-muted/60 via-muted/30 to-muted/60 bg-[length:200%_100%] ${className}`}
  />
);

const PostSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Vote buttons skeleton */}
          <div className="flex flex-col items-center gap-1">
            <SkeletonBox className="h-8 w-8 rounded-md" />
            <SkeletonBox className="h-4 w-6" />
            <SkeletonBox className="h-8 w-8 rounded-md" />
          </div>
          
          <div className="flex-1 space-y-3">
            {/* Badges skeleton */}
            <div className="flex flex-wrap gap-2">
              <SkeletonBox className="h-5 w-16 rounded-full" />
              <SkeletonBox className="h-5 w-20 rounded-full" />
              <SkeletonBox className="h-5 w-14 rounded-full" />
            </div>
            
            {/* Title skeleton */}
            <SkeletonBox className="h-6 w-full max-w-md" />
            
            {/* Author and time skeleton */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-24" />
              <span className="text-muted-foreground">•</span>
              <SkeletonBox className="h-4 w-16" />
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Content skeleton */}
        <div className="space-y-2 mb-4">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-[90%]" />
          <SkeletonBox className="h-4 w-[75%]" />
        </div>
        
        {/* Action buttons skeleton */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <SkeletonBox className="h-8 w-24 rounded-md" />
          <SkeletonBox className="h-8 w-20 rounded-md" />
          <SkeletonBox className="h-8 w-16 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export const PostSkeletonList = memo(({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PostSkeleton />
        </div>
      ))}
    </div>
  );
});

PostSkeletonList.displayName = "PostSkeletonList";

export default memo(PostSkeleton);
