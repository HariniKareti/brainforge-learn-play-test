import { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Trophy, Clock, RotateCcw, Play, Flag, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

type GameState = 'ready' | 'playing' | 'won' | 'lost';
type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited' | 'wrong';

interface Cell {
  row: number;
  col: number;
  type: CellType;
}

const GRID_SIZE = 8;

function generateMaze(): Cell[][] {
  const grid: Cell[][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    grid[row] = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      grid[row][col] = {
        row,
        col,
        type: Math.random() < 0.25 ? 'wall' : 'empty',
      };
    }
  }
  
  // Set start and end
  grid[0][0] = { row: 0, col: 0, type: 'start' };
  grid[GRID_SIZE - 1][GRID_SIZE - 1] = { row: GRID_SIZE - 1, col: GRID_SIZE - 1, type: 'end' };
  
  // Ensure path exists with BFS
  if (!hasPath(grid)) {
    // Clear a path
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[i][i].type === 'wall') grid[i][i].type = 'empty';
    }
  }
  
  return grid;
}

function hasPath(grid: Cell[][]): boolean {
  const visited = new Set<string>();
  const queue: [number, number][] = [[0, 0]];
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) return true;
    
    const neighbors = [
      [row - 1, col], [row + 1, col],
      [row, col - 1], [row, col + 1],
    ];
    
    for (const [r, c] of neighbors) {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        if (grid[r][c].type !== 'wall' && !visited.has(`${r},${c}`)) {
          queue.push([r, c]);
        }
      }
    }
  }
  
  return false;
}

function findShortestPath(grid: Cell[][]): [number, number][] | null {
  const visited = new Map<string, [number, number] | null>();
  const queue: [number, number][] = [[0, 0]];
  visited.set('0,0', null);
  
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) {
      // Reconstruct path
      const path: [number, number][] = [];
      let current: [number, number] | null = [row, col];
      while (current) {
        path.unshift(current);
        current = visited.get(`${current[0]},${current[1]}`) ?? null;
      }
      return path;
    }
    
    const neighbors: [number, number][] = [
      [row - 1, col], [row + 1, col],
      [row, col - 1], [row, col + 1],
    ];
    
    for (const [r, c] of neighbors) {
      const key = `${r},${c}`;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        if (grid[r][c].type !== 'wall' && !visited.has(key)) {
          visited.set(key, [row, col]);
          queue.push([r, c]);
        }
      }
    }
  }
  
  return null;
}

export default function PathfinderGame() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [userPath, setUserPath] = useState<[number, number][]>([]);
  const [shortestPath, setShortestPath] = useState<[number, number][]>([]);

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
      toast({ title: '💔 Game Over!', description: `Final Score: ${score}`, variant: 'destructive' });
    } else {
      toast({ title: '⏱️ Time\'s up!', description: `${newLives} lives left`, variant: 'destructive' });
      generateNewLevel();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setLevel(0);
    generateNewLevel();
  };

  const generateNewLevel = () => {
    const newGrid = generateMaze();
    setGrid(newGrid);
    setShortestPath(findShortestPath(newGrid) || []);
    setUserPath([[0, 0]]);
    setTimeLeft(60);
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    
    const cell = grid[row][col];
    if (cell.type === 'wall') return;
    
    const [lastRow, lastCol] = userPath[userPath.length - 1];
    const isAdjacent = Math.abs(row - lastRow) + Math.abs(col - lastCol) === 1;
    
    if (!isAdjacent) {
      toast({ title: '⚠️ Must move to adjacent cell', variant: 'destructive' });
      return;
    }
    
    // Check if backtracking
    if (userPath.length > 1) {
      const [prevRow, prevCol] = userPath[userPath.length - 2];
      if (row === prevRow && col === prevCol) {
        setUserPath(prev => prev.slice(0, -1));
        return;
      }
    }
    
    const newPath = [...userPath, [row, col] as [number, number]];
    setUserPath(newPath);
    
    // Update grid display
    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })));
      if (newGrid[row][col].type === 'empty') {
        newGrid[row][col].type = 'path';
      }
      return newGrid;
    });
    
    // Check if reached end
    if (row === GRID_SIZE - 1 && col === GRID_SIZE - 1) {
      const pathEfficiency = shortestPath.length / newPath.length;
      const bonus = Math.floor(pathEfficiency * 100) + Math.floor(timeLeft * 2);
      const levelScore = 50 + bonus;
      
      setScore(prev => prev + levelScore);
      setLevel(prev => prev + 1);
      
      toast({
        title: '🎉 Level Complete!',
        description: `+${levelScore} points (${Math.round(pathEfficiency * 100)}% efficient)`,
      });
      
      setTimeout(generateNewLevel, 1500);
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

  const getCellColor = (cell: Cell) => {
    switch (cell.type) {
      case 'start': return 'bg-success';
      case 'end': return 'bg-destructive';
      case 'wall': return 'bg-muted-foreground/50';
      case 'path': return 'bg-primary/60';
      case 'visited': return 'bg-primary/30';
      case 'wrong': return 'bg-destructive/30';
      default: return 'bg-muted/50 hover:bg-muted';
    }
  };

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
              <h1 className="text-2xl font-display font-bold">🧭 Pathfinder</h1>
              <p className="text-sm text-muted-foreground">Find the shortest path using BFS concepts</p>
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time Left
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-mono font-bold text-center">{timeLeft}s</div>
                  <Progress value={(timeLeft / 60) * 100} className="mt-2 h-2" />
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-success rounded" />
                  <span>Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded" />
                  <span>End (Goal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted-foreground/50 rounded" />
                  <span>Wall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary/60 rounded" />
                  <span>Your Path</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-medium">{level + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your path:</span>
                  <span className="font-medium">{userPath.length} cells</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Optimal:</span>
                  <span className="font-medium">{shortestPath.length} cells</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Card className="h-[500px]">
              <CardContent className="h-full flex items-center justify-center p-4">
                {gameState === 'ready' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="text-6xl">🧭</div>
                    <h2 className="text-2xl font-display font-bold">Pathfinder</h2>
                    <p className="text-muted-foreground max-w-md">
                      Navigate from start (green) to end (red). Find the shortest path 
                      like BFS does! Efficiency bonus for optimal paths.
                    </p>
                    <Button size="lg" onClick={startGame}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Game
                    </Button>
                  </motion.div>
                )}
                
                {gameState === 'playing' && (
                  <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {grid.map((row, rowIdx) =>
                      row.map((cell, colIdx) => (
                        <motion.button
                          key={`${rowIdx}-${colIdx}`}
                          whileHover={{ scale: cell.type !== 'wall' ? 1.1 : 1 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors flex items-center justify-center',
                            getCellColor(cell),
                            cell.type !== 'wall' && 'cursor-pointer'
                          )}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                        >
                          {cell.type === 'start' && <Flag className="h-5 w-5 text-white" />}
                          {cell.type === 'end' && <Target className="h-5 w-5 text-white" />}
                        </motion.button>
                      ))
                    )}
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
                    <p className="text-muted-foreground">You reached level {level + 1}</p>
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
