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
      blue: "bg-blue-500",
      green: "bg-green-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      cyan: "bg-cyan-500",
    };
    return colors[color] || "bg-blue-500";
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
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Input
              value={newNodeContent}
              onChange={e => setNewNodeContent(e.target.value)}
              placeholder="New node..."
              className="w-40"
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

        <div
          ref={canvasRef}
          className="relative w-full h-[500px] bg-muted/30 rounded-lg overflow-hidden border"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {nodes.map(node => {
              if (!node.parent_id) return null;
              const parent = nodes.find(n => n.id === node.parent_id);
              if (!parent) return null;
              return (
                <line
                  key={`line-${node.id}`}
                  x1={parent.position_x}
                  y1={parent.position_y}
                  x2={node.position_x}
                  y2={node.position_y}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-muted-foreground/50"
                />
              );
            })}
          </svg>

          <div style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}>
            {nodes.map(node => (
              <div
                key={node.id}
                className={cn(
                  "absolute cursor-move select-none px-3 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-shadow",
                  getColorClass(node.color),
                  selectedNode === node.id && "ring-2 ring-white ring-offset-2",
                  draggingNode === node.id && "opacity-70"
                )}
                style={{
                  left: node.position_x - 50,
                  top: node.position_y - 15,
                  minWidth: "100px",
                  textAlign: "center",
                }}
                onMouseDown={e => handleMouseDown(e, node.id)}
                onClick={e => { e.stopPropagation(); setSelectedNode(node.id === selectedNode ? null : node.id); }}
              >
                {node.content}
                {selectedNode === node.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full"
                    onClick={e => { e.stopPropagation(); deleteNodeMutation.mutate(node.id); }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Click a node to select it, then add child nodes. Drag nodes to reposition them.
        </p>
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