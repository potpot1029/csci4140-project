import type { ChatMessage, NoteContent, NoteFile } from './models'

export type GetNotes = () => Promise<NoteFile[]>
export type ReadNote = (title: string) => Promise<NoteContent>
export type WriteNote = (title: string, content: NoteContent) => Promise<NoteFile>
export type CreateNote = (title: string) => Promise<NoteFile | false>
export type DeleteNote = (title: string) => Promise<boolean>
export type RenameNote = (oldTitle: string, newTitle: string) => Promise<NoteFile | false>

export type GetChatHistory = () => Promise<ChatMessage[]>
export type UpdateChatHistory = (message: ChatMessage) => Promise<void>

export type ShowFileItemContextMenu = (file: NoteFile) => Promise<void>

export type SetVaultDirectory = (directory: string) => Promise<void>
export type GetVaultDirectory = () => Promise<string>

export type SelectDirectory = () => Promise<string>
