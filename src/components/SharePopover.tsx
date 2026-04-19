import { memo, useState } from "react";
import { Share2, Link2 } from "lucide-react";
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebook,
  FaTelegram,
  FaReddit,
  FaInstagram,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { shareToPlatform, formatShareCount, type SharePlatform } from "@/lib/share";

interface SharePopoverProps {
  postId: string;
  title: string;
  shareCount?: number;
  size?: "sm" | "default";
}

const PLATFORMS: Array<{
  key: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  { key: "whatsapp", label: "WhatsApp", icon: <FaWhatsapp className="h-4 w-4 text-[#25D366]" />, color: "hover:bg-green-500/10" },
  { key: "twitter", label: "Twitter / X", icon: <FaXTwitter className="h-4 w-4 text-foreground" />, color: "hover:bg-foreground/10" },
  { key: "facebook", label: "Facebook", icon: <FaFacebook className="h-4 w-4 text-[#1877F2]" />, color: "hover:bg-blue-500/10" },
  { key: "telegram", label: "Telegram", icon: <FaTelegram className="h-4 w-4 text-[#26A5E4]" />, color: "hover:bg-sky-500/10" },
  { key: "reddit", label: "Reddit", icon: <FaReddit className="h-4 w-4 text-[#FF4500]" />, color: "hover:bg-orange-500/10" },
  { key: "instagram", label: "Instagram", icon: <FaInstagram className="h-4 w-4 text-[#E4405F]" />, color: "hover:bg-pink-500/10" },
  { key: "copy", label: "Copy link", icon: <Link2 className="h-4 w-4 text-muted-foreground" />, color: "hover:bg-primary/10" },
];

const SharePopover = memo(({ postId, title, shareCount = 0, size = "sm" }: SharePopoverProps) => {
  const [count, setCount] = useState(shareCount);
  const [open, setOpen] = useState(false);

  const handleShare = async (platform: SharePlatform) => {
    setOpen(false);
    setCount((c) => c + 1);
    await shareToPlatform(platform, postId, title);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size={size} className="gap-2" aria-label="Share post">
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span>Share</span>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">{formatShareCount(count)}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid gap-1">
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => handleShare(p.key)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors ${p.color}`}
            >
              <span className="flex-shrink-0 w-5 flex items-center justify-center">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

SharePopover.displayName = "SharePopover";

export default SharePopover;
