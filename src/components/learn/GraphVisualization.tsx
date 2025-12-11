import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GraphNode {
  id: string;
  value: number | string;
  x: number;
  y: number;
  visited?: boolean;
  current?: boolean;
  level?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  highlighted?: boolean;
}

interface GraphVisualizationProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  nodeRadius?: number;
  directed?: boolean;
  onNodeClick?: (node: GraphNode) => void;
}

export function GraphVisualization({
  nodes,
  edges,
  width = 400,
  height = 300,
  nodeRadius = 22,
  directed = false,
  onNodeClick,
}: GraphVisualizationProps) {
  if (nodes.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border"
        style={{ width, height }}
      >
        <p className="text-muted-foreground">Graph is empty</p>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Defs for arrow markers */}
      {directed && (
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-border"
            />
          </marker>
          <marker
            id="arrowhead-highlighted"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              className="fill-primary"
            />
          </marker>
        </defs>
      )}

      {/* Edges */}
      {edges.map((edge) => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        // Calculate edge endpoints (accounting for node radius)
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offsetX = (dx / dist) * nodeRadius;
        const offsetY = (dy / dist) * nodeRadius;

        return (
          <motion.line
            key={`${edge.from}-${edge.to}`}
            x1={fromNode.x + offsetX}
            y1={fromNode.y + offsetY}
            x2={toNode.x - offsetX}
            y2={toNode.y - offsetY}
            className={cn(
              'transition-colors duration-300',
              edge.highlighted ? 'stroke-primary' : 'stroke-border'
            )}
            strokeWidth={edge.highlighted ? 3 : 2}
            markerEnd={directed ? (edge.highlighted ? 'url(#arrowhead-highlighted)' : 'url(#arrowhead)') : undefined}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3 }}
          />
        );
      })}

      {/* Nodes */}
      <AnimatePresence>
        {nodes.map((node) => (
          <motion.g
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {/* Level indicator for BFS */}
            {node.level !== undefined && (
              <text
                x={node.x}
                y={node.y - nodeRadius - 8}
                textAnchor="middle"
                className="text-[10px] fill-muted-foreground"
              >
                L{node.level}
              </text>
            )}

            {/* Node circle */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={nodeRadius}
              className={cn(
                'transition-colors duration-300',
                node.current 
                  ? 'fill-warning stroke-warning' 
                  : node.visited
                    ? 'fill-success stroke-success'
                    : 'fill-card stroke-border'
              )}
              strokeWidth={3}
              onClick={() => onNodeClick?.(node)}
              cursor={onNodeClick ? 'pointer' : 'default'}
              animate={node.current ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: node.current ? Infinity : 0 }}
            />
            
            {/* Node value */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                'text-sm font-semibold pointer-events-none select-none',
                (node.current || node.visited)
                  ? 'fill-primary-foreground'
                  : 'fill-foreground'
              )}
            >
              {node.value}
            </text>
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}