import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, Volume2, VolumeX, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';

type GameState = 'ready' | 'playing' | 'won' | 'lost';
type GameMode = 'binary' | 'bst';

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

const MAX_LEVELS = 10;

export default function TreeBuilderGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [seedValue, setSeedValue] = useState(0);
  const [mode, setMode] = useState<GameMode>('binary');
  const [validSlot, setValidSlot] = useState<EmptySlot | null>(null);
  const [shakeSlot, setShakeSlot] = useState<string | null>(null);
  const [nodesNeeded, setNodesNeeded] = useState(3);

  // Mode changes at level 5
  useEffect(() => {
    if (level >= 5) {
      setMode('bst');
    } else {
      setMode('binary');
    }
  }, [level]);

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
    playSound('wrong');
    
    if (newLives <= 0) {
      endGame();
    } else {
      toast({
        title: "⏱️ Time's up!",
        description: `${newLives} lives remaining`,
        variant: 'destructive',
      });
      resetLevel();
    }
  };

  const countNodes = (node: TreeNode | null): number => {
    if (!node) return 0;
    return 1 + countNodes(node.left || null) + countNodes(node.right || null);
  };

  const findBSTInsertSlot = (root: TreeNode | null, value: number): { parentId: string; side: 'left' | 'right' } | null => {
    if (!root) return null;
    
    let current = root;
    while (true) {
      if (value < current.value) {
        if (!current.left) {
          return { parentId: current.id, side: 'left' };
        }
        current = current.left;
      } else if (value > current.value) {
        if (!current.right) {
          return { parentId: current.id, side: 'right' };
        }
        current = current.right;
      } else {
        // Duplicate - no valid slot
        return null;
      }
    }
  };

  const generateNewSeed = () => {
    let value;
    if (mode === 'bst') {
      // For BST mode, generate a value that has a valid insertion point
      const existingValues: number[] = [];
      const collectValues = (node: TreeNode | null) => {
        if (!node) return;
        existingValues.push(node.value);
        collectValues(node.left || null);
        collectValues(node.right || null);
      };
      collectValues(tree);
      
      do {
        value = Math.floor(Math.random() * 90) + 10;
      } while (existingValues.includes(value));
      
      // Calculate valid slot for BST
      const slot = findBSTInsertSlot(tree, value);
      if (slot) {
        setValidSlot(calculateSlotPosition(slot.parentId, slot.side));
      }
    } else {
      value = Math.floor(Math.random() * 90) + 10;
      setValidSlot(null);
    }
    setSeedValue(value);
  };

  const calculateSlotPosition = (parentId: string, side: 'left' | 'right'): EmptySlot => {
    return { parentId, side, x: 0, y: 0 }; // Position calculated in render
  };

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setLevel(1);
    setMode('binary');
    initializeLevel(1);
    playSound('click');
  };

  const initializeLevel = (lvl: number) => {
    const rootValue = Math.floor(Math.random() * 40) + 30; // 30-70 for balanced tree
    setTree({ id: 'root', value: rootValue });
    setNodesNeeded(Math.min(3 + lvl, 8));
    setTimeLeft(45);
    generateNewSeed();
  };

  const resetLevel = () => {
    initializeLevel(level);
  };

  const handleSlotClick = (parentId: string, side: 'left' | 'right') => {
    if (gameState !== 'playing' || !tree) return;
    
    // Check if slot is already filled
    const findNode = (node: TreeNode | null, id: string): TreeNode | null => {
      if (!node) return null;
      if (node.id === id) return node;
      return findNode(node.left || null, id) || findNode(node.right || null, id);
    };
    
    const parent = findNode(tree, parentId);
    if (!parent) return;
    
    if ((side === 'left' && parent.left) || (side === 'right' && parent.right)) {
      // Slot already filled
      setShakeSlot(`${parentId}-${side}`);
      playSound('wrong');
      setTimeout(() => setShakeSlot(null), 500);
      return;
    }
    
    // BST Mode: Check if this is the correct slot
    if (mode === 'bst') {
      const correctSlot = findBSTInsertSlot(tree, seedValue);
      if (!correctSlot || correctSlot.parentId !== parentId || correctSlot.side !== side) {
        setShakeSlot(`${parentId}-${side}`);
        playSound('wrong');
        toast({
          title: '❌ Incorrect!',
          description: side === 'left' ? 'Smaller values go left!' : 'Larger values go right!',
          variant: 'destructive',
        });
        setTimeout(() => setShakeSlot(null), 500);
        
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          endGame();
        }
        return;
      }
    }
    
    // Valid placement
    playSound('correct');
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      value: seedValue,
    };
    
    const addToTree = (node: TreeNode): TreeNode => {
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
    
    // Check if level complete
    const nodeCount = countNodes(updatedTree);
    if (nodeCount >= nodesNeeded) {
      completeLevel();
    } else {
      generateNewSeed();
    }
  };

  const completeLevel = () => {
    const bonus = Math.floor(timeLeft * 10);
    const levelScore = 100 + bonus;
    setScore(prev => prev + levelScore);
    
    playSound('levelUp');
    toast({
      title: '🎉 Level Complete!',
      description: `+${levelScore} points (${bonus} time bonus)`,
    });
    
    if (level >= MAX_LEVELS) {
      setGameState('won');
      saveScore();
    } else {
      setLevel(prev => prev + 1);
      setTimeout(() => initializeLevel(level + 1), 1000);
    }
  };

  const endGame = async () => {
    setGameState('lost');
    playSound('gameOver');
    await saveScore();
  };

  const saveScore = async () => {
    if (user) {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: 'tree-builder',
        score,
      });
      toast({ title: 'Score saved!' });
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
    
    // Find valid slot for BST highlighting
    let highlightedSlot: EmptySlot | null = null;
    if (mode === 'bst') {
      const bstSlot = findBSTInsertSlot(tree, seedValue);
      if (bstSlot) {
        highlightedSlot = emptySlots.find(
          s => s.parentId === bstSlot.parentId && s.side === bstSlot.side
        ) || null;
      }
    }
    
    return (
      <svg width={600} height={400} className="overflow-visible">
        {/* Edges */}
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
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={24}
              className="fill-card stroke-primary"
              strokeWidth={3}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
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
          const isHighlighted = mode === 'bst' && highlightedSlot?.parentId === slot.parentId && highlightedSlot?.side === slot.side;
          const isShaking = shakeSlot === `${slot.parentId}-${slot.side}`;
          const parent = positions.find(p => p.node.id === slot.parentId);
          
          return (
            <g key={`${slot.parentId}-${slot.side}`}>
              <line
                x1={parent?.x}
                y1={(parent?.y || 0) + 24}
                x2={slot.x}
                y2={slot.y - 16}
                className="stroke-border/50"
                strokeWidth={2}
                strokeDasharray="4"
              />
              <motion.circle
                cx={slot.x}
                cy={slot.y}
                r={16}
                className={cn(
                  'cursor-pointer transition-colors',
                  isHighlighted 
                    ? 'fill-primary/30 stroke-primary' 
                    : 'fill-muted stroke-border hover:fill-primary/20 hover:stroke-primary'
                )}
                strokeWidth={2}
                strokeDasharray={isHighlighted ? '0' : '4'}
                onClick={() => handleSlotClick(slot.parentId, slot.side)}
                animate={isShaking ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                transition={{ duration: 0.4 }}
              />
              <text
                x={slot.x}
                y={slot.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-xs fill-muted-foreground pointer-events-none"
              >
                +
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
                🌲 Tree Builder
              </h1>
              <p className="text-sm text-muted-foreground">
                Level {level}/{MAX_LEVELS} • {mode === 'binary' ? 'Binary Tree' : 'BST'} Mode
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
                    <CardTitle className="text-sm">Plant This Seed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-mono font-bold text-primary text-center">
                      {seedValue}
                    </div>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Click an empty slot to place
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
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Hint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {mode === 'binary' ? (
                      <p>Place seeds in any empty slot. No comparisons needed!</p>
                    ) : (
                      <p>
                        <strong>Left</strong>: smaller values<br />
                        <strong>Right</strong>: larger values<br />
                        Highlighted slot is correct!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>Nodes: {tree ? countNodes(tree) : 0} / {nodesNeeded}</p>
                <Progress value={((tree ? countNodes(tree) : 0) / nodesNeeded) * 100} className="mt-2" />
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
                    <div className="text-6xl">🌲</div>
                    <h2 className="text-2xl font-display font-bold">Tree Builder</h2>
                    <p className="text-muted-foreground max-w-md">
                      <strong>Levels 1-4:</strong> Binary Tree mode - place seeds in any empty slot<br />
                      <strong>Levels 5-10:</strong> BST mode - follow BST rules!
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
                    <p className="text-4xl font-mono font-bold text-primary">
                      {score} points
                    </p>
                    <p className="text-muted-foreground">
                      You reached level {level}
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
