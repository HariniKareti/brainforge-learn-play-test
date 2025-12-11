import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, ArrowDown, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';

type GameState = 'ready' | 'playing' | 'won' | 'lost';

interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

interface EmptySlot {
  parentId: string;
  side: 'left' | 'right';
  x: number;
  y: number;
}

const MAX_ROUNDS = 10;

export default function BSTInsertGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [valueToInsert, setValueToInsert] = useState(0);
  const [correctSlot, setCorrectSlot] = useState<{ parentId: string; side: 'left' | 'right' } | null>(null);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const [showingCorrect, setShowingCorrect] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showingCorrect) return;
    
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
  }, [gameState, showingCorrect]);

  const handleTimeout = () => {
    handleWrongAnswer();
  };

  const generateBST = (values: number[]): TreeNode | null => {
    if (values.length === 0) return null;
    
    let root: TreeNode | null = null;
    for (const value of values) {
      root = insertIntoBST(root, value);
    }
    return root;
  };

  const insertIntoBST = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) {
      return { id: `node-${value}`, value };
    }
    
    if (value < root.value) {
      return { ...root, left: insertIntoBST(root.left || null, value) };
    } else {
      return { ...root, right: insertIntoBST(root.right || null, value) };
    }
  };

  const findInsertSlot = (root: TreeNode | null, value: number): { parentId: string; side: 'left' | 'right' } | null => {
    if (!root) return null;
    
    let current = root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          return { parentId: current.id, side: 'left' };
        }
        current = current.left;
      } else {
        if (!current.right) {
          return { parentId: current.id, side: 'right' };
        }
        current = current.right;
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setRound(1);
    generateNewRound(1);
    playSound('click');
  };

  const generateNewRound = (currentRound: number) => {
    const numNodes = Math.min(3 + Math.floor(currentRound / 2), 7);
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
    
    // Calculate correct slot
    const slot = findInsertSlot(newTree, insertVal);
    setCorrectSlot(slot);
    
    setTimeLeft(20);
    setShakeSlot(null);
    setShowingCorrect(false);
  };

  const handleSlotClick = (parentId: string, side: 'left' | 'right') => {
    if (gameState !== 'playing' || showingCorrect) return;
    
    playSound('click');
    
    // Check if correct
    if (correctSlot && correctSlot.parentId === parentId && correctSlot.side === side) {
      // Correct!
      setShowingCorrect(true);
      const bonus = Math.floor(timeLeft * 5);
      const roundScore = 50 + bonus;
      setScore(prev => prev + roundScore);
      
      playSound('correct');
      toast({
        title: '✅ Correct!',
        description: `+${roundScore} points`,
      });
      
      if (round >= MAX_ROUNDS) {
        setTimeout(() => {
          setGameState('won');
          saveScore();
        }, 1000);
      } else {
        setTimeout(() => {
          setRound(prev => prev + 1);
          generateNewRound(round + 1);
        }, 1000);
      }
    } else {
      handleWrongAnswer(parentId, side);
    }
  };

  const handleWrongAnswer = (clickedParent?: string, clickedSide?: 'left' | 'right') => {
    if (clickedParent && clickedSide) {
      setShakeSlot(`${clickedParent}-${clickedSide}`);
    }
    setShowingCorrect(true);
    
    const newLives = lives - 1;
    setLives(newLives);
    playSound('wrong');
    
    if (newLives <= 0) {
      setGameState('lost');
      playSound('gameOver');
      saveScore();
      toast({
        title: '💔 Game Over!',
        description: `Final Score: ${score}`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: '❌ Wrong!',
        description: `The correct spot is highlighted. ${newLives} lives left.`,
        variant: 'destructive',
      });
      
      setTimeout(() => {
        generateNewRound(round);
      }, 2000);
    }
  };

  const saveScore = async () => {
    if (user) {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: 'bst-insert',
        score,
      });
    }
  };

  const renderTree = () => {
    if (!tree) return null;
    
    const positions: { node: TreeNode; x: number; y: number; parentX?: number; parentY?: number }[] = [];
    const emptySlots: EmptySlot[] = [];
    
    const calculatePositions = (
      node: TreeNode | null,
      level: number,
      left: number,
      right: number,
      parentX?: number,
      parentY?: number
    ) => {
      if (!node) return;
      
      const x = (left + right) / 2;
      const y = 60 + level * 80;
      
      positions.push({ node, x, y, parentX, parentY });
      
      const childWidth = (right - left) / 2;
      
      if (!node.left) {
        emptySlots.push({ parentId: node.id, side: 'left', x: left + childWidth / 2, y: y + 80 });
      }
      if (!node.right) {
        emptySlots.push({ parentId: node.id, side: 'right', x: right - childWidth / 2, y: y + 80 });
      }
      
      calculatePositions(node.left || null, level + 1, left, left + childWidth, x, y);
      calculatePositions(node.right || null, level + 1, right - childWidth, right, x, y);
    };
    
    calculatePositions(tree, 0, 40, 560);
    
    return (
      <svg width={600} height={400} className="overflow-visible">
        {/* Edges to nodes */}
        {positions.filter(p => p.parentX !== undefined).map(pos => (
          <line
            key={`edge-${pos.node.id}`}
            x1={pos.parentX}
            y1={(pos.parentY || 0) + 24}
            x2={pos.x}
            y2={pos.y - 24}
            className="stroke-border"
            strokeWidth={2}
          />
        ))}
        
        {/* Nodes */}
        {positions.map(pos => (
          <g key={pos.node.id}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={24}
              className="fill-card stroke-primary"
              strokeWidth={3}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-sm font-bold fill-foreground pointer-events-none"
            >
              {pos.node.value}
            </text>
          </g>
        ))}
        
        {/* Empty slots */}
        {emptySlots.map(slot => {
          const isCorrect = correctSlot?.parentId === slot.parentId && correctSlot?.side === slot.side;
          const isShaking = shakeSlot === `${slot.parentId}-${slot.side}`;
          const parent = positions.find(p => p.node.id === slot.parentId);
          
          return (
            <g key={`${slot.parentId}-${slot.side}`}>
              <line
                x1={parent?.x}
                y1={(parent?.y || 0) + 24}
                x2={slot.x}
                y2={slot.y - 20}
                className="stroke-border/50"
                strokeWidth={2}
                strokeDasharray="4"
              />
              <motion.circle
                cx={slot.x}
                cy={slot.y}
                r={20}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  showingCorrect && isCorrect
                    ? 'fill-green-500/50 stroke-green-500'
                    : 'fill-muted/50 stroke-border hover:fill-primary/30 hover:stroke-primary'
                )}
                strokeWidth={showingCorrect && isCorrect ? 4 : 2}
                strokeDasharray={showingCorrect && isCorrect ? '0' : '4'}
                onClick={() => handleSlotClick(slot.parentId, slot.side)}
                animate={isShaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              />
              <text
                x={slot.x}
                y={slot.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(
                  'text-sm pointer-events-none',
                  showingCorrect && isCorrect ? 'fill-green-500 font-bold' : 'fill-muted-foreground'
                )}
              >
                {showingCorrect && isCorrect ? valueToInsert : '?'}
              </text>
            </g>
          );
        })}
      </svg>
    );
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
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                🔍 BST Insert Challenge
              </h1>
              <p className="text-sm text-muted-foreground">
                Round {round}/{MAX_ROUNDS} • Find the correct insertion point
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
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
                    <CardTitle className="text-sm">Insert This Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-2">
                      <ArrowDown className="h-5 w-5 text-primary animate-bounce" />
                      <span className="text-4xl font-mono font-bold text-primary">
                        {valueToInsert}
                      </span>
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Click the correct empty slot
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
                    <Progress value={(timeLeft / 20) * 100} className="mt-2 h-2" />
                  </CardContent>
                </Card>
              </>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">BST Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p><strong>Left child</strong>: value &lt; parent</p>
                <p><strong>Right child</strong>: value ≥ parent</p>
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
                      Given a value, click the correct empty slot where it should be 
                      inserted to maintain BST properties. You have {MAX_ROUNDS} rounds!
                    </p>
                    <Button size="lg" onClick={startGame}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Game
                    </Button>
                  </motion.div>
                )}
                
                {gameState === 'playing' && (
                  <div className="w-full h-full flex items-center justify-center">
                    {renderTree()}
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
                    <p className="text-4xl font-mono font-bold text-primary">{score} points</p>
                    <p className="text-muted-foreground">You completed {round - 1} rounds</p>
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
