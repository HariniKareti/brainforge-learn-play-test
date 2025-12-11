import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import LearnHub from "./pages/LearnHub";
import LearningModule from "./pages/LearningModule";
import PlayHub from "./pages/PlayHub";
import TreeBuilderGame from "./pages/games/TreeBuilderGame";
import BSTInsertGame from "./pages/games/BSTInsertGame";
import TraversalRaceGame from "./pages/games/TraversalRaceGame";
import PathfinderGame from "./pages/games/PathfinderGame";
import TestHub from "./pages/TestHub";
import EndlessQuiz from "./pages/games/EndlessQuiz";
import SpeedRound from "./pages/games/SpeedRound";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<LearnHub />} />
            <Route path="/learn/:topicId" element={<LearningModule />} />
            <Route path="/play" element={<PlayHub />} />
            <Route path="/play/tree-builder" element={<TreeBuilderGame />} />
            <Route path="/play/bst-insert" element={<BSTInsertGame />} />
            <Route path="/play/traversal-race" element={<TraversalRaceGame />} />
            <Route path="/play/pathfinder" element={<PathfinderGame />} />
            <Route path="/test" element={<TestHub />} />
            <Route path="/test/endless-quiz" element={<EndlessQuiz />} />
            <Route path="/test/speed-round" element={<SpeedRound />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;