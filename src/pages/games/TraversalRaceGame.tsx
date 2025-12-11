import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TreeVisualization, TreeNodeData } from '@/components/learn/TreeVisualization';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type GameState = 'ready' | 'playing' | 'checking' | 'lost';
type TraversalType = 'inorder' | 'preorder' | 'postorder' | 'bfs';

const traversalInfo = {
  inorder: { name: 'Inorder', hint: 'Left → Root → Right' },
  preorder: { name: 'Preorder', hint: 'Root → Left → Right' },
  postorder: { name: 'Postorder', hint: 'Left → Right → Root' },
  bfs: { name: 'BFS', hint: 'Level by level' },
};

function generateRandomTree(): TreeNodeData {
  const values = [1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5).slice(0, 5);
  
  const root: TreeNodeData = { id: '1', value: values[0] };
  root.left = { id: '2', value: values[1] };
  root.right = { id: '3', value: values[2] };
  root.left.left = { id: '4', value: values[3] };
  root.left.right = { id: '5', value: values[4] };
  
  return root;
}

function getTraversal(root: TreeNodeData | null, type: TraversalType): number[] {
  if (!root) return [];
  
  const result: number[] = [];
  
  if (type === 'inorder') {
    const traverse = (node: TreeNodeData | null | undefined) => {
      if (!node) return;
      traverse(node.left);
      result.push(node.value as number);
      traverse(node.right);
    };
    traverse(root);
  } else if (type === 'preorder') {
    const traverse = (node: TreeNodeData | null | undefined) => {
      if (!node) return;
      result.push(node.value as number);
      traverse(node.left);
      traverse(node.right);
    };
    traverse(root);
  } else if (type === 'postorder') {
    const traverse = (node: TreeNodeData | null | undefined) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);
      result.push(node.value as number);
    };
    traverse(root);
  } else if (type === 'bfs') {
    const queue = [root];
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node.value as number);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}

function getAllValues(root: TreeNodeData | null): number[] {
  if (!root) return [];
  return [
    root.value as number,
    ...getAllValues(root.left || null),
    ...getAllValues(root.right || null),
  ];
}

export default function TraversalRaceGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [tree, setTree] = useState<TreeNodeData | null>(null);
  const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
  const [correctOrder, setCorrectOrder] = useState<number[]>([]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [availableValues, setAvailableValues] = useState<number[]>([]);

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
        description: `Correct order was: ${correctOrder.join(' → ')}`,
        variant: 'destructive',
      });
      setTimeout(() => generateNewRound(), 2000);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setRound(0);
    generateNewRound();
  };

  const generateNewRound = () => {
    const newTree = generateRandomTree();
    setTree(newTree);
    
    const types: TraversalType[] = ['inorder', 'preorder', 'postorder', 'bfs'];
    const type = types[Math.floor(Math.random() * types.length)];
    setTraversalType(type);
    
    const correct = getTraversal(newTree, type);
    setCorrectOrder(correct);
    
    setAvailableValues(getAllValues(newTree).sort(() => Math.random() - 0.5));
    setUserOrder([]);
    setTimeLeft(45);
    setGameState('playing');
  };

  const handleValueClick = (value: number) => {
    if (gameState !== 'playing') return;
    
    const newUserOrder = [...userOrder, value];
    setUserOrder(newUserOrder);
    setAvailableValues(prev => prev.filter((v, i) => prev.indexOf(v) !== prev.indexOf(value) || i !== prev.indexOf(value)));
    
    // Check if complete
    if (newUserOrder.length === correctOrder.length) {
      checkAnswer(newUserOrder);
    }
  };

  const handleUndo = () => {
    if (userOrder.length === 0) return;
    const lastValue = userOrder[userOrder.length - 1];
    setUserOrder(prev => prev.slice(0, -1));
    setAvailableValues(prev => [...prev, lastValue]);
  };

  const checkAnswer = (order: number[]) => {
    setGameState('checking');
    
    const isCorrect = order.every((val, idx) => val === correctOrder[idx]);
    
    if (isCorrect) {
      const bonus = Math.floor(timeLeft * 5);
      const roundScore = 100 + bonus;
      setScore(prev => prev + roundScore);
      setRound(prev => prev + 1);
      
      toast({
        title: '🎉 Correct!',
        description: `+${roundScore} points`,
      });
      
      setTimeout(() => generateNewRound(), 1500);
    } else {
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
          title: '❌ Wrong order!',
          description: `Correct: ${correctOrder.join(' → ')}`,
          variant: 'destructive',
        });
        setTimeout(() => generateNewRound(), 2000);
      }
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/play">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-display font-bold">🏎️ Traversal Race</h1>
              <p className="text-sm text-muted-foreground">Predict the traversal order</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={cn('h-5 w-5', i < lives ? 'text-destructive fill-destructive' : 'text-muted')} />
              ))}
            </div>
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              {score}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            {gameState === 'playing' && (
              <>
                <Card className="bg-topic-bfs/10 border-topic-bfs/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Traversal Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-topic-bfs">
                      {traversalInfo[traversalType].name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {traversalInfo[traversalType].hint}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Left
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-mono font-bold text-center">{timeLeft}s</div>
                    <Progress value={(timeLeft / 45) * 100} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Round {round + 1}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Click values in the correct traversal order.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="h-[500px] relative">
              <CardContent className="h-full flex flex-col p-4">
                {gameState === 'ready' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl">🏎️</div>
                      <h2 className="text-2xl font-display font-bold">Traversal Race</h2>
                      <p className="text-muted-foreground max-w-md">
                        See a tree and traversal type. Click the values in the 
                        correct order to score points!
                      </p>
                      <Button size="lg" onClick={startGame}>
                        <Play className="mr-2 h-4 w-4" />
                        Start Game
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {(gameState === 'playing' || gameState === 'checking') && (
                  <>
                    <div className="flex-1 flex items-center justify-center">
                      <TreeVisualization root={tree} width={500} height={280} />
                    </div>
                    
                    {/* User's answer */}
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Your Order:</p>
                        <Button variant="ghost" size="sm" onClick={handleUndo} disabled={userOrder.length === 0}>
                          Undo
                        </Button>
                      </div>
                      <div className="flex gap-2 flex-wrap min-h-[40px]">
                        {userOrder.map((val, idx) => (
                          <Badge key={idx} variant="secondary" className="text-lg px-3 py-1">
                            {val}
                          </Badge>
                        ))}
                        {userOrder.length === 0 && (
                          <span className="text-muted-foreground text-sm">Click values below...</span>
                        )}
                      </div>
                      
                      {/* Available values */}
                      <div className="flex gap-2 flex-wrap">
                        {availableValues.map((val, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="text-lg px-4"
                            onClick={() => handleValueClick(val)}
                            disabled={gameState === 'checking'}
                          >
                            {val}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {gameState === 'lost' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex items-center justify-center"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl">💔</div>
                      <h2 className="text-2xl font-display font-bold">Game Over</h2>
                      <p className="text-4xl font-mono font-bold text-primary">{score} points</p>
                      <p className="text-muted-foreground">You completed {round} rounds</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={startGame}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Play Again
                        </Button>
                        <Link to="/play">
                          <Button variant="outline">Back to Games</Button>
                        </Link>
                      </div>
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
