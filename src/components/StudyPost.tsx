import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface StudyPostProps {
  id: string;
  title: string;
  content: string;
  author: string;
  upvotes: number;
  comments: number;
  subject: string;
  grade: string;
  stream: string;
  country: string;
  timeAgo: string;
}

const StudyPost = ({
  title,
  content,
  author,
  upvotes,
  comments,
  subject,
  grade,
  stream,
  country,
  timeAgo,
}: StudyPostProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-success">
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold">{upvotes}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{subject}</Badge>
              <Badge variant="outline">{grade}</Badge>
              <Badge variant="outline">{stream}</Badge>
              <Badge variant="outline">{country}</Badge>
            </div>
            <h3 className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Posted by u/{author} • {timeAgo}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{content}</p>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {comments} Comments
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Bookmark className="h-4 w-4" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyPost;
