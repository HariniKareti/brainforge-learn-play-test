import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface QueueItem {
  id: string;
  value: number | string;
  highlighted?: boolean;
}

interface QueueVisualizationProps {
  items: QueueItem[];
  label?: string;
  maxVisible?: number;
}

export function QueueVisualization({ 
  items, 
  label = "Queue",
  maxVisible = 8 
}: QueueVisualizationProps) {
  const visibleItems = items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Size: {items.length}</span>
      </div>
      
      <div className="relative flex items-center gap-1 p-3 bg-muted/30 rounded-lg border border-border min-h-[60px]">
        {/* Front indicator */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <ArrowRight className="h-4 w-4 text-success" />
          <span className="text-[10px] text-success font-medium">OUT</span>
        </div>

        {/* Queue items */}
        <div className="flex items-center gap-1 ml-4 mr-4">
          <AnimatePresence mode="popLayout">
            {visibleItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm italic"
              >
                Empty
              </motion.div>
            ) : (
              visibleItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0, x: -50 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm border-2 transition-colors',
                    index === 0 && 'border-success bg-success/20 text-success',
                    index !== 0 && !item.highlighted && 'border-border bg-card text-foreground',
                    item.highlighted && 'border-warning bg-warning/20 text-warning'
                  )}
                >
                  {item.value}
                </motion.div>
              ))
            )}
            {hasMore && (
              <span className="text-muted-foreground text-sm">+{items.length - maxVisible}</span>
            )}
          </AnimatePresence>
        </div>

        {/* Back indicator */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <ArrowLeft className="h-4 w-4 text-info" />
          <span className="text-[10px] text-info font-medium">IN</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-success bg-success/20" />
          <span>Front (dequeue)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-info bg-info/20" />
          <span>Back (enqueue)</span>
        </div>
      </div>
    </div>
  );
}