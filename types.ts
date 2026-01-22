
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export enum AppMode {
  CHAT = 'chat',
  IMAGE_GEN = 'image_gen',
  VIDEO_ANALYSIS = 'video_analysis'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64 string
  name?: string;
}

export interface SearchSource {
  uri: string;
  title: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isThinking?: boolean;
  sources?: SearchSource[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}
