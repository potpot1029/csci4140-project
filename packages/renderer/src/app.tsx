import React, {useEffect, useRef, useState} from 'react';
import {
  RootLayout,
  Sidebar,
  Content,
  Note,
  NotesList,
  NoteTitle,
  Chat,
  ShowChatButton,
  EditorButtonsRow,
  MainPage,
} from '/@/components';
import {ButtonsRow} from './components/buttons-row';
import {cn} from './utils';
import {ResizableComponent} from './components/resizeable-component';
import {InitializationPage} from './components/settings/init-page';
import {defaultSettings} from '@shared/constants';
import {ChainOptions, ChainType, LangChainParams, NoteFile} from '@shared/models';
import VectorDBManager, {VectorStoreDocument} from './components/chatbot/llm/vectorDB-manager';
import {useAtomValue} from 'jotai';
import {notesAtom} from './store';
import EmbeddingManager from './components/chatbot/llm/embedding-manager';
import ChainManager from './components/chatbot/llm/chain-manager';

const App = () => {
  const [configured, setConfigured] = useState<boolean>(false);
  const [currentDbVectorStores, setCurrentDbVectorStores] =
    useState<PouchDB.Database<VectorStoreDocument> | null>(null);
  const [currentChainManager, setCurrentChainManager] = useState<ChainManager | null>(null);
  const [currentEmbeddingsManager, setCurrentEmbeddingsManager] = useState<EmbeddingManager | null>(
    null,
  );

  const getChainmanagerParams = () => {
    return {
      model: defaultSettings.model,
      embeddingModel: defaultSettings.embeddingModel,
      temperature: defaultSettings.temperature,
      maxTokens: defaultSettings.maxTokens,
      chainType: ChainType.LLM_CHAIN,
      chatContextTurns: defaultSettings.contextTurns,
      systemMessage: 'You are a helpful assistant for note taking.',
      ollamaBaseUrl: defaultSettings.ollamaBaseUrl,
      ollamaModel: defaultSettings.ollamaModel,
      options: {forceNewChain: true} as ChainOptions,
    } as LangChainParams;
  };

  const load = async (notes: NoteFile[]): Promise<void> => {
    console.info('Loading vault...');
    const langChainParams = getChainmanagerParams();
    let dbVectorStores = new PouchDB<VectorStoreDocument>('two_brain_vector_stores');
    let chainManager = new ChainManager(langChainParams, () => dbVectorStores);
    let embeddingsManager = EmbeddingManager.getInstance(langChainParams);

    console.info('Chain manager:', chainManager);
    // index vault
    try {
      const indexVault = async (overwrite?: boolean): Promise<number> => {
        const embeddingInstance = embeddingsManager!.getEmbeddingsAPI();
        if (!embeddingInstance) {
          console.error('Embeddings API not found');
          return 0;
        }

        // check embedding model
        const prevEmbeddingModel = await VectorDBManager.checkEmbeddingModel(dbVectorStores!);
        const currEmeddingModel = EmbeddingManager.getModelName(embeddingInstance);

        console.info('Previous embedding model:', prevEmbeddingModel);
        console.info('Current embedding model:', currEmeddingModel);

        // if (prevEmbeddingModel && prevEmbeddingModel !== currEmeddingModel) {
        //   console.info('Embedding model changed, re-indexing vault');
        //   overwrite = true;

          try {
            await dbVectorStores.destroy();
            dbVectorStores = new PouchDB<VectorStoreDocument>('two_brain_vector_stores');
            console.log('rebuilding vector store');
          } catch (error) {
            console.error('Error destroying vector store:', error);
          }
        // }

        // just index all notes

        const fileContents = await Promise.all(notes.map(note => note.content));

        const totalFiles = notes.length;
        if (totalFiles === 0) {
          console.info('No files to index');
          return 0;
        }

        let indexedCnt = 0;
        console.info('Indexing files...');
        const loadPromises = notes.map(async (file, idx) => {
          try {
            const result = await VectorDBManager.indexFile(
              dbVectorStores!,
              embeddingInstance,
              file,
            );

            indexedCnt++;
            console.info(`Indexed ${idx + 1}/${totalFiles} files`);
            return result;
          } catch (error) {
            console.error(`Error indexing file ${file.basename}:`, error);
          }
        });
        await Promise.all(loadPromises);
        return notes.length;
      };
      await indexVault();

      setCurrentDbVectorStores(dbVectorStores);
      setCurrentChainManager(chainManager);
      setCurrentEmbeddingsManager(embeddingsManager);
    } catch (error) {
      console.error('Error indexing vault:', error);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      const notes = await window.context.getNotes();
      const vaultDirectory = await window.electron.getVaultDirectory();
      console.info('vaultDirectory', vaultDirectory);
      if (vaultDirectory) {
        setConfigured(true);
        await load(notes);
        console.info('Vault directory already set');
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      {!configured ? (
        <InitializationPage />
      ) : (
        <MainPage
          dbVectorStores={currentDbVectorStores}
          chainManager={currentChainManager}
          embeddingsManager={currentEmbeddingsManager}
        />
      )}
    </>
  );
};

export default App;
