import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';

type GameState = 'ready' | 'playing' | 'won' | 'lost';
type GameMode = 'dfs-order' | 'find-bst';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  value: number;
  neighbors: string[];
}

interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
}

const MAX_ROUNDS = 10;

export default function DFSGraphGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [gameMode, setGameMode] = useState<GameMode>('dfs-order');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Graph mode state
  const [graph, setGraph] = useState<GraphNode[]>([]);
  const [dfsOrder, setDfsOrder] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string[]>([]);
  const [startNode, setStartNode] = useState<string>('');
  
  // BST mode state
  const [trees, setTrees] = useState<{ tree: TreeNode; isBST: boolean }[]>([]);
  const [selectedTree, setSelectedTree] = useState<number | null>(null);
  const [correctBSTIndex, setCorrectBSTIndex] = useState<number>(0);
  const [showingAnswer, setShowingAnswer] = useState(false);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || showingAnswer) return;
    
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
  }, [gameState, showingAnswer]);

  const handleTimeout = () => {
    handleWrongAnswer();
  };

  const generateGraph = (): { nodes: GraphNode[]; start: string; order: string[] } => {
    const nodeCount = Math.min(4 + Math.floor(round / 2), 7);
    const nodes: GraphNode[] = [];
    
    // Create nodes in a grid-like pattern
    for (let i = 0; i < nodeCount; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      nodes.push({
        id: String.fromCharCode(65 + i), // A, B, C, etc.
        x: 150 + col * 150,
        y: 80 + row * 120,
        value: i + 1,
        neighbors: [],
      });
    }
    
    // Create edges (ensure connected graph)
    for (let i = 0; i < nodeCount - 1; i++) {
      const j = i + 1;
      nodes[i].neighbors.push(nodes[j].id);
      nodes[j].neighbors.push(nodes[i].id);
    }
    
    // Add some random edges
    for (let i = 0; i < Math.floor(nodeCount / 2); i++) {
      const a = Math.floor(Math.random() * nodeCount);
      const b = Math.floor(Math.random() * nodeCount);
      if (a !== b && !nodes[a].neighbors.includes(nodes[b].id)) {
        nodes[a].neighbors.push(nodes[b].id);
        nodes[b].neighbors.push(nodes[a].id);
      }
    }
    
    // Calculate DFS order
    const start = nodes[0].id;
    const visited = new Set<string>();
    const order: string[] = [];
    
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        // Sort neighbors alphabetically for consistent order
        const sortedNeighbors = [...node.neighbors].sort();
        for (const neighbor of sortedNeighbors) {
          dfs(neighbor);
        }
      }
    };
    
    dfs(start);
    
    return { nodes, start, order };
  };

  const generateRandomTree = (depth: number = 3): TreeNode => {
    let idCounter = 0;
    const generate = (d: number): TreeNode | null => {
      if (d <= 0 || Math.random() < 0.3) return null;
      return {
        id: `node-${idCounter++}`,
        value: Math.floor(Math.random() * 90) + 10,
        left: generate(d - 1),
        right: generate(d - 1),
      };
    };
    return generate(depth) || { id: 'root', value: 50 };
  };

  const generateValidBST = (depth: number = 3): TreeNode => {
    const values: number[] = [];
    const count = Math.pow(2, depth) - 1;
    for (let i = 0; i < count; i++) {
      let val;
      do {
        val = Math.floor(Math.random() * 90) + 10;
      } while (values.includes(val));
      values.push(val);
    }
    values.sort((a, b) => a - b);
    
    let idCounter = 0;
    const buildBST = (arr: number[]): TreeNode | null => {
      if (arr.length === 0) return null;
      const mid = Math.floor(arr.length / 2);
      return {
        id: `bst-${idCounter++}`,
        value: arr[mid],
        left: buildBST(arr.slice(0, mid)),
        right: buildBST(arr.slice(mid + 1)),
      };
    };
    
    return buildBST(values) || { id: 'root', value: 50 };
  };

  const isBST = (node: TreeNode | null, min = -Infinity, max = Infinity): boolean => {
    if (!node) return true;
    if (node.value <= min || node.value >= max) return false;
    return isBST(node.left || null, min, node.value) && isBST(node.right || null, node.value, max);
  };

  const startGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('playing');
    setLives(3);
    setScore(0);
    setRound(1);
    generateNewRound(mode, 1);
    playSound('click');
  };

  const generateNewRound = (mode: GameMode, currentRound: number) => {
    setShowingAnswer(false);
    setTimeLeft(30);
    
    if (mode === 'dfs-order') {
      const { nodes, start, order } = generateGraph();
      setGraph(nodes);
      setStartNode(start);
      setDfsOrder(order);
      setSelectedOrder([]);
    } else {
      // Find BST mode
      const treesArr: { tree: TreeNode; isBST: boolean }[] = [];
      const bstIndex = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < 3; i++) {
        if (i === bstIndex) {
          const bst = generateValidBST(3);
          treesArr.push({ tree: bst, isBST: true });
        } else {
          let randomTree = generateRandomTree(3);
          // Make sure it's not accidentally a BST
          while (isBST(randomTree)) {
            randomTree = generateRandomTree(3);
          }
          treesArr.push({ tree: randomTree, isBST: false });
        }
      }
      
      setTrees(treesArr);
      setCorrectBSTIndex(bstIndex);
      setSelectedTree(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (gameState !== 'playing' || gameMode !== 'dfs-order') return;
    
    const expectedNext = dfsOrder[selectedOrder.length];
    
    if (nodeId === expectedNext) {
      playSound('correct');
      const newOrder = [...selectedOrder, nodeId];
      setSelectedOrder(newOrder);
      
      if (newOrder.length === dfsOrder.length) {
        // Completed!
        const bonus = Math.floor(timeLeft * 5);
        const roundScore = 50 + bonus;
        setScore(prev => prev + roundScore);
        
        toast({
          title: '✅ Correct DFS Order!',
          description: `+${roundScore} points`,
        });
        
        nextRound();
      }
    } else {
      handleWrongAnswer();
    }
  };

  const handleTreeSelect = (index: number) => {
    if (gameState !== 'playing' || gameMode !== 'find-bst' || showingAnswer) return;
    
    setSelectedTree(index);
    setShowingAnswer(true);
    
    if (index === correctBSTIndex) {
      playSound('correct');
      const bonus = Math.floor(timeLeft * 5);
      const roundScore = 50 + bonus;
      setScore(prev => prev + roundScore);
      
      toast({
        title: '✅ Correct! That\'s the BST!',
        description: `+${roundScore} points`,
      });
      
      setTimeout(nextRound, 1500);
    } else {
      handleWrongAnswer();
    }
  };

  const nextRound = () => {
    if (round >= MAX_ROUNDS) {
      setGameState('won');
      saveScore();
    } else {
      setRound(prev => prev + 1);
      setTimeout(() => generateNewRound(gameMode, round + 1), 500);
    }
  };

  const handleWrongAnswer = () => {
    playSound('wrong');
    setShowingAnswer(true);
    const newLives = lives - 1;
    setLives(newLives);
    
    if (newLives <= 0) {
      setGameState('lost');
      playSound('gameOver');
      saveScore();
    } else {
      toast({
        title: '❌ Wrong!',
        description: `${newLives} lives remaining`,
        variant: 'destructive',
      });
      
      setTimeout(() => {
        generateNewRound(gameMode, round);
      }, 2000);
    }
  };

  const saveScore = async () => {
    if (user) {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: `dfs-${gameMode}`,
        score,
      });
    }
  };

  const renderGraph = () => {
    const edges: { from: GraphNode; to: GraphNode }[] = [];
    const addedEdges = new Set<string>();
    
    graph.forEach(node => {
      node.neighbors.forEach(neighborId => {
        const edgeKey = [node.id, neighborId].sort().join('-');
        if (!addedEdges.has(edgeKey)) {
          addedEdges.add(edgeKey);
          const neighbor = graph.find(n => n.id === neighborId);
          if (neighbor) {
            edges.push({ from: node, to: neighbor });
          }
        }
      });
    });
    
    return (
      <svg width={600} height={350} className="overflow-visible">
        {/* Edges */}
        {edges.map(({ from, to }) => (
          <line
            key={`${from.id}-${to.id}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-border"
            strokeWidth={2}
          />
        ))}
        
        {/* Nodes */}
        {graph.map((node, index) => {
          const isSelected = selectedOrder.includes(node.id);
          const orderIndex = selectedOrder.indexOf(node.id);
          const isNext = dfsOrder[selectedOrder.length] === node.id;
          const isStart = node.id === startNode;
          
          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={30}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected ? 'fill-primary stroke-primary' :
                  isStart ? 'fill-yellow-500/30 stroke-yellow-500' :
                  'fill-card stroke-border hover:stroke-primary'
                )}
                strokeWidth={3}
                onClick={() => handleNodeClick(node.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                className={cn(
                  'text-lg font-bold pointer-events-none',
                  isSelected ? 'fill-primary-foreground' : 'fill-foreground'
                )}
              >
                {node.id}
              </text>
              {isSelected && (
                <text
                  x={node.x}
                  y={node.y + 45}
                  textAnchor="middle"
                  className="text-xs fill-primary font-mono"
                >
                  #{orderIndex + 1}
                </text>
              )}
              {isStart && !isSelected && (
                <text
                  x={node.x}
                  y={node.y + 45}
                  textAnchor="middle"
                  className="text-xs fill-yellow-500"
                >
                  START
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  const renderMiniTree = (node: TreeNode | null, x: number, y: number, spread: number): JSX.Element[] => {
    if (!node) return [];
    
    const elements: JSX.Element[] = [];
    const nodeRadius = 18;
    const verticalGap = 50;
    
    // Edges
    if (node.left) {
      elements.push(
        <line
          key={`edge-left-${node.id}`}
          x1={x}
          y1={y + nodeRadius}
          x2={x - spread}
          y2={y + verticalGap - nodeRadius}
          className="stroke-border"
          strokeWidth={1.5}
        />
      );
    }
    if (node.right) {
      elements.push(
        <line
          key={`edge-right-${node.id}`}
          x1={x}
          y1={y + nodeRadius}
          x2={x + spread}
          y2={y + verticalGap - nodeRadius}
          className="stroke-border"
          strokeWidth={1.5}
        />
      );
    }
    
    // Node
    elements.push(
      <g key={node.id}>
        <circle
          cx={x}
          cy={y}
          r={nodeRadius}
          className="fill-card stroke-primary"
          strokeWidth={2}
        />
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xs font-semibold fill-foreground"
        >
          {node.value}
        </text>
      </g>
    );
    
    // Children
    elements.push(...renderMiniTree(node.left || null, x - spread, y + verticalGap, spread / 2));
    elements.push(...renderMiniTree(node.right || null, x + spread, y + verticalGap, spread / 2));
    
    return elements;
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
                🔎 {gameMode === 'dfs-order' ? 'DFS Order' : 'Find the BST'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {gameState === 'playing' ? `Round ${round}/${MAX_ROUNDS}` : 'Choose a challenge'}
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Left
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-center">{timeLeft}s</div>
                  <Progress value={(timeLeft / 30) * 100} className="mt-2 h-2" />
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {gameMode === 'dfs-order' ? (
                  <p>Click nodes in DFS order starting from the highlighted START node. Visit neighbors alphabetically!</p>
                ) : (
                  <p>Find the tree that is a valid Binary Search Tree (BST). Remember: left &lt; root &lt; right!</p>
                )}
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
                    className="text-center space-y-6"
                  >
                    <div className="text-6xl">🔎</div>
                    <h2 className="text-2xl font-display font-bold">Graph & BST Challenge</h2>
                    <p className="text-muted-foreground max-w-md">
                      Test your understanding of DFS traversal and BST properties!
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" onClick={() => startGame('dfs-order')}>
                        <Play className="mr-2 h-4 w-4" />
                        DFS Order
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => startGame('find-bst')}>
                        <Play className="mr-2 h-4 w-4" />
                        Find the BST
                      </Button>
                    </div>
                  </motion.div>
                )}
                
                {gameState === 'playing' && gameMode === 'dfs-order' && (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    {renderGraph()}
                    <div className="mt-4 text-sm text-muted-foreground">
                      Progress: {selectedOrder.length}/{dfsOrder.length} nodes visited
                    </div>
                  </div>
                )}
                
                {gameState === 'playing' && gameMode === 'find-bst' && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <p className="text-lg font-semibold mb-2">Which one is a valid BST?</p>
                    <div className="flex gap-6">
                      {trees.map((t, index) => (
                        <motion.div
                          key={index}
                          className={cn(
                            'p-4 rounded-xl border-2 cursor-pointer transition-all',
                            selectedTree === index 
                              ? showingAnswer && index === correctBSTIndex
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-red-500 bg-red-500/10'
                              : showingAnswer && index === correctBSTIndex
                                ? 'border-green-500 bg-green-500/10'
                                : 'border-border hover:border-primary'
                          )}
                          onClick={() => handleTreeSelect(index)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <svg width={180} height={180}>
                            {renderMiniTree(t.tree, 90, 25, 40)}
                          </svg>
                          <p className="text-center text-sm font-medium mt-2">Tree {index + 1}</p>
                        </motion.div>
                      ))}
                    </div>
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
                      <Button onClick={() => startGame(gameMode)}>
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
