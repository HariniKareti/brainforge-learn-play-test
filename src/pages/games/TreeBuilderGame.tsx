import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TreeVisualization, TreeNodeData } from '@/components/learn/TreeVisualization';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'ready' | 'playing' | 'won' | 'lost';

interface Target {
  description: string;
  validate: (tree: TreeNodeData | null) => boolean;
}

const targets: Target[] = [
  {
    description: 'Build a tree with 3 nodes',
    validate: (tree) => countNodes(tree) >= 3,
  },
  {
    description: 'Build a complete binary tree with 7 nodes',
    validate: (tree) => countNodes(tree) >= 7 && isComplete(tree),
  },
  {
    description: 'Build a tree with depth 3',
    validate: (tree) => getDepth(tree) >= 3,
  },
  {
    description: 'Build a left-skewed tree with 4 nodes',
    validate: (tree) => countNodes(tree) >= 4 && isLeftSkewed(tree),
  },
  {
    description: 'Build a balanced tree with 5+ nodes',
    validate: (tree) => countNodes(tree) >= 5 && isBalanced(tree),
  },
];

function countNodes(tree: TreeNodeData | null): number {
  if (!tree) return 0;
  return 1 + countNodes(tree.left || null) + countNodes(tree.right || null);
}

function getDepth(tree: TreeNodeData | null): number {
  if (!tree) return 0;
  return 1 + Math.max(getDepth(tree.left || null), getDepth(tree.right || null));
}

function isComplete(tree: TreeNodeData | null): boolean {
  if (!tree) return true;
  const queue: (TreeNodeData | null)[] = [tree];
  let foundNull = false;
  
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === null) {
      foundNull = true;
    } else {
      if (foundNull) return false;
      queue.push(node.left || null);
      queue.push(node.right || null);
    }
  }
  return true;
}

function isLeftSkewed(tree: TreeNodeData | null): boolean {
  if (!tree) return true;
  if (tree.right) return false;
  return isLeftSkewed(tree.left || null);
}

function isBalanced(tree: TreeNodeData | null): boolean {
  if (!tree) return true;
  const leftDepth = getDepth(tree.left || null);
  const rightDepth = getDepth(tree.right || null);
  return Math.abs(leftDepth - rightDepth) <= 1 && 
         isBalanced(tree.left || null) && 
         isBalanced(tree.right || null);
}

export default function TreeBuilderGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [tree, setTree] = useState<TreeNodeData | null>(null);
  
  const currentTarget = targets[level % targets.length];

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  const handleTimeout = () => {
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setGameState('lost');
      toast({
        title: '💔 Game Over!',
        description: `Final Score: ${score}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '⏱️ Time\'s up!',
        description: `${newLives} lives remaining`,
        variant: 'destructive',
      });
      resetLevel();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setLevel(0);
    setTimeLeft(60);
    setTree({ id: 'root', value: Math.floor(Math.random() * 90) + 10 });
  };

  const resetLevel = () => {
    setTimeLeft(60);
    setTree({ id: 'root', value: Math.floor(Math.random() * 90) + 10 });
  };

  const handleAddNode = (parentId: string, side: 'left' | 'right') => {
    if (gameState !== 'playing' || !tree) return;
    
    const value = Math.floor(Math.random() * 90) + 10;
    const newNode: TreeNodeData = {
      id: `${Date.now()}`,
      value,
    };
    
    const addToTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === parentId) {
        return { ...node, [side]: newNode };
      }
      return {
        ...node,
        left: node.left ? addToTree(node.left) : node.left,
        right: node.right ? addToTree(node.right) : node.right,
      };
    };
    
    const updatedTree = addToTree(tree);
    setTree(updatedTree);
    
    // Check if target is met
    if (currentTarget.validate(updatedTree)) {
      const bonus = Math.floor(timeLeft * 10);
      const levelScore = 100 + bonus;
      setScore(prev => prev + levelScore);
      setLevel(prev => prev + 1);
      setTimeLeft(60);
      setTree({ id: 'root', value: Math.floor(Math.random() * 90) + 10 });
      
      toast({
        title: '🎉 Level Complete!',
        description: `+${levelScore} points (${bonus} time bonus)`,
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/play">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                🌲 Tree Builder
              </h1>
              <p className="text-sm text-muted-foreground">Build trees to match targets</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={cn(
                    'h-5 w-5 transition-colors',
                    i < lives ? 'text-destructive fill-destructive' : 'text-muted'
                  )}
                />
              ))}
            </div>
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              {score}
            </Badge>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Target</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">{currentTarget.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Level {level + 1}
                </p>
              </CardContent>
            </Card>
            
            {gameState === 'playing' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Left
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-center">
                    {timeLeft}s
                  </div>
                  <Progress 
                    value={(timeLeft / 60) * 100} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tree Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nodes:</span>
                  <span className="font-medium">{countNodes(tree)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Depth:</span>
                  <span className="font-medium">{getDepth(tree)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            <Card className="h-[500px] relative">
              <CardContent className="h-full flex items-center justify-center p-4">
                {gameState === 'ready' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="text-6xl">🌲</div>
                    <h2 className="text-2xl font-display font-bold">Tree Builder</h2>
                    <p className="text-muted-foreground max-w-md">
                      Build binary trees by clicking on empty slots. Complete targets 
                      before time runs out. Faster completion = more points!
                    </p>
                    <Button size="lg" onClick={startGame}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Game
                    </Button>
                  </motion.div>
                )}
                
                {gameState === 'playing' && (
                  <div className="w-full h-full flex items-center justify-center">
                    <TreeVisualization
                      root={tree}
                      width={600}
                      height={400}
                      showEmptySlots={true}
                      emptySlotCallback={handleAddNode}
                    />
                  </div>
                )}
                
                {(gameState === 'won' || gameState === 'lost') && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="text-6xl">
                      {gameState === 'won' ? '🏆' : '💔'}
                    </div>
                    <h2 className="text-2xl font-display font-bold">
                      {gameState === 'won' ? 'You Won!' : 'Game Over'}
                    </h2>
                    <p className="text-4xl font-mono font-bold text-primary">
                      {score} points
                    </p>
                    <p className="text-muted-foreground">
                      You reached level {level + 1}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={startGame}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Play Again
                      </Button>
                      <Link to="/play">
                        <Button variant="outline">Back to Games</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
