import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import MindfulFlow from "./pages/MindfulFlow";
import MindfulFlowDetail from "./pages/MindfulFlowDetail";
import Music from "./pages/Music";
import MusicDetail from "./pages/MusicDetail";
import LessonEditor from "./pages/LessonEditor";
import MindfulFlowEditor from "./pages/MindfulFlowEditor";
import MusicEditor from "./pages/MusicEditor";
import NotFound from "./pages/NotFound";
import { FixedNavBar } from "./components/FixedNavBar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/mindful" element={<MindfulFlow />} />
          <Route path="/mindful/:flowId" element={<MindfulFlowDetail />} />
          <Route path="/music" element={<Music />} />
          <Route path="/music/:musicId" element={<MusicDetail />} />
          <Route path="/editor/lesson" element={<LessonEditor />} />
          <Route path="/editor/lesson/:lessonId" element={<LessonEditor />} />
          <Route path="/editor/flow" element={<MindfulFlowEditor />} />
          <Route path="/editor/flow/:flowId" element={<MindfulFlowEditor />} />
          <Route path="/editor/music" element={<MusicEditor />} />
          <Route path="/editor/music/:musicId" element={<MusicEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FixedNavBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;