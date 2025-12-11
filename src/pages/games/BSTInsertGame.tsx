import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TreeVisualization, TreeNodeData } from '@/components/learn/TreeVisualization';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'ready' | 'playing' | 'won' | 'lost';

function generateBST(values: number[]): TreeNodeData | null {
  if (values.length === 0) return null;
  
  let root: TreeNodeData | null = null;
  
  for (const value of values) {
    root = insertIntoBST(root, value);
  }
  
  return root;
}

function insertIntoBST(root: TreeNodeData | null, value: number): TreeNodeData {
  if (!root) {
    return { id: `node-${value}`, value };
  }
  
  if (value < (root.value as number)) {
    return { ...root, left: insertIntoBST(root.left || null, value) };
  } else {
    return { ...root, right: insertIntoBST(root.right || null, value) };
  }
}

function findInsertPath(root: TreeNodeData | null, value: number): string[] {
  const path: string[] = [];
  let current = root;
  
  while (current) {
    path.push(current.id);
    if (value < (current.value as number)) {
      if (!current.left) break;
      current = current.left;
    } else {
      if (!current.right) break;
      current = current.right;
    }
  }
  
  return path;
}

export default function BSTInsertGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [tree, setTree] = useState<TreeNodeData | null>(null);
  const [valueToInsert, setValueToInsert] = useState(0);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [correctPath, setCorrectPath] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showingAnswer, setShowingAnswer] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showingAnswer) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleWrongAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState, showingAnswer]);

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setRound(0);
    generateNewRound();
  };

  const generateNewRound = () => {
    const numNodes = Math.min(3 + Math.floor(round / 2), 7);
    const values: number[] = [];
    for (let i = 0; i < numNodes; i++) {
      let val;
      do {
        val = Math.floor(Math.random() * 90) + 10;
      } while (values.includes(val));
      values.push(val);
    }
    
    const newTree = generateBST(values);
    setTree(newTree);
    
    // Generate value to insert (not in tree)
    let insertVal;
    do {
      insertVal = Math.floor(Math.random() * 90) + 10;
    } while (values.includes(insertVal));
    setValueToInsert(insertVal);
    
    // Calculate correct path
    const path = findInsertPath(newTree, insertVal);
    setCorrectPath(path);
    
    setTimeLeft(30);
    setHighlightedPath([]);
    setSelectedNode(null);
    setShowingAnswer(false);
  };

  const handleNodeClick = (nodeId: string) => {
    if (gameState !== 'playing' || showingAnswer) return;
    
    setSelectedNode(nodeId);
    
    // Check if this is the correct insertion point
    const lastCorrectNode = correctPath[correctPath.length - 1];
    
    if (nodeId === lastCorrectNode) {
      // Correct! Show animation and move to next round
      setShowingAnswer(true);
      setHighlightedPath(correctPath);
      
      const bonus = Math.floor(timeLeft * 5);
      const roundScore = 50 + bonus;
      setScore(prev => prev + roundScore);
      
      toast({
        title: '✅ Correct!',
        description: `+${roundScore} points`,
      });
      
      setTimeout(() => {
        setRound(prev => prev + 1);
        generateNewRound();
      }, 1500);
    } else {
      handleWrongAnswer();
    }
  };

  const handleWrongAnswer = () => {
    setShowingAnswer(true);
    setHighlightedPath(correctPath);
    
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
        title: '❌ Wrong!',
        description: `The correct path is highlighted. ${newLives} lives left.`,
        variant: 'destructive',
      });
      
      setTimeout(() => {
        generateNewRound();
      }, 2000);
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
                🔍 BST Insert Challenge
              </h1>
              <p className="text-sm text-muted-foreground">Find where to insert values</p>
            </div>
          </div>
          
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

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            {gameState === 'playing' && (
              <>
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Insert Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDown className="h-5 w-5 text-primary animate-bounce" />
                      <span className="text-4xl font-mono font-bold text-primary">
                        {valueToInsert}
                      </span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Click the node where this value should be inserted below
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
                    <div className="text-3xl font-mono font-bold text-center">
                      {timeLeft}s
                    </div>
                    <Progress value={(timeLeft / 30) * 100} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">BST Rule</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p><strong>Left</strong>: values less than parent</p>
                <p><strong>Right</strong>: values greater than or equal to parent</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="h-[500px] relative">
              <CardContent className="h-full flex items-center justify-center p-4">
                {gameState === 'ready' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="text-6xl">🔍</div>
                    <h2 className="text-2xl font-display font-bold">BST Insert Challenge</h2>
                    <p className="text-muted-foreground max-w-md">
                      Given a value, click on the correct node where it should be 
                      inserted to maintain BST properties. Speed matters!
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
                      highlightedPath={highlightedPath}
                      showEmptySlots={true}
                      onNodeClick={(node) => handleNodeClick(node.id)}
                    />
                  </div>
                )}
                
                {gameState === 'lost' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
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
