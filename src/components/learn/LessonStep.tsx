import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface LessonStepProps {
  stepNumber: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

export function LessonStep({
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  onClick,
}: LessonStepProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border-2 transition-all duration-300',
        isActive && 'border-primary bg-primary/5 shadow-glow',
        isCompleted && !isActive && 'border-success/50 bg-success/5',
        !isActive && !isCompleted && 'border-border bg-card hover:border-primary/30'
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start gap-3">
        {/* Step indicator */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isActive && 'bg-primary text-primary-foreground',
          isCompleted && !isActive && 'bg-success text-success-foreground',
          !isActive && !isCompleted && 'bg-muted text-muted-foreground'
        )}>
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <span className="text-sm font-semibold">{stepNumber}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={cn(
              'font-semibold',
              isActive && 'text-primary',
              isCompleted && !isActive && 'text-success'
            )}>
              {title}
            </h4>
            {isActive && (
              <ChevronRight className="h-4 w-4 text-primary" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

interface StepProgressProps {
  current: number;
  total: number;
}

export function StepProgress({ current, total }: StepProgressProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{current} / {total} steps</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}