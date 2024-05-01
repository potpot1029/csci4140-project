import type {ChatMessage, NoteInfo} from '@shared/models'
export const chatMessagesMock: ChatMessage[] = [
    {
        type: 'bot',
        content: 'Hello! How can I help you today?'
    },
    {
        type: 'user',
        content: `*hi*, Do you know what LLM is?`
    },
]

export const notesMock: NoteInfo[] = [
    {
        title: 'Welcome 👋',
        lastEditTime: new Date().getTime()
    },
    {
        title: 'Note 1',
        lastEditTime: new Date().getTime()
    },
    {
        title: 'Note 2',
        lastEditTime: new Date().getTime()
    },
    {
        title: 'Note 3',
        lastEditTime: new Date().getTime()
    },
]