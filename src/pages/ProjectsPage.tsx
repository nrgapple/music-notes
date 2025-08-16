import { useNavigate } from 'react-router-dom';
import { ProjectSelector } from '@/components/ProjectSelector';
import type { Project } from '@/types';

export function ProjectsPage() {
  const navigate = useNavigate();

  const handleProjectSelect = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return <ProjectSelector onProjectSelect={handleProjectSelect} />;
}
