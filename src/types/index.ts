export interface Task {
  id: string;
  text: string;
  completed: boolean;
  level: number;
  priority?: 'high' | 'medium' | 'low';
  schedule?: Date;
  type: 'task' | 'header' | 'text';
  description?: string;
  attachments?: Attachment[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  updatedAt?: Date;
  tasks: Task[];
  content?: string; // Raw markdown content
}

export interface TimerSession {
  id: string;
  type: 'work' | 'break' | 'long-break';
  duration: number;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  taskId?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'music' | 'video';
  url: string;
  thumbnail?: string;
  duration?: string;
  artist?: string;
  isEmbedded?: boolean;
}

export type View = 'editor' | 'calendar' | 'motivation' | 'analytics' | 'projects' | 'pricing';