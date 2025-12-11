import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface TreeNodeData {
  id: string;
  value: number | string;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  x?: number;
  y?: number;
  highlighted?: boolean;
  highlightColor?: string;
  visiting?: boolean;
}

interface TreeVisualizationProps {
  root: TreeNodeData | null;
  width?: number;
  height?: number;
  nodeRadius?: number;
  highlightedPath?: string[];
  onNodeClick?: (node: TreeNodeData) => void;
  showEmptySlots?: boolean;
  emptySlotCallback?: (parentId: string, side: 'left' | 'right') => void;
}

export function TreeVisualization({
  root,
  width = 500,
  height = 350,
  nodeRadius = 24,
  highlightedPath = [],
  onNodeClick,
  showEmptySlots = false,
  emptySlotCallback,
}: TreeVisualizationProps) {
  if (!root) {
    return (
      <div 
        className="flex items-center justify-center bg-muted/30 rounded-xl border-2 border-dashed border-border"
        style={{ width, height }}
      >
        <p className="text-muted-foreground">Tree is empty</p>
      </div>
    );
  }

  // Calculate positions
  const positions = calculatePositions(root, width, height, nodeRadius);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Edges */}
      {renderEdges(positions, nodeRadius, highlightedPath)}
      
      {/* Nodes */}
      <AnimatePresence>
        {positions.map((pos) => (
          <motion.g
            key={pos.node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {/* Node circle */}
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={nodeRadius}
              className={cn(
                'transition-colors duration-300',
                pos.node.visiting 
                  ? 'fill-warning stroke-warning' 
                  : pos.node.highlighted || highlightedPath.includes(pos.node.id)
                    ? 'fill-primary stroke-primary'
                    : 'fill-card stroke-border'
              )}
              strokeWidth={3}
              style={pos.node.highlightColor ? { fill: pos.node.highlightColor, stroke: pos.node.highlightColor } : undefined}
              onClick={() => onNodeClick?.(pos.node)}
              cursor={onNodeClick ? 'pointer' : 'default'}
            />
            
            {/* Node value */}
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                'text-sm font-semibold pointer-events-none select-none',
                (pos.node.visiting || pos.node.highlighted || highlightedPath.includes(pos.node.id))
                  ? 'fill-primary-foreground'
                  : 'fill-foreground'
              )}
            >
              {pos.node.value}
            </text>

            {/* Empty slots */}
            {showEmptySlots && !pos.node.left && (
              <g 
                onClick={() => emptySlotCallback?.(pos.node.id, 'left')}
                className="cursor-pointer"
              >
                <line
                  x1={pos.x}
                  y1={pos.y + nodeRadius}
                  x2={pos.x - 40}
                  y2={pos.y + 60}
                  className="stroke-border/50"
                  strokeWidth={2}
                  strokeDasharray="4"
                />
                <circle
                  cx={pos.x - 40}
                  cy={pos.y + 60}
                  r={16}
                  className="fill-muted stroke-border stroke-dashed hover:fill-primary/20 hover:stroke-primary transition-colors"
                  strokeWidth={2}
                  strokeDasharray="4"
                />
                <text
                  x={pos.x - 40}
                  y={pos.y + 60}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs fill-muted-foreground"
                >
                  +
                </text>
              </g>
            )}

            {showEmptySlots && !pos.node.right && (
              <g 
                onClick={() => emptySlotCallback?.(pos.node.id, 'right')}
                className="cursor-pointer"
              >
                <line
                  x1={pos.x}
                  y1={pos.y + nodeRadius}
                  x2={pos.x + 40}
                  y2={pos.y + 60}
                  className="stroke-border/50"
                  strokeWidth={2}
                  strokeDasharray="4"
                />
                <circle
                  cx={pos.x + 40}
                  cy={pos.y + 60}
                  r={16}
                  className="fill-muted stroke-border stroke-dashed hover:fill-primary/20 hover:stroke-primary transition-colors"
                  strokeWidth={2}
                  strokeDasharray="4"
                />
                <text
                  x={pos.x + 40}
                  y={pos.y + 60}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs fill-muted-foreground"
                >
                  +
                </text>
              </g>
            )}
          </motion.g>
        ))}
      </AnimatePresence>
    </svg>
  );
}

interface NodePosition {
  node: TreeNodeData;
  x: number;
  y: number;
  parentX?: number;
  parentY?: number;
}

function calculatePositions(
  root: TreeNodeData,
  width: number,
  height: number,
  nodeRadius: number
): NodePosition[] {
  const positions: NodePosition[] = [];
  const levelHeight = 70;
  const startY = nodeRadius + 20;

  function traverse(
    node: TreeNodeData | null | undefined,
    level: number,
    left: number,
    right: number,
    parentX?: number,
    parentY?: number
  ) {
    if (!node) return;

    const x = (left + right) / 2;
    const y = startY + level * levelHeight;

    positions.push({ node, x, y, parentX, parentY });

    const childWidth = (right - left) / 2;
    traverse(node.left, level + 1, left, left + childWidth, x, y);
    traverse(node.right, level + 1, right - childWidth, right, x, y);
  }

  traverse(root, 0, 40, width - 40);
  return positions;
}

function renderEdges(
  positions: NodePosition[],
  nodeRadius: number,
  highlightedPath: string[]
) {
  return positions
    .filter((pos) => pos.parentX !== undefined && pos.parentY !== undefined)
    .map((pos) => {
      const isHighlighted = highlightedPath.includes(pos.node.id);
      return (
        <motion.line
          key={`edge-${pos.node.id}`}
          x1={pos.parentX}
          y1={(pos.parentY || 0) + nodeRadius}
          x2={pos.x}
          y2={pos.y - nodeRadius}
          className={cn(
            'transition-colors duration-300',
            isHighlighted ? 'stroke-primary' : 'stroke-border'
          )}
          strokeWidth={isHighlighted ? 3 : 2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      );
    });
}