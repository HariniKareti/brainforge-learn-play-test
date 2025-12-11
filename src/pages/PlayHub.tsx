import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Loader2, ArrowLeft, Trophy, Zap, Heart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface GameMode {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  available: boolean;
}

const gameModes: GameMode[] = [
  {
    id: 'tree-builder',
    title: 'Tree Builder',
    description: 'Build binary trees by placing nodes correctly. Race against time!',
    icon: '🌲',
    color: 'topic-tree',
    difficulty: 'Easy',
    available: true,
  },
  {
    id: 'bst-insert',
    title: 'BST Insert Challenge',
    description: 'Insert values into BST following the correct path. Speed matters!',
    icon: '🔍',
    color: 'topic-bst',
    difficulty: 'Medium',
    available: true,
  },
  {
    id: 'traversal-race',
    title: 'Traversal Race',
    description: 'Predict the traversal order before it animates. Test your knowledge!',
    icon: '🏎️',
    color: 'topic-bfs',
    difficulty: 'Medium',
    available: true,
  },
  {
    id: 'pathfinder',
    title: 'Pathfinder',
    description: 'Find the shortest path using BFS. Navigate through mazes!',
    icon: '🧭',
    color: 'topic-dfs',
    difficulty: 'Hard',
    available: true,
  },
];

const difficultyColors = {
  Easy: 'bg-success/20 text-success border-success/30',
  Medium: 'bg-warning/20 text-warning border-warning/30',
  Hard: 'bg-destructive/20 text-destructive border-destructive/30',
};

export default function PlayHub() {
  const { user, loading } = useAuth();
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // In the future, fetch high scores from database
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
            Play <span className="text-gradient">Mode</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Test your skills in timed challenges. Earn points, climb leaderboards, 
            and prove your mastery!
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-primary/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Total Score</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-warning/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-success/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-success/10">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-destructive/20">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Heart className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Lives</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Modes Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {gameModes.map((game, index) => (
            <Link
              key={game.id}
              to={game.available ? `/play/${game.id}` : '#'}
              className={cn(
                'block animate-slide-up',
                !game.available && 'pointer-events-none'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className={cn(
                'group h-full transition-all duration-300 border-2',
                `border-${game.color}/30`,
                game.available && `hover:border-${game.color}/60 hover:-translate-y-1`,
                !game.available && 'opacity-60'
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                        `bg-${game.color}/10`
                      )}>
                        {game.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={cn('mt-1', difficultyColors[game.difficulty])}
                        >
                          {game.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {!game.available && (
                      <Badge variant="secondary" className="bg-warning/10 text-warning">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{game.description}</p>
                  {game.available && (
                    <div className={cn(
                      'mt-4 inline-flex items-center text-sm font-medium',
                      `text-${game.color}`
                    )}>
                      Play Now →
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-hero border border-border/50 animate-fade-in">
          <h3 className="font-display font-semibold text-lg mb-2">
            🎮 Challenge Yourself
          </h3>
          <p className="text-muted-foreground">
            In Play Mode, you have limited lives and time pressure. Make mistakes and 
            learn from them! Your scores are tracked and you can compete on leaderboards. 
            Practice in Learn Mode first if you need to brush up on concepts.
          </p>
        </div>
      </main>
    </div>
  );
}
