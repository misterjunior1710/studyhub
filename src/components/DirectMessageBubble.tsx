import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectMessageBubbleProps {
  content: string;
  createdAt: string;
  isSent: boolean;
  isRead: boolean;
}

const DirectMessageBubble = ({ content, createdAt, isSent, isRead }: DirectMessageBubbleProps) => {
  return (
    <div className={cn("flex w-full mb-3", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
          isSent
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isSent ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-[10px]",
              isSent ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {format(new Date(createdAt), "h:mm a")}
          </span>
          {isSent && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
            ) : (
              <Check className="h-3 w-3 text-primary-foreground/70" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessageBubble;
