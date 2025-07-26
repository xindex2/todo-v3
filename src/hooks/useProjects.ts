import { useState, useEffect } from 'react';
import { Project, Task } from '../types';

const STORAGE_KEY = 'todo-is-projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsedProjects = JSON.parse(stored);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(parsedProjects[0].id);
      }
    } else {
      // Create default project
      const defaultProject: Project = {
        id: 'default',
        name: 'My Tasks',
        description: 'Default project for all tasks',
        color: '#3b82f6',
        createdAt: new Date(),
        tasks: [],
        content: `# My Tasks

Welcome to Todo.is! Here's how to get started:

- Create your first task
  -- Add subtasks with double dashes
- [ ] Use checkboxes for trackable items
- [x] Mark completed tasks like this
- Schedule meetings @2024-01-20 14:00
- Set priorities 🔥 High, ⚡ Medium, 📝 Low

## Today's Goals
- Get familiar with the interface
- Plan your week
- Set up your projects

## Notes
This is your default project. You can create more projects using the Projects tab!`
      };
      setProjects([defaultProject]);
      setActiveProjectId(defaultProject.id);
    }
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const createProject = (name: string, description?: string, color: string = '#3b82f6') => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      color,
      createdAt: new Date(),
      tasks: [],
      content: `# ${name}

${description ? description + '\n\n' : ''}Start adding your tasks here:

- First task for ${name}
  -- Break it down into subtasks
- Plan project milestones
- Set deadlines and priorities

## Notes
Add any project-specific notes here...`
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p));
  };

  const updateProjectContent = (id: string, content: string) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, content, updatedAt: new Date() } : p
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProjectId === id) {
      const remaining = projects.filter(p => p.id !== id);
      setActiveProjectId(remaining.length > 0 ? remaining[0].id : '');
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return {
    projects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    createProject,
    updateProject,
    updateProjectContent,
    deleteProject
  };
}