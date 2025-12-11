import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { TopicCard } from '@/components/TopicCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const topics = [
  {
    id: 'binary-tree',
    title: 'Binary Tree',
    description: 'Learn about nodes, children, parent-child relationships, depth, and level order traversal.',
    icon: '🌲',
    color: 'tree' as const,
    available: true,
    lessons: 8,
  },
  {
    id: 'bst',
    title: 'Binary Search Tree',
    description: 'Master the BST property: left < parent < right. Learn insertions and all traversal methods.',
    icon: '🔍',
    color: 'bst' as const,
    available: true,
    lessons: 10,
  },
  {
    id: 'bfs',
    title: 'Breadth-First Search',
    description: 'Explore layer-by-layer traversal with queue visualization. Find shortest paths!',
    icon: '⬅️➡️',
    color: 'bfs' as const,
    available: true,
    lessons: 7,
  },
  {
    id: 'dfs',
    title: 'Depth-First Search',
    description: 'Dive deep with stack-based traversal. Learn preorder, postorder, and backtracking.',
    icon: '⬆️⬇️',
    color: 'dfs' as const,
    available: true,
    lessons: 8,
  },
  {
    id: 'avl',
    title: 'AVL Trees',
    description: 'Self-balancing binary search trees with rotation operations.',
    icon: '⚖️',
    color: 'avl' as const,
    available: false,
    lessons: 12,
  },
];

export default function LearnHub() {
  const { user, loading } = useAuth();
  const [progressMap, setProgressMap] = useState<Record<string, { currentStep: number; completed: boolean }>>({});

  useEffect(() => {
    async function fetchProgress() {
      if (!user) return;
      
      const { data } = await supabase
        .from('learning_progress')
        .select('topic, current_step, completed')
        .eq('user_id', user.id);
      
      if (data) {
        const map: Record<string, { currentStep: number; completed: boolean }> = {};
        data.forEach(item => {
          map[item.topic] = { currentStep: item.current_step, completed: item.completed };
        });
        setProgressMap(map);
      }
    }
    fetchProgress();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Back Button & Title */}
        <div className="mb-8 animate-fade-in">
          <Link to="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </Link>
          
          <h1 className="text-4xl font-display font-bold mb-2">
            Learn <span className="text-gradient">Mode</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a topic to begin your guided learning journey. 
            No penalties, no pressure — just learn at your own pace.
          </p>
        </div>

        {/* Topic Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const progress = progressMap[topic.id];
            const progressPercent = progress 
              ? progress.completed 
                ? 100 
                : Math.round((progress.currentStep / topic.lessons) * 100)
              : 0;
            
            return (
              <TopicCard
                key={topic.id}
                {...topic}
                progress={progressPercent}
                delay={index * 100}
              />
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-hero border border-border/50 animate-fade-in">
          <h3 className="font-display font-semibold text-lg mb-2">
            🎯 Zero Frustration Learning
          </h3>
          <p className="text-muted-foreground">
            In Learn Mode, there are no lives, no hearts, no penalties. Every step is guided 
            with clear explanations. Wrong actions are prevented, not punished. Take your time 
            and truly understand each concept before moving on.
          </p>
        </div>
      </main>
    </div>
  );
}