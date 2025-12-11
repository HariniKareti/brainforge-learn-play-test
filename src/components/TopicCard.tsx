import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'tree' | 'bst' | 'bfs' | 'dfs' | 'avl';
  available: boolean;
  lessons: number;
  progress?: number;
  delay?: number;
}

const colorMap = {
  tree: {
    bg: 'bg-topic-tree/10',
    border: 'border-topic-tree/30',
    text: 'text-topic-tree',
    hover: 'hover:border-topic-tree/60 hover:shadow-[0_0_20px_hsl(var(--topic-tree)/0.2)]',
  },
  bst: {
    bg: 'bg-topic-bst/10',
    border: 'border-topic-bst/30',
    text: 'text-topic-bst',
    hover: 'hover:border-topic-bst/60 hover:shadow-[0_0_20px_hsl(var(--topic-bst)/0.2)]',
  },
  bfs: {
    bg: 'bg-topic-bfs/10',
    border: 'border-topic-bfs/30',
    text: 'text-topic-bfs',
    hover: 'hover:border-topic-bfs/60 hover:shadow-[0_0_20px_hsl(var(--topic-bfs)/0.2)]',
  },
  dfs: {
    bg: 'bg-topic-dfs/10',
    border: 'border-topic-dfs/30',
    text: 'text-topic-dfs',
    hover: 'hover:border-topic-dfs/60 hover:shadow-[0_0_20px_hsl(var(--topic-dfs)/0.2)]',
  },
  avl: {
    bg: 'bg-topic-avl/10',
    border: 'border-topic-avl/30',
    text: 'text-topic-avl',
    hover: 'hover:border-topic-avl/60 hover:shadow-[0_0_20px_hsl(var(--topic-avl)/0.2)]',
  },
};

export function TopicCard({ 
  id, 
  title, 
  description, 
  icon, 
  color, 
  available, 
  lessons,
  progress = 0,
  delay = 0 
}: TopicCardProps) {
  const colors = colorMap[color];

  const CardContent = (
    <div
      className={cn(
        'group relative p-6 rounded-2xl border-2 transition-all duration-300',
        'bg-card h-full',
        colors.border,
        available ? colors.hover : 'opacity-60 cursor-not-allowed',
        available && 'hover:-translate-y-1'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Icon & Title Row */}
      <div className="flex items-start gap-4 mb-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
          colors.bg
        )}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold">{title}</h3>
          <span className="text-xs text-muted-foreground">{lessons} lessons</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed mb-4">{description}</p>

      {/* Progress (for available topics) */}
      {available && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className={colors.text}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Coming Soon Badge */}
      {!available && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 bg-warning/10 text-warning border-warning/30"
        >
          Coming Soon
        </Badge>
      )}

      {/* CTA for available topics */}
      {available && (
        <div className={cn(
          'mt-4 inline-flex items-center text-sm font-medium transition-colors',
          colors.text
        )}>
          {progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
        </div>
      )}
    </div>
  );

  if (available) {
    return (
      <Link to={`/learn/${id}`} className="block animate-slide-up">
        {CardContent}
      </Link>
    );
  }

  return <div className="animate-slide-up">{CardContent}</div>;
}