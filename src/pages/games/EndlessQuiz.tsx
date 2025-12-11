import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaderboard } from '@/components/Leaderboard';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Heart, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { getQuestionsForTopic, QuizQuestion } from '@/data/quizQuestions';

interface QuestionBubble {
  id: number;
  x: number;
  y: number;
  question: QuizQuestion;
}

const topicNames: Record<string, string> = {
  'binary-trees': 'Binary Trees',
  'bst': 'Binary Search Trees',
  'bfs': 'Breadth-First Search',
  'dfs': 'Depth-First Search',
  'graphs': 'Graphs',
};

const EndlessQuiz = () => {
  const navigate = useNavigate();
  const { topic } = useParams<{ topic: string }>();
  const { user } = useAuth();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { playSound } = useSoundEffects(soundEnabled);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  
  const questions = getQuestionsForTopic(topic || 'binary-trees');
  const topicTitle = topicNames[topic || 'binary-trees'] || 'Quiz';
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'paused' | 'gameOver'>('ready');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [isJumping, setIsJumping] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [bubbles, setBubbles] = useState<QuestionBubble[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [backgroundOffset, setBackgroundOffset] = useState(0);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());
  
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const GROUND_Y = 300;
  const PLAYER_SIZE = 50;
  const BUBBLE_SIZE = 40;

  const getRandomQuestion = useCallback(() => {
    const availableQuestions = questions.filter(q => !usedQuestions.has(q.id));
    if (availableQuestions.length === 0) {
      setUsedQuestions(new Set());
      return questions[Math.floor(Math.random() * questions.length)];
    }
    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setUsedQuestions(prev => new Set([...prev, question.id]));
    return question;
  }, [questions, usedQuestions]);

  const jump = useCallback(() => {
    if (!isJumping && gameState === 'playing') {
      setIsJumping(true);
      setVelocity(JUMP_FORCE);
      playSound('click');
    }
  }, [isJumping, gameState, playSound]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'playing') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      setVelocity((v) => v + GRAVITY);

      setPlayerY((y) => {
        let newY = y + velocity;
        if (newY >= GROUND_Y) {
          newY = GROUND_Y;
          setIsJumping(false);
          setVelocity(0);
        }
        if (newY < 50) newY = 50;
        return newY;
      });

      setBackgroundOffset((o) => (o + gameSpeed) % 200);

      setBubbles((prev) => {
        const updated = prev
          .map((b) => ({ ...b, x: b.x - gameSpeed }))
          .filter((b) => b.x > -BUBBLE_SIZE);

        const playerBox = {
          left: 100,
          right: 100 + PLAYER_SIZE,
          top: playerY - PLAYER_SIZE,
          bottom: playerY,
        };

        for (const bubble of updated) {
          const bubbleBox = {
            left: bubble.x,
            right: bubble.x + BUBBLE_SIZE,
            top: bubble.y,
            bottom: bubble.y + BUBBLE_SIZE,
          };

          if (
            playerBox.left < bubbleBox.right &&
            playerBox.right > bubbleBox.left &&
            playerBox.top < bubbleBox.bottom &&
            playerBox.bottom > bubbleBox.top
          ) {
            setCurrentQuestion(bubble.question);
            setGameState('paused');
            playSound('click');
            return updated.filter((b) => b.id !== bubble.id);
          }
        }

        return updated;
      });

      if (Math.random() < 0.01) {
        const randomQuestion = getRandomQuestion();
        setBubbles((prev) => [
          ...prev,
          {
            id: Date.now(),
            x: 800,
            y: Math.random() * 200 + 100,
            question: randomQuestion,
          },
        ]);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, velocity, playerY, gameSpeed, playSound, getRandomQuestion]);

  const startGame = () => {
    setGameState('playing');
    setLives(3);
    setScore(0);
    setPlayerY(GROUND_Y);
    setVelocity(0);
    setIsJumping(false);
    setBubbles([]);
    setCurrentQuestion(null);
    setGameSpeed(3);
    setUsedQuestions(new Set());
    playSound('click');
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!currentQuestion) return;

    const isCorrect = answerIndex === currentQuestion.correct;

    if (isCorrect) {
      playSound('correct');
      setScore((s) => s + 10);
      setGameSpeed((s) => Math.min(s + 0.3, 8));
      toast.success('+10 points!');
    } else {
      playSound('wrong');
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        setGameState('gameOver');
        playSound('gameOver');

        if (user) {
          await supabase.from('game_scores').insert({
            user_id: user.id,
            game_type: 'endless-runner',
            score,
          });
          toast.success('Score saved!');
        }
        return;
      }
    }

    setCurrentQuestion(null);
    setGameState('playing');
  };

  const renderPixelForest = () => {
    const trees = [];
    for (let i = 0; i < 10; i++) {
      const x = (i * 100 - backgroundOffset + 1000) % 1000 - 100;
      trees.push(
        <g key={i} transform={`translate(${x}, 250)`}>
          <rect x="15" y="30" width="20" height="50" fill="#8B4513" />
          <polygon points="25,0 0,30 50,30" fill="#228B22" />
          <polygon points="25,15 5,40 45,40" fill="#2E8B57" />
        </g>
      );
    }
    return trees;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/test')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Test Hub
        </Button>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{topicTitle} Quiz</h1>
            <p className="text-muted-foreground">Endless Runner Edition</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  ref={gameRef}
                  className="relative w-full h-[400px] bg-gradient-to-b from-sky-400 to-sky-200 cursor-pointer overflow-hidden"
                  onClick={jump}
                  style={{ imageRendering: 'pixelated' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200" />

                  <svg className="absolute inset-0 w-full h-full">
                    <rect x="0" y="320" width="100%" height="80" fill="#8B4513" />
                    <rect x="0" y="320" width="100%" height="10" fill="#228B22" />
                    {renderPixelForest()}
                  </svg>

                  <div className="absolute top-4 left-4 flex items-center gap-4 z-20">
                    <div className="flex items-center gap-1">
                      {[...Array(3)].map((_, i) => (
                        <Heart
                          key={i}
                          className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                        />
                      ))}
                    </div>
                    <div className="bg-black/50 px-3 py-1 rounded text-white font-mono">
                      Score: {score}
                    </div>
                  </div>

                  {gameState === 'playing' && (
                    <motion.div
                      className="absolute w-[50px] h-[50px] z-10"
                      style={{
                        left: 100,
                        top: playerY - PLAYER_SIZE,
                      }}
                      animate={{ rotate: isJumping ? -15 : 0 }}
                    >
                      <svg viewBox="0 0 16 16" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
                        <rect x="6" y="0" width="4" height="4" fill="#FFE4C4" />
                        <rect x="4" y="4" width="8" height="4" fill="#4169E1" />
                        <rect x="4" y="8" width="8" height="4" fill="#4169E1" />
                        <rect x="4" y="12" width="3" height="4" fill="#8B4513" />
                        <rect x="9" y="12" width="3" height="4" fill="#8B4513" />
                      </svg>
                    </motion.div>
                  )}

                  {gameState === 'playing' &&
                    bubbles.map((bubble) => (
                      <motion.div
                        key={bubble.id}
                        className="absolute w-[40px] h-[40px] bg-yellow-400 rounded-full flex items-center justify-center text-2xl border-4 border-yellow-600 shadow-lg"
                        style={{
                          left: bubble.x,
                          top: bubble.y,
                        }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                      >
                        ❓
                      </motion.div>
                    ))}

                  {gameState === 'ready' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                      <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-2">{topicTitle}</h2>
                        <p className="text-xl mb-4">Endless Quiz Runner</p>
                        <p className="mb-2">Jump to collect question bubbles!</p>
                        <p className="mb-4 text-sm text-gray-300">Press SPACE or tap to jump</p>
                        <Button size="lg" onClick={startGame}>
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {gameState === 'paused' && currentQuestion && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/70 z-30"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          className="bg-card p-6 rounded-xl max-w-md w-full mx-4 border-2 border-primary"
                        >
                          <span className="text-xs text-muted-foreground uppercase">
                            {topicTitle}
                          </span>
                          <h3 className="text-lg font-semibold mt-1 mb-4">
                            {currentQuestion.question}
                          </h3>
                          <div className="grid gap-2">
                            {currentQuestion.options.map((option, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start text-left h-auto py-3"
                                onClick={() => handleAnswer(index)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {gameState === 'gameOver' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
                      <div className="text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Game Over!</h2>
                        <p className="text-5xl font-bold text-primary mb-4">{score}</p>
                        <div className="flex gap-4 justify-center">
                          <Button onClick={startGame}>Play Again</Button>
                          <Button variant="outline" onClick={() => navigate('/test')}>
                            Back to Hub
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground mt-2 text-center">
              Press SPACE, UP ARROW, or tap/click to jump
            </p>
          </div>

          <div>
            <Leaderboard gameType="endless-runner" title="Top Runners" limit={10} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EndlessQuiz;
