import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TraversalDisplayProps {
  label: string;
  values: (number | string)[];
  activeIndex?: number;
  color?: 'primary' | 'success' | 'info' | 'warning';
}

const colorMap = {
  primary: 'bg-primary/20 border-primary text-primary',
  success: 'bg-success/20 border-success text-success',
  info: 'bg-info/20 border-info text-info',
  warning: 'bg-warning/20 border-warning text-warning',
};

export function TraversalDisplay({ 
  label, 
  values, 
  activeIndex,
  color = 'primary' 
}: TraversalDisplayProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/30 rounded-lg border border-border">
        <AnimatePresence mode="popLayout">
          {values.length === 0 ? (
            <span className="text-muted-foreground text-sm italic">
              Empty
            </span>
          ) : (
            values.map((value, index) => (
              <motion.div
                key={`${value}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-sm border-2 transition-all',
                  index === activeIndex 
                    ? colorMap[color]
                    : 'border-border bg-card text-foreground'
                )}
              >
                {value}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface MultiTraversalDisplayProps {
  traversals: {
    label: string;
    values: (number | string)[];
    color: 'primary' | 'success' | 'info' | 'warning';
  }[];
}

export function MultiTraversalDisplay({ traversals }: MultiTraversalDisplayProps) {
  return (
    <div className="space-y-4">
      {traversals.map((traversal) => (
        <TraversalDisplay
          key={traversal.label}
          label={traversal.label}
          values={traversal.values}
          color={traversal.color}
        />
      ))}
    </div>
  );
}