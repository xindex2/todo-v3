import { useState, useEffect } from 'react';
import { supabase, DatabaseProject } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Project } from '../types';

export function useSupabaseProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      ensureProfileExists().then(() => {
        loadProjects();
      });
    } else {
      // Reset state when user logs out
      setProjects([]);
      setActiveProjectId('');
      setLoading(false);
    }
  }, [user]);

  const ensureProfileExists = async () => {
    if (!user) return;

    try {
      console.log('🔍 Checking if profile exists for user:', user.id);
      
      // Check if profile exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Error checking profile:', selectError);
        throw selectError;
      }

      if (!existingProfile) {
        console.log('👤 Creating profile for user:', user.id);
        
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            avatar_url: user.user_metadata?.avatar_url || null,
          });

        if (insertError) {
          console.error('❌ Error creating profile:', insertError);
          throw insertError;
        }
        
        console.log('✅ Profile created successfully');
      } else {
        console.log('✅ Profile already exists');
      }
    } catch (error) {
      console.error('❌ Error ensuring profile exists:', error);
    }
  };

  const loadProjects = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('📁 Loading projects for user:', user.id);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading projects:', error);
        throw error;
      }

      console.log('✅ Projects loaded:', data?.length || 0);

      const formattedProjects: Project[] = (data || []).map(dbProject => ({
        id: dbProject.id,
        name: dbProject.name,
        description: dbProject.description,
        color: dbProject.color,
        createdAt: new Date(dbProject.created_at),
        updatedAt: dbProject.updated_at ? new Date(dbProject.updated_at) : undefined,
        tasks: [], // Tasks are loaded separately
        content: dbProject.content,
      }));

      setProjects(formattedProjects);
      
      if (formattedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(formattedProjects[0].id);
      }
    } catch (error) {
      console.error('❌ Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (name: string, description?: string, color: string = '#3b82f6') => {
    if (!user) return null;

    try {
      console.log('📝 Creating project:', name);
      
      // Ensure profile exists before creating project
      await ensureProfileExists();

      // Generate a UUID for the project
      const projectId = crypto.randomUUID();

      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: projectId, // Explicitly set the ID
          user_id: user.id,
          name,
          description,
          color,
          content: `# ${name}

${description ? description + '\n\n' : ''}Start adding your tasks here:

- First task for ${name}
  -- Break it down into subtasks
- Plan project milestones
- Set deadlines and priorities

## Notes
Add any project-specific notes here...`
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating project:', error);
        throw error;
      }

      console.log('✅ Project created successfully:', data.id);

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        createdAt: new Date(data.created_at),
        tasks: [],
        content: data.content,
      };

      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      return newProject;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    try {
      console.log('📝 Updating project:', id);
      
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error updating project:', error);
        throw error;
      }

      console.log('✅ Project updated successfully');

      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ));
    } catch (error) {
      console.error('❌ Error updating project:', error);
    }
  };

  const updateProjectContent = async (id: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error updating project content:', error);
        throw error;
      }

      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, content, updatedAt: new Date() } : p
      ));
    } catch (error) {
      console.error('❌ Error updating project content:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    try {
      console.log('🗑️ Deleting project:', id);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error deleting project:', error);
        throw error;
      }

      console.log('✅ Project deleted successfully');

      setProjects(prev => prev.filter(p => p.id !== id));
      
      if (activeProjectId === id) {
        const remaining = projects.filter(p => p.id !== id);
        setActiveProjectId(remaining.length > 0 ? remaining[0].id : '');
      }
    } catch (error) {
      console.error('❌ Error deleting project:', error);
    }
  };

  const shareProject = async (id: string) => {
    if (!user) return null;

    try {
      console.log('🔗 Sharing project:', id);
      
      // Generate a secure token on the client side using hex encoding
      const tokenBytes = new Uint8Array(32);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes, byte => byte.toString(16).padStart(2, '0')).join('');

      // Create a shared link with explicit token
      const { data, error } = await supabase
        .from('shared_links')
        .insert({
          project_id: id,
          user_id: user.id,
          token: token,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating shared link:', error);
        throw error;
      }

      // Update project to mark as shared
      await supabase
        .from('projects')
        .update({ is_shared: true, share_token: data.token })
        .eq('id', id)
        .eq('user_id', user.id);

      console.log('✅ Project shared successfully:', data.token);
      return data.token;
    } catch (error) {
      console.error('❌ Error sharing project:', error);
      return null;
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return {
    projects,
    activeProject,
    activeProjectId,
    loading,
    setActiveProjectId,
    createProject,
    updateProject,
    updateProjectContent,
    deleteProject,
    shareProject,
  };
}