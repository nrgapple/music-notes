import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectPage } from '@/pages/ProjectPage';
import '@/utils/database-debug'; // Import debug utilities for console access

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
    </Routes>
  );
}

export default App;