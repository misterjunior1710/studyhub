import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Network, ZoomIn, ZoomOut, Move } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MindMap {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
}

interface MindMapNode {
  id: string;
  mind_map_id: string;
  parent_id: string | null;
  content: string;
  color: string;
  position_x: number;
  position_y: number;
}

const COLORS = ["blue", "green", "purple", "orange", "pink", "cyan"];

export function MindMapBuilder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedMap, setSelectedMap] = useState<MindMap | null>(null);
  const [createMapOpen, setCreateMapOpen] = useState(false);
  const [newMap, setNewMap] = useState({ title: "", description: "", is_public: false });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [newNodeContent, setNewNodeContent] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { data: maps = [], isLoading: mapsLoading } = useQuery({
    queryKey: ["mind-maps", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mind_maps")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MindMap[];
    },
    enabled: !!user,
  });

  const { data: nodes = [] } = useQuery({
    queryKey: ["mind-map-nodes", selectedMap?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mind_map_nodes")
        .select("*")
        .eq("mind_map_id", selectedMap!.id);
      if (error) throw error;
      return data as MindMapNode[];
    },
    enabled: !!selectedMap,
  });

  const createMapMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from("mind_maps").insert({
        user_id: user!.id,
        title: newMap.title,
        description: newMap.description || null,
        is_public: newMap.is_public,
      }).select().single();
      if (error) throw error;
      
      // Create root node
      await supabase.from("mind_map_nodes").insert({
        mind_map_id: data.id,
        content: newMap.title,
        color: "blue",
        position_x: 400,
        position_y: 200,
      });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind-maps"] });
      setCreateMapOpen(false);
      setNewMap({ title: "", description: "", is_public: false });
      toast.success("Mind map created!");
    },
  });

  const addNodeMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string | null; content: string }) => {
      const parentNode = parentId ? nodes.find(n => n.id === parentId) : null;
      const { error } = await supabase.from("mind_map_nodes").insert({
        mind_map_id: selectedMap!.id,
        parent_id: parentId,
        content,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position_x: parentNode ? parentNode.position_x + 150 : 400,
        position_y: parentNode ? parentNode.position_y + (Math.random() - 0.5) * 100 : 200,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind-map-nodes"] });
      setNewNodeContent("");
      toast.success("Node added!");
    },
  });

  const updateNodePositionMutation = useMutation({
    mutationFn: async ({ nodeId, x, y }: { nodeId: string; x: number; y: number }) => {
      const { error } = await supabase.from("mind_map_nodes").update({
        position_x: x,
        position_y: y,
      }).eq("id", nodeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind-map-nodes"] });
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      const { error } = await supabase.from("mind_map_nodes").delete().eq("id", nodeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind-map-nodes"] });
      setSelectedNode(null);
      toast.success("Node deleted");
    },
  });

  const deleteMapMutation = useMutation({
    mutationFn: async (mapId: string) => {
      const { error } = await supabase.from("mind_maps").delete().eq("id", mapId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mind-maps"] });
      setSelectedMap(null);
      toast.success("Mind map deleted");
    },
  });

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggingNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      const node = nodes.find(n => n.id === draggingNode);
      if (node) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        updateNodePositionMutation.mutate({
          nodeId: draggingNode,
          x: node.position_x + dx,
          y: node.position_y + dy,
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500 shadow-blue-500/30",
      green: "bg-green-500 shadow-green-500/30",
      purple: "bg-purple-500 shadow-purple-500/30",
      orange: "bg-orange-500 shadow-orange-500/30",
      pink: "bg-pink-500 shadow-pink-500/30",
      cyan: "bg-cyan-500 shadow-cyan-500/30",
    };
    return colors[color] || "bg-blue-500 shadow-blue-500/30";
  };

  const getBorderColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "stroke-blue-400",
      green: "stroke-green-400",
      purple: "stroke-purple-400",
      orange: "stroke-orange-400",
      pink: "stroke-pink-400",
      cyan: "stroke-cyan-400",
    };
    return colors[color] || "stroke-blue-400";
  };

  if (selectedMap) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Button variant="ghost" onClick={() => setSelectedMap(null)} className="mb-2">
              ← Back to Mind Maps
            </Button>
            <h3 className="text-xl font-semibold">{selectedMap.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Click a node to select it, then add child nodes. Drag to reposition.
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <span className="text-xs font-mono px-2">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 items-center">
              <Input
                value={newNodeContent}
                onChange={e => setNewNodeContent(e.target.value)}
                placeholder="New node..."
                className="w-32 sm:w-40"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newNodeContent) {
                    addNodeMutation.mutate({ parentId: selectedNode, content: newNodeContent });
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => addNodeMutation.mutate({ parentId: selectedNode, content: newNodeContent })}
                disabled={!newNodeContent}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={canvasRef}
          className="relative w-full h-[500px] bg-gradient-to-br from-muted/30 via-background to-muted/20 rounded-xl overflow-hidden border-2 border-dashed border-muted"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid pattern background */}
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            <defs>
              <linearGradient id="lineGradient" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="hsl(var(--primary) / 0.6)" />
                <stop offset="100%" stopColor="hsl(var(--accent) / 0.6)" />
              </linearGradient>
            </defs>
            {nodes.map(node => {
              if (!node.parent_id) return null;
              const parent = nodes.find(n => n.id === node.parent_id);
              if (!parent) return null;
              
              // Calculate control points for curved lines
              const midX = (parent.position_x + node.position_x) / 2;
              const midY = (parent.position_y + node.position_y) / 2;
              const dx = node.position_x - parent.position_x;
              const curveOffset = Math.min(Math.abs(dx) * 0.3, 50);
              
              return (
                <g key={`line-${node.id}`}>
                  {/* Shadow line */}
                  <path
                    d={`M ${parent.position_x} ${parent.position_y} Q ${midX} ${parent.position_y + curveOffset} ${node.position_x} ${node.position_y}`}
                    fill="none"
                    stroke="hsl(var(--muted-foreground) / 0.1)"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Main line */}
                  <path
                    d={`M ${parent.position_x} ${parent.position_y} Q ${midX} ${parent.position_y + curveOffset} ${node.position_x} ${node.position_y}`}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all"
                  />
                </g>
              );
            })}
          </svg>

          <div style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {nodes.map(node => {
              const isRoot = !node.parent_id;
              return (
                <div
                  key={node.id}
                  className={cn(
                    "absolute cursor-move select-none px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200",
                    getColorClass(node.color),
                    isRoot ? "text-base px-5 py-3 font-semibold" : "",
                    selectedNode === node.id && "ring-2 ring-white ring-offset-2 ring-offset-background scale-105",
                    draggingNode === node.id && "opacity-70 scale-110 cursor-grabbing"
                  )}
                  style={{
                    left: node.position_x - (isRoot ? 60 : 50),
                    top: node.position_y - (isRoot ? 20 : 15),
                    minWidth: isRoot ? "120px" : "100px",
                    textAlign: "center",
                    boxShadow: `0 4px 20px -4px`,
                  }}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onClick={e => { e.stopPropagation(); setSelectedNode(node.id === selectedNode ? null : node.id); }}
                >
                  {node.content}
                  {selectedNode === node.id && !isRoot && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-lg"
                      onClick={e => { e.stopPropagation(); deleteNodeMutation.mutate(node.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Drag nodes to arrange • Click to select • Add children to selected node
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mind Maps</h3>
          <p className="text-sm text-muted-foreground">Visually connect ideas and concepts</p>
        </div>
        <Dialog open={createMapOpen} onOpenChange={setCreateMapOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Mind Map</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Mind Map</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title (Root Node)</Label>
                <Input value={newMap.title} onChange={e => setNewMap(p => ({ ...p, title: e.target.value }))} placeholder="Main Topic" />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Input value={newMap.description} onChange={e => setNewMap(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newMap.is_public} onCheckedChange={v => setNewMap(p => ({ ...p, is_public: v }))} />
                <Label>Make public</Label>
              </div>
              <Button onClick={() => createMapMutation.mutate()} disabled={!newMap.title}>
                Create Mind Map
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mapsLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading mind maps...</div>
      ) : maps.length === 0 ? (
        <Card className="p-8 text-center">
          <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No mind maps yet. Create your first one!</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {maps.map(map => (
            <Card key={map.id} className="p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedMap(map)}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{map.title}</h4>
                  {map.description && <p className="text-sm text-muted-foreground">{map.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteMapMutation.mutate(map.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}