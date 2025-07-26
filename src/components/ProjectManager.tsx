import React, { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, X, Calendar, CheckSquare, Share2, Download } from 'lucide-react';
import { Project } from '../types';

interface ProjectManagerProps {
  projects: Project[];
  activeProjectId: string;
  onProjectSelect: (id: string) => void;
  onProjectCreate: (name: string, description?: string, color?: string) => void;
  onProjectUpdate: (id: string, updates: Partial<Project>) => void;
  onProjectDelete: (id: string) => void;
  onProjectShare?: (id: string) => void;
  isDarkMode?: boolean;
}

const projectColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export function ProjectManager({
  projects,
  activeProjectId,
  onProjectSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onProjectShare,
  isDarkMode = true
}: ProjectManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: projectColors[0]
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    
    onProjectCreate(formData.name, formData.description, formData.color);
    setFormData({ name: '', description: '', color: projectColors[0] });
    setShowCreateForm(false);
  };

  const handleUpdate = (projectId: string) => {
    if (!formData.name.trim()) return;
    
    onProjectUpdate(projectId, {
      name: formData.name,
      description: formData.description,
      color: formData.color
    });
    setEditingProject(null);
    setFormData({ name: '', description: '', color: projectColors[0] });
  };

  const startEdit = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color
    });
    setEditingProject(project.id);
  };

  const cancelEdit = () => {
    setEditingProject(null);
    setFormData({ name: '', description: '', color: projectColors[0] });
  };

  const exportProject = (project: Project) => {
    const blob = new Blob([project.content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTaskCount = (content: string) => {
    if (!content) return 0;
    return content.split('\n').filter(line => 
      line.trim().startsWith('- ') || 
      line.trim().startsWith('-- ') ||
      line.trim().match(/^--?\s*\[[ x]\]/)
    ).length;
  };

  const getCompletedCount = (content: string) => {
    if (!content) return 0;
    return content.split('\n').filter(line => 
      line.trim().includes('[x]')
    ).length;
  };

  const containerClasses = isDarkMode
    ? 'h-full bg-gray-900 flex flex-col'
    : 'h-full bg-white flex flex-col';

  const headerClasses = isDarkMode
    ? 'h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4'
    : 'h-12 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4';

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className={headerClasses}>
        <div className="flex items-center space-x-2">
          <Folder className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <span className="text-sm font-medium">Projects</span>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-1 px-3 py-1 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>

      {/* Project Grid */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isActive = activeProjectId === project.id;
            const taskCount = getTaskCount(project.content || '');
            const completedCount = getCompletedCount(project.content || '');
            const progress = taskCount > 0 ? (completedCount / taskCount) * 100 : 0;
            
            const cardClasses = isDarkMode
              ? `group relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-lg'
                }`
              : `group relative p-4 md:p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                }`;

            return (
              <div
                key={project.id}
                className={cardClasses}
                onClick={() => onProjectSelect(project.id)}
              >
                {/* Project Color Indicator */}
                <div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
                  style={{ backgroundColor: project.color }}
                />
                
                {/* Action Buttons */}
                <div className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onProjectShare && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectShare(project.id);
                      }}
                      className={`p-1.5 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                      }`}
                      title="Share Project"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportProject(project);
                    }}
                    className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    title="Export Project"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(project);
                    }}
                    className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                    title="Edit Project"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this project? This action cannot be undone.')) {
                          onProjectDelete(project.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-600 text-red-400 hover:text-white"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Project Content */}
                <div className="space-y-3 md:space-y-4 mt-2">
                  <div>
                    <h3 className={`text-base md:text-lg font-semibold mb-2 pr-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {taskCount > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                        <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                          {completedCount}/{taskCount}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${progress}%`,
                            backgroundColor: project.color
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className={`grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <CheckSquare className={`w-4 h-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {taskCount}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tasks
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <div>
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Created
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckSquare className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-lg p-6 w-full max-w-md border ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingProject ? 'Edit Project' : 'Create Project'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Color Theme
                </label>
                <div className="flex flex-wrap gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color
                          ? 'border-white scale-110 shadow-lg'
                          : isDarkMode 
                          ? 'border-gray-600 hover:border-gray-400'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => editingProject ? handleUpdate(editingProject) : handleCreate()}
                disabled={!formData.name.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                {editingProject ? 'Update' : 'Create'} Project
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  cancelEdit();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}