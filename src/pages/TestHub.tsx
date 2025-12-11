import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/Leaderboard';
import { ArrowLeft, Binary, GitBranch, Network, Share2, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';

const TestHub = () => {
  const navigate = useNavigate();

  const topics = [
    {
      id: 'binary-trees',
      title: 'Binary Trees',
      description: 'Test your knowledge of binary tree concepts and structures',
      icon: Binary,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'bst',
      title: 'Binary Search Trees',
      description: 'Challenge yourself with BST properties and operations',
      icon: GitBranch,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'bfs',
      title: 'Breadth-First Search',
      description: 'Quiz on BFS algorithm and level-order traversal',
      icon: Share2,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      id: 'dfs',
      title: 'Depth-First Search',
      description: 'Test DFS concepts and traversal methods',
      icon: Workflow,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      id: 'graphs',
      title: 'Graphs',
      description: 'Quiz on graph theory fundamentals',
      icon: Network,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
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
            Choose a topic and run through the endless quiz!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold">Select a Topic</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group h-full"
                    onClick={() => navigate(`/test/quiz/${topic.id}`)}
                  >
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${topic.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        <topic.icon className={`w-6 h-6 ${topic.color}`} />
                      </div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{topic.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Leaderboard gameType="endless-runner" title="Top Quiz Runners" limit={10} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestHub;
