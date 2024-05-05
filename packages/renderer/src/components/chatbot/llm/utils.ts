// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/utils.ts
import type { MemoryVariables } from "langchain/memory";
import type { Document, NoteFile } from "@shared/models";

export function extractNoteTitles(query: string): string[] {
    // Use a regular expression to extract note titles wrapped in [[]]
    const regex = /\[\[(.*?)\]\]/g;
    const matches = query.match(regex);
    const uniqueTitles = new Set(
      matches ? matches.map((match) => match.slice(2, -2)) : [],
    );
    return Array.from(uniqueTitles);
  }
  export function extractChatHistory(
    memoryVariables: MemoryVariables,
  ): [string, string][] {
    const chatHistory: [string, string][] = [];
    const { history } = memoryVariables;
  
    for (let i = 0; i < history.length; i += 2) {
      const userMessage = history[i]?.content || "";
      const aiMessage = history[i + 1]?.content || "";
      chatHistory.push([userMessage, aiMessage]);
    }
  
    return chatHistory;
  }

  export function extractUniqueTitlesFromDocs(docs: Document[]): string[] {
    const titlesSet = new Set<string>();
    docs.forEach((doc) => {
      if (doc.metadata?.title) {
        titlesSet.add(doc.metadata?.title);
      }
    });
  
    return Array.from(titlesSet);
  }

  export async function getNoteByTitle(vault: NoteFile[], title: string): Promise<NoteFile | undefined> {
    return vault.find((note) => note.metadata.title === title);
  }