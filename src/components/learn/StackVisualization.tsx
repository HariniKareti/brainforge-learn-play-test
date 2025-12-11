import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StackItem {
  id: string;
  value: number | string;
  highlighted?: boolean;
}

interface StackVisualizationProps {
  items: StackItem[];
  label?: string;
  maxVisible?: number;
}

export function StackVisualization({ 
  items, 
  label = "Stack",
  maxVisible = 6 
}: StackVisualizationProps) {
  const visibleItems = items.slice(0, maxVisible);
  const hasMore = items.length > maxVisible;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Size: {items.length}</span>
      </div>
      
      <div className="relative flex flex-col items-center p-3 bg-muted/30 rounded-lg border border-border min-h-[200px]">
        {/* Top indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
          <ArrowUp className="h-4 w-4 text-primary" />
          <span className="text-[10px] text-primary font-medium">TOP (push/pop)</span>
          <ArrowDown className="h-4 w-4 text-primary" />
        </div>

        {/* Stack items */}
        <div className="flex flex-col-reverse items-center gap-1 mt-4 w-full">
          <AnimatePresence mode="popLayout">
            {visibleItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-sm italic py-8"
              >
                Empty
              </motion.div>
            ) : (
              <>
                {hasMore && (
                  <span className="text-muted-foreground text-xs mb-1">
                    +{items.length - maxVisible} more below
                  </span>
                )}
                {[...visibleItems].reverse().map((item, reverseIndex) => {
                  const index = visibleItems.length - 1 - reverseIndex;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0, y: -30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0, y: -30 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={cn(
                        'w-16 h-10 rounded-lg flex items-center justify-center font-semibold text-sm border-2 transition-colors',
                        index === 0 && 'border-primary bg-primary/20 text-primary',
                        index !== 0 && !item.highlighted && 'border-border bg-card text-foreground',
                        item.highlighted && 'border-warning bg-warning/20 text-warning'
                      )}
                    >
                      {item.value}
                    </motion.div>
                  );
                })}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom base */}
        <div className="absolute bottom-2 w-24 h-2 bg-border rounded-full" />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border-2 border-primary bg-primary/20" />
          <span>Top element</span>
        </div>
      </div>
    </div>
  );
}