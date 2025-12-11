import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/Leaderboard';
import { Brain, Zap, Trophy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const TestHub = () => {
  const navigate = useNavigate();

  const quizModes = [
    {
      id: 'endless-quiz',
      title: 'Endless Quiz',
      description: 'Answer as many questions as you can. Wrong answer ends the run!',
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      id: 'speed-round',
      title: 'Speed Round',
      description: 'Race against time! 60 seconds to answer as many as possible.',
      icon: Brain,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">Test Yourself</h1>
          <p className="text-muted-foreground text-lg">
            Challenge your knowledge with endless quiz modes!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Quiz Modes
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quizModes.map((mode, index) => (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
                    onClick={() => navigate(`/test/${mode.id}`)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${mode.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <mode.icon className={`w-6 h-6 ${mode.color}`} />
                      </div>
                      <CardTitle className="text-xl">{mode.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{mode.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Leaderboard gameType="endless-quiz" title="Endless Quiz Leaders" limit={5} />
            <Leaderboard gameType="speed-round" title="Speed Round Leaders" limit={5} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestHub;
