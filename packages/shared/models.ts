export type NoteInfo = {
  title: string;
  lastEditTime: number;
};

export type NoteContent = string;

export type ChatMessage = {
  content: string;
  type: 'user' | 'bot';
}