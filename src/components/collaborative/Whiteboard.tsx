import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil, Square, Circle, Type, Eraser, Trash2,
  Save, Loader2, MousePointer, Minus, Check
} from "lucide-react";
import { toast } from "sonner";

interface WhiteboardElement {
  id: string;
  type: "pencil" | "rectangle" | "circle" | "text" | "line";
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
}

interface WhiteboardProps {
  whiteboardId: string;
  groupId: string;
  isReadOnly?: boolean;
}

const CANVAS_W = 1200;
const CANVAS_H = 750;

const Whiteboard = ({ whiteboardId, isReadOnly = false }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [tool, setTool] = useState<"select" | "pencil" | "rectangle" | "circle" | "text" | "line" | "eraser">("pencil");
  const [color, setColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<WhiteboardElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const ignoreNextRemoteRef = useRef(false);

  // Load whiteboard data + realtime subscription
  useEffect(() => {
    const loadWhiteboard = async () => {
      try {
        const { data, error } = await supabase
          .from("whiteboards")
          .select("canvas_data")
          .eq("id", whiteboardId)
          .single();

        if (error) throw error;

        if (data?.canvas_data) {
          const canvasData = typeof data.canvas_data === "string"
            ? JSON.parse(data.canvas_data)
            : data.canvas_data;
          setElements(canvasData.elements || []);
        }
      } catch (err) {
        console.error("Error loading whiteboard:", err);
        toast.error("Failed to load whiteboard");
      } finally {
        setLoading(false);
      }
    };

    loadWhiteboard();

    const channel = supabase
      .channel(`whiteboard_${whiteboardId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "whiteboards", filter: `id=eq.${whiteboardId}` },
        (payload) => {
          if (ignoreNextRemoteRef.current) {
            ignoreNextRemoteRef.current = false;
            return;
          }
          const newData = payload.new as any;
          if (newData?.canvas_data) {
            const canvasData = typeof newData.canvas_data === "string"
              ? JSON.parse(newData.canvas_data)
              : newData.canvas_data;
            setElements(canvasData.elements || []);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [whiteboardId]);

  // Render canvas (uses fixed internal resolution; CSS scales it visually)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawElement = (el: WhiteboardElement) => {
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      switch (el.type) {
        case "pencil":
          if (el.points && el.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(el.points[0], el.points[1]);
            for (let i = 2; i < el.points.length; i += 2) {
              ctx.lineTo(el.points[i], el.points[i + 1]);
            }
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined && el.height !== undefined) {
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
          break;
        case "circle":
          if (el.x !== undefined && el.y !== undefined && el.width !== undefined) {
            ctx.beginPath();
            ctx.arc(el.x, el.y, Math.abs(el.width) / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        case "line":
          if (el.points && el.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(el.points[0], el.points[1]);
            ctx.lineTo(el.points[2], el.points[3]);
            ctx.stroke();
          }
          break;
        case "text":
          if (el.x !== undefined && el.y !== undefined && el.text) {
            ctx.font = `${Math.max(12, el.strokeWidth * 8)}px sans-serif`;
            ctx.fillText(el.text, el.x, el.y);
          }
          break;
      }
    };

    elements.forEach(drawElement);
    if (currentElement) drawElement(currentElement);
  }, [elements, currentElement]);

  // Map pointer event to canvas internal coordinates (handles CSS scaling)
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    // Allow non-primary buttons to fall through (eg right-click)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);

    const pos = getPointerPos(e);

    if (tool === "text") {
      setTextPosition(pos);
      return;
    }

    if (tool === "eraser") {
      const updated = elements.filter((el) => {
        if (el.type === "pencil" && el.points) {
          for (let i = 0; i < el.points.length; i += 2) {
            const dx = el.points[i] - pos.x;
            const dy = el.points[i + 1] - pos.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) return false;
          }
        } else if ((el.type === "rectangle" || el.type === "circle") && el.x !== undefined && el.y !== undefined) {
          const dx = (el.x + (el.width || 0) / 2) - pos.x;
          const dy = (el.y + (el.height || 0) / 2) - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < 40) return false;
        } else if (el.type === "text" && el.x !== undefined && el.y !== undefined) {
          if (Math.abs(el.x - pos.x) < 60 && Math.abs(el.y - pos.y) < 24) return false;
        } else if (el.type === "line" && el.points && el.points.length >= 4) {
          const dx = (el.points[0] + el.points[2]) / 2 - pos.x;
          const dy = (el.points[1] + el.points[3]) / 2 - pos.y;
          if (Math.sqrt(dx * dx + dy * dy) < 30) return false;
        }
        return true;
      });
      setElements(updated);
      setDirty(true);
      return;
    }

    setIsDrawing(true);
    const newElement: WhiteboardElement = {
      id: crypto.randomUUID(),
      type: tool === "select" ? "pencil" : tool,
      color,
      strokeWidth,
    };
    if (tool === "pencil") {
      newElement.points = [pos.x, pos.y];
    } else if (tool === "rectangle" || tool === "circle") {
      newElement.x = pos.x;
      newElement.y = pos.y;
      newElement.width = 0;
      newElement.height = 0;
    } else if (tool === "line") {
      newElement.points = [pos.x, pos.y, pos.x, pos.y];
    }
    setCurrentElement(newElement);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || isReadOnly) return;
    const pos = getPointerPos(e);
    const updated = { ...currentElement };
    if (currentElement.type === "pencil" && updated.points) {
      updated.points = [...updated.points, pos.x, pos.y];
    } else if (currentElement.type === "rectangle" || currentElement.type === "circle") {
      updated.width = pos.x - (currentElement.x || 0);
      updated.height = pos.y - (currentElement.y || 0);
    } else if (currentElement.type === "line" && updated.points) {
      updated.points = [updated.points[0], updated.points[1], pos.x, pos.y];
    }
    setCurrentElement(updated);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try { (e.currentTarget as HTMLCanvasElement).releasePointerCapture(e.pointerId); } catch {}
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);
    setElements((prev) => [...prev, currentElement]);
    setCurrentElement(null);
    setDirty(true);
  };

  const handleTextSubmit = () => {
    if (!textPosition || !textInput.trim()) {
      setTextPosition(null);
      setTextInput("");
      return;
    }
    const newElement: WhiteboardElement = {
      id: crypto.randomUUID(),
      type: "text",
      x: textPosition.x,
      y: textPosition.y,
      text: textInput,
      color,
      strokeWidth,
    };
    setElements((prev) => [...prev, newElement]);
    setTextPosition(null);
    setTextInput("");
    setDirty(true);
  };

  const saveWhiteboard = useCallback(async (silent = false) => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      ignoreNextRemoteRef.current = true;
      const { error } = await supabase
        .from("whiteboards")
        .update({
          canvas_data: JSON.stringify({ elements, background: "#ffffff" }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", whiteboardId);
      if (error) throw error;
      setDirty(false);
      setLastSavedAt(Date.now());
      if (!silent) toast.success("Whiteboard saved");
    } catch (err) {
      console.error("Error saving whiteboard:", err);
      if (!silent) toast.error("Failed to save whiteboard");
    } finally {
      setSaving(false);
    }
  }, [elements, whiteboardId, isReadOnly]);

  // Debounced autosave whenever elements change after first load
  useEffect(() => {
    if (loading || isReadOnly || !dirty) return;
    const t = window.setTimeout(() => { saveWhiteboard(true); }, 1500);
    return () => window.clearTimeout(t);
  }, [elements, dirty, loading, isReadOnly, saveWhiteboard]);

  // Best-effort save on unload
  useEffect(() => {
    const handler = () => {
      if (dirty && !isReadOnly) {
        try {
          // fire-and-forget; browser may not wait
          supabase.from("whiteboards").update({
            canvas_data: JSON.stringify({ elements, background: "#ffffff" }),
            updated_at: new Date().toISOString(),
          }).eq("id", whiteboardId).then(() => {});
        } catch {}
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, elements, whiteboardId, isReadOnly]);

  const clearCanvas = () => {
    setElements([]);
    setDirty(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const savedLabel = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : lastSavedAt
        ? "Saved"
        : "";

  // Compute the textbox screen position from the canvas internal coords
  const textboxScreen = (() => {
    if (!textPosition) return null;
    const canvas = canvasRef.current;
    if (!canvas) return { left: textPosition.x, top: textPosition.y };
    const rect = canvas.getBoundingClientRect();
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      left: textPosition.x * scaleX + (rect.left - (wrapperRect?.left ?? rect.left)),
      top: textPosition.y * scaleY + (rect.top - (wrapperRect?.top ?? rect.top)) - 8,
    };
  })();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between gap-2">
          <span>Whiteboard</span>
          {!isReadOnly && (
            <div className="flex gap-2 items-center">
              <span className="text-xs text-muted-foreground hidden sm:inline-flex items-center gap-1">
                {!dirty && lastSavedAt && <Check className="h-3 w-3 text-success" />}
                {savedLabel}
              </span>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" onClick={() => saveWhiteboard(false)} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
            <Button variant={tool === "select" ? "default" : "outline"} size="icon" onClick={() => setTool("select")} aria-label="Select tool">
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button variant={tool === "pencil" ? "default" : "outline"} size="icon" onClick={() => setTool("pencil")} aria-label="Pencil tool">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant={tool === "line" ? "default" : "outline"} size="icon" onClick={() => setTool("line")} aria-label="Line tool">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant={tool === "rectangle" ? "default" : "outline"} size="icon" onClick={() => setTool("rectangle")} aria-label="Rectangle tool">
              <Square className="h-4 w-4" />
            </Button>
            <Button variant={tool === "circle" ? "default" : "outline"} size="icon" onClick={() => setTool("circle")} aria-label="Circle tool">
              <Circle className="h-4 w-4" />
            </Button>
            <Button variant={tool === "text" ? "default" : "outline"} size="icon" onClick={() => setTool("text")} aria-label="Text tool">
              <Type className="h-4 w-4" />
            </Button>
            <Button variant={tool === "eraser" ? "default" : "outline"} size="icon" onClick={() => setTool("eraser")} aria-label="Eraser tool">
              <Eraser className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
                aria-label="Stroke color"
              />
              <Input
                type="number"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                min={1}
                max={20}
                className="w-16"
                aria-label="Stroke width"
              />
            </div>
          </div>
        )}

        <div className="relative" ref={wrapperRef}>
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="border rounded-lg bg-white cursor-crosshair w-full touch-none select-none"
            style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
          {textPosition && textboxScreen && (
            <div className="absolute z-10" style={{ left: textboxScreen.left, top: textboxScreen.top }}>
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTextSubmit();
                  if (e.key === "Escape") {
                    setTextPosition(null);
                    setTextInput("");
                  }
                }}
                onBlur={handleTextSubmit}
                autoFocus
                className="w-48"
                placeholder="Type text…"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Whiteboard;
