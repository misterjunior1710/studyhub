import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pencil, Square, Circle, Type, Eraser, Trash2, 
  Save, Loader2, MousePointer, Minus 
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

const Whiteboard = ({ whiteboardId, groupId, isReadOnly = false }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  // Load whiteboard data
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
          const canvasData = typeof data.canvas_data === 'string' 
            ? JSON.parse(data.canvas_data) 
            : data.canvas_data;
          setElements(canvasData.elements || []);
        }
      } catch (error) {
        console.error("Error loading whiteboard:", error);
        toast.error("Failed to load whiteboard");
      } finally {
        setLoading(false);
      }
    };

    loadWhiteboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`whiteboard_${whiteboardId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "whiteboards",
          filter: `id=eq.${whiteboardId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          if (newData?.canvas_data) {
            const canvasData = typeof newData.canvas_data === 'string'
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

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach((el) => {
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
            ctx.arc(el.x, el.y, el.width / 2, 0, Math.PI * 2);
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
            ctx.font = `${el.strokeWidth * 8}px sans-serif`;
            ctx.fillText(el.text, el.x, el.y);
          }
          break;
      }
    });

    // Draw current element being drawn
    if (currentElement) {
      ctx.strokeStyle = currentElement.color;
      ctx.fillStyle = currentElement.color;
      ctx.lineWidth = currentElement.strokeWidth;

      switch (currentElement.type) {
        case "pencil":
          if (currentElement.points && currentElement.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(currentElement.points[0], currentElement.points[1]);
            for (let i = 2; i < currentElement.points.length; i += 2) {
              ctx.lineTo(currentElement.points[i], currentElement.points[i + 1]);
            }
            ctx.stroke();
          }
          break;
        case "rectangle":
          if (currentElement.x !== undefined && currentElement.y !== undefined && 
              currentElement.width !== undefined && currentElement.height !== undefined) {
            ctx.strokeRect(currentElement.x, currentElement.y, currentElement.width, currentElement.height);
          }
          break;
        case "circle":
          if (currentElement.x !== undefined && currentElement.y !== undefined && currentElement.width !== undefined) {
            ctx.beginPath();
            ctx.arc(currentElement.x, currentElement.y, currentElement.width / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        case "line":
          if (currentElement.points && currentElement.points.length >= 4) {
            ctx.beginPath();
            ctx.moveTo(currentElement.points[0], currentElement.points[1]);
            ctx.lineTo(currentElement.points[2], currentElement.points[3]);
            ctx.stroke();
          }
          break;
      }
    }
  }, [elements, currentElement]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    
    const pos = getMousePos(e);

    if (tool === "text") {
      setTextPosition(pos);
      return;
    }

    if (tool === "eraser") {
      // Find and remove element at position
      const updatedElements = elements.filter((el) => {
        if (el.type === "pencil" && el.points) {
          for (let i = 0; i < el.points.length; i += 2) {
            const dx = el.points[i] - pos.x;
            const dy = el.points[i + 1] - pos.y;
            if (Math.sqrt(dx * dx + dy * dy) < 20) return false;
          }
        }
        return true;
      });
      setElements(updatedElements);
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || isReadOnly) return;

    const pos = getMousePos(e);

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

  const handleMouseUp = () => {
    if (!isDrawing || !currentElement) return;
    setIsDrawing(false);
    setElements([...elements, currentElement]);
    setCurrentElement(null);
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

    setElements([...elements, newElement]);
    setTextPosition(null);
    setTextInput("");
  };

  const saveWhiteboard = useCallback(async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("whiteboards")
        .update({
          canvas_data: JSON.stringify({ elements, background: "#ffffff" }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", whiteboardId);

      if (error) throw error;
      toast.success("Whiteboard saved");
    } catch (error) {
      console.error("Error saving whiteboard:", error);
      toast.error("Failed to save whiteboard");
    } finally {
      setSaving(false);
    }
  }, [elements, whiteboardId]);

  const clearCanvas = () => {
    setElements([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Whiteboard</span>
          {!isReadOnly && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button
                size="sm"
                onClick={saveWhiteboard}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b">
            <Button
              variant={tool === "select" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("select")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "pencil" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("pencil")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "line" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("line")}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "rectangle" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("rectangle")}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "circle" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("circle")}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "text" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("text")}
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === "eraser" ? "default" : "outline"}
              size="icon"
              onClick={() => setTool("eraser")}
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <Input
                type="number"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                min={1}
                max={20}
                className="w-16"
              />
            </div>
          </div>
        )}

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            className="border rounded-lg bg-white cursor-crosshair w-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          {textPosition && (
            <div
              className="absolute"
              style={{ left: textPosition.x, top: textPosition.y }}
            >
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
                className="w-40"
                placeholder="Type text..."
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Whiteboard;