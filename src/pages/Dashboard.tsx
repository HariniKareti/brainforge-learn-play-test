import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { ModeCard } from '@/components/ModeCard';
import { BookOpen, Gamepad2, Target, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Welcome Section */}
        <section className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Welcome to <span className="text-gradient">BrainForge</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master Data Structures & Algorithms through interactive learning, 
            challenging games, and action-packed quizzes.
          </p>
        </section>

        {/* Mode Selection */}
        <section className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <ModeCard
            title="Learn"
            description="Step-by-step guided tutorials with zero frustration. No lives, no penalties - just pure learning."
            icon={BookOpen}
            to="/learn"
            color="success"
            available
          />
          
          <ModeCard
            title="Play"
            description="Challenge yourself with puzzle-based gameplay. Lives, scores, and increasing difficulty await!"
            icon={Gamepad2}
            to="/play"
            color="primary"
            available
          />
          
          <ModeCard
            title="Test Yourself"
            description="Endless runner quiz mode. Answer questions, dodge obstacles, and climb the leaderboards!"
            icon={Target}
            to="/test"
            color="accent"
            available
          />
        </section>
      </main>
    </div>
  );
}