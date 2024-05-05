# CSCI4140 Project: TwoBrains

This project is a course project for CSCI4140 - Open-source Software Project Development. In this project, I aim to build a simple markdown note editor equipped with large language models (LLM) to enhance the note taking experience of the users.

## Stack
This project is built with:
- [cawa-93/vite-electron-builder](https://github.com/cawa-93/vite-electron-builder): for building the Electron app
- [Tailwind CSS](https://tailwindcss.com/): for styling
- [CodeMirror](https://codemirror.net/): for code editor
- [remarkjs/react-markdown](https://github.com/remarkjs/react-markdown): for markdown parsing
- [LangChain](https://langchain.com/): for integrating LLMs into the app
- [Ollama](https://ollama.com/): for using LLMs locally

## Get Started

For now, you have to set the directory for your notes in `packages/shared/constants.ts`.
```typescript
export const appDirectoryName = "'~/TwoBrain'";
```

Install [Ollama](https://ollama.com/) and download Llama3 locally using the following command:
```bash
ollama pull llama3
```
Don't forget to download the embedding model as well:
```bash
ollama pull nomic-embed-text
```

With Ollama opened, run the following commands to start the app:
```bash
# Install dependencies
npm i
# Run the app in watch mode
npm run watch
```

## References
Many thanks to the following resources:
- [CodeWithGionatha-Labs/NoteMark](https://github.com/CodeWithGionatha-Labs/NoteMark)
- [craftzdog/electron-markdown-editor-tutorial](https://github.com/craftzdog/electron-markdown-editor-tutorial)
- [logancyang/obsidian-copilot](https://github.com/logancyang/obsidian-copilot)