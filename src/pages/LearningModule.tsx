import { useState, useEffect, useCallback } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { TreeVisualization, TreeNodeData } from '@/components/learn/TreeVisualization';
import { QueueVisualization } from '@/components/learn/QueueVisualization';
import { StackVisualization } from '@/components/learn/StackVisualization';
import { GraphVisualization, GraphNode, GraphEdge } from '@/components/learn/GraphVisualization';
import { LessonStep, StepProgress } from '@/components/learn/LessonStep';
import { TraversalDisplay, MultiTraversalDisplay } from '@/components/learn/TraversalDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  binaryTreeLessons, 
  bstLessons, 
  bfsLessons, 
  dfsLessons,
  Lesson 
} from '@/data/lessons';
import { 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  Pause, 
  RotateCcw,
  Lightbulb,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const topicConfig: Record<string, { 
  title: string; 
  lessons: Lesson[]; 
  color: string;
  icon: string;
}> = {
  'binary-tree': {
    title: 'Binary Tree',
    lessons: binaryTreeLessons,
    color: 'topic-tree',
    icon: '🌲'
  },
  'bst': {
    title: 'Binary Search Tree',
    lessons: bstLessons,
    color: 'topic-bst',
    icon: '🔍'
  },
  'bfs': {
    title: 'Breadth-First Search',
    lessons: bfsLessons,
    color: 'topic-bfs',
    icon: '⬅️➡️'
  },
  'dfs': {
    title: 'Depth-First Search',
    lessons: dfsLessons,
    color: 'topic-dfs',
    icon: '⬆️⬇️'
  }
};

export default function LearningModule() {
  const { topicId } = useParams<{ topicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [tree, setTree] = useState<TreeNodeData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [traversalResult, setTraversalResult] = useState<(number | string)[]>([]);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [queue, setQueue] = useState<{ id: string; value: number | string }[]>([]);
  const [stack, setStack] = useState<{ id: string; value: number | string }[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(800);
  
  const config = topicId ? topicConfig[topicId] : null;
  
  useEffect(() => {
    if (config) {
      const lesson = config.lessons[currentStep];
      if (lesson?.content.initialState) {
        setTree(lesson.content.initialState);
      }
      setTraversalResult([]);
      setHighlightedPath([]);
      setQueue([]);
      setStack([]);
    }
  }, [currentStep, config]);

  // Load progress from database
  useEffect(() => {
    async function loadProgress() {
      if (!user || !topicId) return;
      
      const { data } = await supabase
        .from('learning_progress')
        .select('current_step, completed')
        .eq('user_id', user.id)
        .eq('topic', topicId)
        .maybeSingle();
      
      if (data) {
        setCurrentStep(data.current_step);
        const completed = new Set<number>();
        for (let i = 0; i < data.current_step; i++) {
          completed.add(i);
        }
        setCompletedSteps(completed);
      }
    }
    loadProgress();
  }, [user, topicId]);

  // Save progress to database
  const saveProgress = useCallback(async (step: number, isCompleted: boolean = false) => {
    if (!user || !topicId) return;
    
    const { error } = await supabase
      .from('learning_progress')
      .upsert({
        user_id: user.id,
        topic: topicId,
        current_step: step,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,topic'
      });
    
    if (error) {
      console.error('Failed to save progress:', error);
    }
  }, [user, topicId]);

  const handleNextStep = () => {
    if (!config) return;
    
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);
    
    if (currentStep < config.lessons.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep, false);
    } else {
      saveProgress(currentStep, true);
      toast({
        title: '🎉 Module Complete!',
        description: `You've completed the ${config.title} learning module!`
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Tree building for interactive lessons
  const handleAddNode = (parentId: string, side: 'left' | 'right') => {
    if (!tree) return;
    
    const value = Math.floor(Math.random() * 90) + 10;
    const newNode: TreeNodeData = {
      id: `${Date.now()}`,
      value
    };
    
    const addToTree = (node: TreeNodeData): TreeNodeData => {
      if (node.id === parentId) {
        return {
          ...node,
          [side]: newNode
        };
      }
      return {
        ...node,
        left: node.left ? addToTree(node.left) : node.left,
        right: node.right ? addToTree(node.right) : node.right
      };
    };
    
    setTree(addToTree(tree));
  };

  // Traversal animations
  const runInorderTraversal = async () => {
    if (!tree || isAnimating) return;
    setIsAnimating(true);
    setTraversalResult([]);
    setHighlightedPath([]);
    
    const result: (number | string)[] = [];
    
    const traverse = async (node: TreeNodeData | null | undefined): Promise<void> => {
      if (!node) return;
      
      await traverse(node.left);
      
      setHighlightedPath([node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      await traverse(node.right);
    };
    
    await traverse(tree);
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  const runPreorderTraversal = async () => {
    if (!tree || isAnimating) return;
    setIsAnimating(true);
    setTraversalResult([]);
    setHighlightedPath([]);
    
    const result: (number | string)[] = [];
    
    const traverse = async (node: TreeNodeData | null | undefined): Promise<void> => {
      if (!node) return;
      
      setHighlightedPath([node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      await traverse(node.left);
      await traverse(node.right);
    };
    
    await traverse(tree);
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  const runPostorderTraversal = async () => {
    if (!tree || isAnimating) return;
    setIsAnimating(true);
    setTraversalResult([]);
    setHighlightedPath([]);
    
    const result: (number | string)[] = [];
    
    const traverse = async (node: TreeNodeData | null | undefined): Promise<void> => {
      if (!node) return;
      
      await traverse(node.left);
      await traverse(node.right);
      
      setHighlightedPath([node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    };
    
    await traverse(tree);
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  const runBFSTraversal = async () => {
    if (!tree || isAnimating) return;
    setIsAnimating(true);
    setTraversalResult([]);
    setQueue([]);
    setHighlightedPath([]);
    
    const result: (number | string)[] = [];
    const q: TreeNodeData[] = [tree];
    setQueue([{ id: tree.id, value: tree.value }]);
    
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    while (q.length > 0) {
      const node = q.shift()!;
      setQueue(q.map(n => ({ id: n.id, value: n.value })));
      
      setHighlightedPath([node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      if (node.left) {
        q.push(node.left);
        setQueue([...q.map(n => ({ id: n.id, value: n.value }))]);
      }
      if (node.right) {
        q.push(node.right);
        setQueue([...q.map(n => ({ id: n.id, value: n.value }))]);
      }
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
    }
    
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  const runDFSTraversal = async () => {
    if (!tree || isAnimating) return;
    setIsAnimating(true);
    setTraversalResult([]);
    setStack([]);
    setHighlightedPath([]);
    
    const result: (number | string)[] = [];
    const s: TreeNodeData[] = [tree];
    setStack([{ id: tree.id, value: tree.value }]);
    
    await new Promise(resolve => setTimeout(resolve, animationSpeed));
    
    while (s.length > 0) {
      const node = s.pop()!;
      setStack(s.map(n => ({ id: n.id, value: n.value })));
      
      setHighlightedPath([node.id]);
      result.push(node.value);
      setTraversalResult([...result]);
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
      
      // Push right first so left is processed first (LIFO)
      if (node.right) {
        s.push(node.right);
        setStack([...s.map(n => ({ id: n.id, value: n.value }))]);
      }
      if (node.left) {
        s.push(node.left);
        setStack([...s.map(n => ({ id: n.id, value: n.value }))]);
      }
      
      await new Promise(resolve => setTimeout(resolve, animationSpeed / 2));
    }
    
    setHighlightedPath([]);
    setIsAnimating(false);
  };

  const resetVisualization = () => {
    if (!config) return;
    const lesson = config.lessons[currentStep];
    if (lesson?.content.initialState) {
      setTree(lesson.content.initialState);
    }
    setTraversalResult([]);
    setHighlightedPath([]);
    setQueue([]);
    setStack([]);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!config) {
    return <Navigate to="/learn" replace />;
  }

  const currentLesson = config.lessons[currentStep];
  const isBfsOrDfs = topicId === 'bfs' || topicId === 'dfs';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        {/* Back & Title */}
        <div className="mb-6 animate-fade-in">
          <Link to="/learn">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl">{config.icon}</span>
            <h1 className="text-3xl font-display font-bold">{config.title}</h1>
            <Badge variant="secondary" className={cn('bg-' + config.color + '/20 text-' + config.color)}>
              {currentStep + 1} / {config.lessons.length}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lesson List - Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <StepProgress current={completedSteps.size} total={config.lessons.length} />
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {config.lessons.map((lesson, index) => (
                <LessonStep
                  key={lesson.id}
                  stepNumber={index + 1}
                  title={lesson.title}
                  description={lesson.description}
                  isActive={currentStep === index}
                  isCompleted={completedSteps.has(index)}
                  onClick={() => setCurrentStep(index)}
                />
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Explanation Card */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  {currentLesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {currentLesson.content.explanation}
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Key Points:</h4>
                  <ul className="space-y-1">
                    {currentLesson.content.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Visualization Card */}
            <Card className="animate-fade-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Interactive Visualization</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetVisualization}
                      disabled={isAnimating}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tree Visualization */}
                <div className="flex justify-center bg-muted/30 rounded-xl p-4">
                  <TreeVisualization
                    root={tree}
                    width={500}
                    height={300}
                    highlightedPath={highlightedPath}
                    showEmptySlots={currentLesson.content.interactionType === 'build'}
                    emptySlotCallback={handleAddNode}
                  />
                </div>

                {/* Queue for BFS */}
                {topicId === 'bfs' && currentLesson.content.interactionType === 'traverse' && (
                  <QueueVisualization items={queue} />
                )}

                {/* Stack for DFS */}
                {topicId === 'dfs' && currentLesson.content.interactionType === 'traverse' && (
                  <div className="flex justify-center">
                    <StackVisualization items={stack} />
                  </div>
                )}

                {/* Traversal Result */}
                {(currentLesson.content.interactionType === 'traverse' || traversalResult.length > 0) && (
                  <TraversalDisplay 
                    label="Traversal Order" 
                    values={traversalResult}
                    color="success"
                  />
                )}

                {/* Traversal Buttons */}
                {currentLesson.content.interactionType === 'traverse' && (
                  <div className="flex flex-wrap gap-2">
                    {(topicId === 'bst' || topicId === 'binary-tree') && (
                      <>
                        <Button
                          onClick={runInorderTraversal}
                          disabled={isAnimating}
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Inorder
                        </Button>
                        <Button
                          onClick={runPreorderTraversal}
                          disabled={isAnimating}
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Preorder
                        </Button>
                        <Button
                          onClick={runPostorderTraversal}
                          disabled={isAnimating}
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Postorder
                        </Button>
                      </>
                    )}
                    {topicId === 'bfs' && (
                      <Button
                        onClick={runBFSTraversal}
                        disabled={isAnimating}
                        className="bg-topic-bfs hover:bg-topic-bfs/90"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run BFS
                      </Button>
                    )}
                    {topicId === 'dfs' && (
                      <Button
                        onClick={runDFSTraversal}
                        disabled={isAnimating}
                        className="bg-topic-dfs hover:bg-topic-dfs/90"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run DFS
                      </Button>
                    )}
                  </div>
                )}

                {/* Build mode hint */}
                {currentLesson.content.interactionType === 'build' && (
                  <div className="p-4 rounded-lg bg-info/10 border border-info/30 text-info">
                    <p className="text-sm font-medium">
                      💡 Click on the + buttons to add nodes to the tree!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNextStep}
                className="bg-gradient-primary hover:opacity-90"
              >
                {currentStep === config.lessons.length - 1 ? (
                  <>
                    Complete Module
                    <CheckCircle2 className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}