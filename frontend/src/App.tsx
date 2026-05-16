import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; 
import UploadCVPage from './pages/UploadCVPage';
import VerifyDataPage from './pages/VerifyDataPage';
import ProfilingPage from './pages/ProfilingPage';
import Phase2APage from './pages/Phase2APage';
import Phase2BPage from './pages/Phase2BPage';
import Phase3Page from './pages/Phase3Page';
import AnalysisLoadingPage from './pages/AnalysisLoadingPage';
import CareerResultsPage from './pages/CareerResultsPage';
import DashboardPage from './pages/DashboardPage';
import RoadmapPage from './pages/RoadmapPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/upload-cv" element={<UploadCVPage />} />
        <Route path="/verify-data" element={<VerifyDataPage />} />
        <Route path="/assessment/profiling" element={<ProfilingPage />} />
        <Route path="/assessment/phase-2-a" element={<Phase2APage />} />
        <Route path="/assessment/phase-2-b" element={<Phase2BPage />} />
        <Route path="/assessment/phase-3" element={<Phase3Page />} />
        <Route path="/assessment/analysis" element={<AnalysisLoadingPage />} />
        <Route path="/assessment/results" element={<CareerResultsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/roadmap" element={<RoadmapPage />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;