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
import { ArrowLeft, Clock, Zap, Volume2, VolumeX } from 'lucide-react';
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
  { id: 1, question: "BFS uses which data structure?", options: ["Stack", "Queue", "Heap", "Array"], correct: 1, category: "BFS" },
  { id: 2, question: "DFS uses which data structure?", options: ["Queue", "Stack", "Heap", "Tree"], correct: 1, category: "DFS" },
  { id: 3, question: "Inorder traversal of BST gives?", options: ["Random", "Sorted", "Reverse sorted", "Level order"], correct: 1, category: "BST" },
  { id: 4, question: "Max nodes at level L?", options: ["L", "2^L", "2L", "L^2"], correct: 1, category: "Tree" },
  { id: 5, question: "Smallest element in BST is at?", options: ["Root", "Leftmost", "Rightmost", "Random"], correct: 1, category: "BST" },
  { id: 6, question: "BFS time complexity?", options: ["O(V)", "O(E)", "O(V+E)", "O(VE)"], correct: 2, category: "BFS" },
  { id: 7, question: "Root visited last in?", options: ["Preorder", "Inorder", "Postorder", "Level"], correct: 2, category: "Tree" },
  { id: 8, question: "Root visited first in?", options: ["Preorder", "Inorder", "Postorder", "None"], correct: 0, category: "Tree" },
  { id: 9, question: "BST search complexity?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 1, category: "BST" },
  { id: 10, question: "DFS can detect?", options: ["Shortest path", "Cycles", "MST", "Max flow"], correct: 1, category: "DFS" },
  { id: 11, question: "BFS finds shortest path in?", options: ["Weighted", "Unweighted", "Both", "Neither"], correct: 1, category: "BFS" },
  { id: 12, question: "Complete binary tree has?", options: ["All leaves", "All levels full", "Left-filled", "Random"], correct: 2, category: "Tree" },
  { id: 13, question: "BST property?", options: ["Left < Root", "Root < Right", "Left < Root < Right", "Random"], correct: 2, category: "BST" },
  { id: 14, question: "DFS space complexity?", options: ["O(1)", "O(h)", "O(n)", "O(n²)"], correct: 1, category: "DFS" },
  { id: 15, question: "Level order uses?", options: ["DFS", "BFS", "Both", "Neither"], correct: 1, category: "Tree" },
];

const SpeedRound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver'>('ready');
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
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
    setTimeLeft(60);
    setScore(0);
    setUsedQuestions([]);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setCurrentQuestion(getNextQuestion());
    playSound('click');
  };

  const endGame = useCallback(async () => {
    setGameState('gameOver');
    playSound('gameOver');
    
    if (user && totalAnswers > 0) {
      const accuracy = Math.round((correctAnswers / totalAnswers) * 100);
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: 'speed-round',
        score,
        accuracy,
        time_taken: 60,
      });
      toast.success('Score saved to leaderboard!');
    }
  }, [user, score, correctAnswers, totalAnswers, playSound]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, endGame]);

  const handleAnswer = (answerIndex: number) => {
    if (showResult || !currentQuestion || gameState !== 'playing') return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    setTotalAnswers(prev => prev + 1);

    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      playSound('correct');
      const timeBonus = Math.floor(timeLeft / 10) * 5;
      setScore(prev => prev + 50 + timeBonus);
      setCorrectAnswers(prev => prev + 1);
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowResult(false);
      setUsedQuestions(prev => [...prev, currentQuestion.id]);
      setCurrentQuestion(getNextQuestion());
    }, 500);
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
          <h1 className="text-3xl font-bold">Speed Round</h1>
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
                      <Clock className="w-16 h-16 mx-auto text-primary mb-4" />
                      <h2 className="text-2xl font-bold mb-4">60 Second Challenge!</h2>
                      <p className="text-muted-foreground mb-6">
                        Answer as many questions as you can in 60 seconds.
                        <br />Faster answers earn bonus points!
                      </p>
                      <Button size="lg" onClick={startGame}>
                        Start Speed Round
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
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                        <span className={`font-bold text-xl ${timeLeft <= 10 ? 'text-red-500' : ''}`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <span className="text-lg font-bold">
                        Score: <span className="text-primary">{score}</span>
                      </span>
                    </div>
                    <Progress value={(timeLeft / 60) * 100} className="h-2" />
                  </div>

                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {currentQuestion.category}
                      </span>
                      <h2 className="text-xl font-semibold mt-2 mb-6">
                        {currentQuestion.question}
                      </h2>

                      <div className="grid grid-cols-2 gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: showResult ? 1 : 1.02 }}
                            whileTap={{ scale: showResult ? 1 : 0.98 }}
                            onClick={() => handleAnswer(index)}
                            disabled={showResult}
                            className={`p-4 rounded-lg text-center transition-all ${
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
                      <h2 className="text-3xl font-bold mb-2">Time's Up!</h2>
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
            <Leaderboard gameType="speed-round" title="Top Scores" limit={10} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpeedRound;
