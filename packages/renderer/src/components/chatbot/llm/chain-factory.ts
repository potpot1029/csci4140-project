// adapted from https://github.com/logancyang/obsidian-copilot/blob/master/src/chainFactory.ts
import {StringOutputParser} from '@langchain/core/output_parsers';
import type {BaseRetriever} from '@langchain/core/retrievers';
import {RunnablePassthrough, RunnableSequence} from '@langchain/core/runnables';
import {ChainType} from '@shared/models';
import type {BaseLanguageModel} from 'langchain/base_language';
import type {BaseChatMemory} from 'langchain/memory';
import type {ChatPromptTemplate} from 'langchain/prompts';
import { PromptTemplate} from 'langchain/prompts';
import {formatDocumentsAsString} from 'langchain/util/document';
import type { Document } from '@shared/models';

export type LLMChainInput = {
  llm: BaseLanguageModel;
  memory: BaseChatMemory;
  prompt: ChatPromptTemplate;
  abortController: AbortController;
};

export type RetrievalChainParams = {
  llm: BaseLanguageModel;
  retriever: BaseRetriever;
  options?: {
    returnSourceDocuments?: boolean;
    questionGeneratorTemplate?: string;
    qaTemplate?: string;
  };
};

export type RetrievalChainInput = {
  question: string;
  chat_history: [string, string][];
};



class ChainFactory {
  public static instances: Map<string, RunnableSequence> = new Map();

  public static createLLMChain = (input: LLMChainInput): RunnableSequence => {
    console.info('[ChainFactory] Creating LLM chain instance');
    const {llm, memory, prompt, abortController} = input;

    const model = llm.bind({signal: abortController?.signal});
    const instance = RunnableSequence.from([
      {
        input: initialInput => initialInput.input,
        memory: () => memory.loadMemoryVariables({}),
      },
      {
        input: previousOutput => previousOutput.input,
        history: previousOutput => previousOutput.memory.history,
      },
      prompt,
      model,
      // new StringOutputParser(),
    ]);
    ChainFactory.instances.set(ChainType.LLM_CHAIN, instance);
    console.info('Created LLM chain instance');
    console.info('LLM Chain Instance: ', instance);
    return instance;
  };

  public static getLLMChain = (input: LLMChainInput): RunnableSequence => {
    console.info('[ChainFactory] Getting LLM chain instance')
    let instance = ChainFactory.instances.get(ChainType.LLM_CHAIN);
    if (!instance) {
      instance = ChainFactory.createLLMChain(input);
    }
    return instance;
  };

  public static createRetrievalChain = (
    input: RetrievalChainParams,
    onDocumentsRetrieved: (documents: Document[]) => void,
  ): RunnableSequence => {
    const {llm, retriever} = input;

    const condenseQuestionTemplate = `Given the given conversation and the given follow-up response, 
    summarize the conversation as context and keep the followup question unchanged using the same language
    and use it to condense into a standalone question. 
    Please keep any [[]] wrapped note title in the question unchanged.
        
    Chat History:
    {chat_history}
    Follow-up response: {question}
    Standalone Question:`;

    const CONDENSE_QUESTION_PROMPT = PromptTemplate.fromTemplate(condenseQuestionTemplate);

    const answerTemplate = `Answer the given question using the following context ONLY:
        {context}

        Question: {question}
        `;

    const ANSWER_PROMPT = PromptTemplate.fromTemplate(answerTemplate);

    const formatChatHistory = (chatHistory: [string, string][]) => {
      const formattedDialogueTurns = chatHistory.map(
        dialogueTurn => `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`,
      );
      return formattedDialogueTurns.join('\n');
    };

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: RetrievalChainInput) => {
          console.info('Input Question: ', input.question);
          return input.question;
        },
        chat_history: (input: RetrievalChainInput) => {
          const formattedChatHistory = formatChatHistory(input.chat_history);
          console.info('Formatted Chat History: ', formattedChatHistory);
          return formattedChatHistory;
        },
      },
      CONDENSE_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const formatDocumentsAsStringAndStore = async (documents: Document[]) => {
      onDocumentsRetrieved(documents);
      return formatDocumentsAsString(documents);
    };

    const answerChain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsStringAndStore),
        question: new RunnablePassthrough(),
      },
      ANSWER_PROMPT,
      llm,
    ]);

    const conversationChain = standaloneQuestionChain.pipe(answerChain);
    return conversationChain as RunnableSequence;
  };
}

export default ChainFactory;
