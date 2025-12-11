import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ModeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color: 'success' | 'primary' | 'accent';
  available: boolean;
}

const colorMap = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: 'text-success',
    hover: 'hover:border-success/50 hover:shadow-[0_0_20px_hsl(var(--success)/0.2)]',
  },
  primary: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: 'text-primary',
    hover: 'hover:border-primary/50 hover:shadow-glow',
  },
  accent: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    icon: 'text-accent',
    hover: 'hover:border-accent/50 hover:shadow-glow-accent',
  },
};

export function ModeCard({ title, description, icon: Icon, to, color, available }: ModeCardProps) {
  const colors = colorMap[color];
  
  const CardContent = (
    <div
      className={cn(
        'group relative p-6 rounded-2xl border-2 transition-all duration-300',
        'bg-card',
        colors.border,
        available ? colors.hover : 'opacity-60 cursor-not-allowed',
        available && 'hover:-translate-y-1'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
        colors.bg
      )}>
        <Icon className={cn('h-7 w-7', colors.icon)} />
      </div>

      {/* Content */}
      <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>

      {/* Coming Soon Badge */}
      {!available && (
        <Badge 
          variant="secondary" 
          className="absolute top-4 right-4 bg-warning/10 text-warning border-warning/30"
        >
          Coming Soon
        </Badge>
      )}

      {/* Available indicator */}
      {available && (
        <div className={cn(
          'mt-4 inline-flex items-center text-sm font-medium',
          colors.icon
        )}>
          Start Learning →
        </div>
      )}
    </div>
  );

  if (available) {
    return (
      <Link to={to} className="block animate-slide-up">
        {CardContent}
      </Link>
    );
  }

  return <div className="animate-slide-up">{CardContent}</div>;
}