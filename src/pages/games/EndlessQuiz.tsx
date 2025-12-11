import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Leaderboard } from '@/components/Leaderboard';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Heart, Zap, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  category: string;
}

const allQuestions: Question[] = [
  // Binary Tree
  { id: 1, question: "What is the maximum number of nodes at level L of a binary tree?", options: ["L", "2^L", "2L", "L^2"], correct: 1, category: "Binary Tree" },
  { id: 2, question: "In a full binary tree, how many leaf nodes are there if there are N internal nodes?", options: ["N", "N+1", "N-1", "2N"], correct: 1, category: "Binary Tree" },
  { id: 3, question: "What is the height of a binary tree with N nodes in the worst case?", options: ["log N", "N", "N-1", "N/2"], correct: 2, category: "Binary Tree" },
  
  // BST
  { id: 4, question: "In a BST, where is the smallest element located?", options: ["Root", "Leftmost node", "Rightmost node", "Any leaf"], correct: 1, category: "BST" },
  { id: 5, question: "What is the time complexity of searching in a balanced BST?", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correct: 1, category: "BST" },
  { id: 6, question: "Which traversal of BST gives elements in sorted order?", options: ["Preorder", "Postorder", "Inorder", "Level order"], correct: 2, category: "BST" },
  
  // BFS
  { id: 7, question: "What data structure does BFS use?", options: ["Stack", "Queue", "Array", "Tree"], correct: 1, category: "BFS" },
  { id: 8, question: "BFS is optimal for finding:", options: ["Longest path", "Shortest path (unweighted)", "All paths", "Cycle detection"], correct: 1, category: "BFS" },
  { id: 9, question: "What is the time complexity of BFS?", options: ["O(V)", "O(E)", "O(V+E)", "O(V*E)"], correct: 2, category: "BFS" },
  
  // DFS
  { id: 10, question: "What data structure does DFS use?", options: ["Queue", "Stack", "Heap", "Array"], correct: 1, category: "DFS" },
  { id: 11, question: "Which traversal is NOT a type of DFS?", options: ["Preorder", "Inorder", "Level order", "Postorder"], correct: 2, category: "DFS" },
  { id: 12, question: "DFS can be used to detect:", options: ["Shortest path", "Cycles in a graph", "Minimum spanning tree", "Maximum flow"], correct: 1, category: "DFS" },
  
  // More questions
  { id: 13, question: "What is the space complexity of BFS?", options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correct: 2, category: "BFS" },
  { id: 14, question: "In postorder traversal, when is the root visited?", options: ["First", "Middle", "Last", "Random"], correct: 2, category: "Binary Tree" },
  { id: 15, question: "What makes a tree a valid BST?", options: ["Balanced height", "Left < Root < Right", "Complete structure", "All leaves at same level"], correct: 1, category: "BST" },
  { id: 16, question: "How many children can a node have in a binary tree?", options: ["1", "2", "At most 2", "Any number"], correct: 2, category: "Binary Tree" },
  { id: 17, question: "What is the predecessor of a node in BST?", options: ["Parent node", "Left child", "Maximum in left subtree", "Minimum in right subtree"], correct: 2, category: "BST" },
  { id: 18, question: "BFS explores nodes in which order?", options: ["Depth-first", "Level by level", "Random", "Reverse level"], correct: 1, category: "BFS" },
  { id: 19, question: "What happens in DFS when a dead end is reached?", options: ["Stops", "Restarts", "Backtracks", "Jumps randomly"], correct: 2, category: "DFS" },
  { id: 20, question: "The successor of a node in BST is:", options: ["Maximum in left subtree", "Minimum in right subtree", "Parent node", "Right child"], correct: 1, category: "BST" },
];

const EndlessQuiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver'>('ready');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);

  const getNextQuestion = useCallback(() => {
    const available = allQuestions.filter(q => !usedQuestions.includes(q.id));
    if (available.length === 0) {
      setUsedQuestions([]);
      return allQuestions[Math.floor(Math.random() * allQuestions.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  }, [usedQuestions]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setStreak(0);
    setLives(3);
    setUsedQuestions([]);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    const question = getNextQuestion();
    setCurrentQuestion(question);
    playSound('click');
  };

  const handleAnswer = async (answerIndex: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setTotalAnswers(prev => prev + 1);

    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      playSound('correct');
      const streakBonus = Math.floor(streak / 3) * 10;
      const points = 100 + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      if (streak > 0 && streak % 5 === 4) {
        playSound('levelUp');
      }
    } else {
      playSound('wrong');
      setStreak(0);
      setLives(prev => prev - 1);
      
      if (lives <= 1) {
        setGameState('gameOver');
        playSound('gameOver');
        
        if (user) {
          const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / (totalAnswers)) * 100) : 0;
          await supabase.from('game_scores').insert({
            user_id: user.id,
            game_type: 'endless-quiz',
            score: score + (isCorrect ? 100 : 0),
            accuracy,
          });
          toast.success('Score saved to leaderboard!');
        }
        return;
      }
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setUsedQuestions(prev => [...prev, currentQuestion.id]);
      setCurrentQuestion(getNextQuestion());
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/test')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Test Hub
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Endless Quiz</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {gameState === 'ready' && (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
                      <h2 className="text-2xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
                      <p className="text-muted-foreground mb-6">
                        Answer questions about Binary Trees, BST, BFS, and DFS.
                        <br />You have 3 lives. Keep your streak going for bonus points!
                      </p>
                      <Button size="lg" onClick={startGame}>
                        Start Quiz
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {gameState === 'playing' && currentQuestion && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      {[...Array(3)].map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted'}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Streak: <span className="text-primary font-bold">{streak}</span>
                      </span>
                      <span className="text-lg font-bold">
                        Score: <span className="text-primary">{score}</span>
                      </span>
                    </div>
                  </div>

                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {currentQuestion.category}
                      </span>
                      <h2 className="text-xl font-semibold mt-2 mb-6">
                        {currentQuestion.question}
                      </h2>

                      <div className="grid gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: showResult ? 1 : 1.02 }}
                            whileTap={{ scale: showResult ? 1 : 0.98 }}
                            onClick={() => handleAnswer(index)}
                            disabled={showResult}
                            className={`p-4 rounded-lg text-left transition-all ${
                              showResult
                                ? index === currentQuestion.correct
                                  ? 'bg-green-500/20 border-green-500 border-2'
                                  : index === selectedAnswer
                                    ? 'bg-red-500/20 border-red-500 border-2'
                                    : 'bg-muted/30 border border-transparent'
                                : 'bg-muted/50 hover:bg-muted border border-transparent hover:border-primary/50'
                            }`}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {gameState === 'gameOver' && (
                <motion.div
                  key="gameOver"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 text-center">
                      <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
                      <p className="text-5xl font-bold text-primary mb-4">{score}</p>
                      <p className="text-muted-foreground mb-2">
                        Correct: {correctAnswers} / {totalAnswers}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        Accuracy: {totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0}%
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={startGame}>
                          Play Again
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/test')}>
                          Back to Hub
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <Leaderboard gameType="endless-quiz" title="Top Scores" limit={10} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EndlessQuiz;
