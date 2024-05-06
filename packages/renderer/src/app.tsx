import React, {useEffect, useState} from 'react';
import {MainPage, testModelAndEmbedding} from '/@/components';
import {InitializationPage} from './components/settings/init-page';
import {defaultSettings} from '@shared/constants';
import {ChainOptions, ChainType, LangChainParams, NoteFile} from '@shared/models';
import VectorDBManager, {VectorStoreDocument} from './components/chatbot/llm/vectorDB-manager';
import EmbeddingManager from './components/chatbot/llm/embedding-manager';
import ChainManager from './components/chatbot/llm/chain-manager';
import {set} from 'lodash';
import test from 'node:test';

const App = () => {
  const [configured, setConfigured] = useState<boolean>(false);
  const [currentDbVectorStores, setCurrentDbVectorStores] =
    useState<PouchDB.Database<VectorStoreDocument> | null>(null);
  const [currentChainManager, setCurrentChainManager] = useState<ChainManager | null>(null);
  const [currentEmbeddingsManager, setCurrentEmbeddingsManager] = useState<EmbeddingManager | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

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

  const load = async (notes: NoteFile[]): Promise<boolean> => {
    console.info('Loading vault...');
    // index vault
    try {
      const langChainParams = getChainmanagerParams();
      let dbVectorStores = new PouchDB<VectorStoreDocument>('two_brain_vector_stores');
      let chainManager = new ChainManager(langChainParams, () => dbVectorStores);
      let embeddingsManager = EmbeddingManager.getInstance(langChainParams);

      console.info('Chain manager:', chainManager);

      // test chain
      try {
        await testModelAndEmbedding();
      }
      catch (error) {
        console.error('Error testing model and embedding:', error);
        setError('Error testing model and embedding. Please make sure you have install them:' + error);
        return false;
      }

      const indexVault = async (overwrite?: boolean): Promise<boolean> => {
        const embeddingInstance = embeddingsManager!.getEmbeddingsAPI();
        if (!embeddingInstance) {
          console.error('Embeddings API not found');
          setError("Embeddings not found. Please make sure you have installed 'nomic-embed-text'");
          return false;
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
          setError('Error destroying vector store. Please try again: ' + error);
        }
        // }

        // just index all notes

        const fileContents = await Promise.all(notes.map(note => note.content));

        const totalFiles = notes.length;
        if (totalFiles === 0) {
          console.info('No files to index');
          return false;
        }

        let indexedCnt = 0;
        console.info('Indexing files...');
        const errors: string[] = [];
        const loadPromises = notes.map(async (file, idx) => {
          console.log('Indexing file:', file.basename)
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
            errors.push(`Error indexing file ${file.basename}: ${error}`);
          }
        });
        await Promise.all(loadPromises);

        if (errors.length > 0) {
          console.error('Errors indexing files:', errors);
          setError('Errors indexing files: ' + errors.join(', '));
          return false;
        }
        return true;
      };
      const response = await indexVault();

      setCurrentDbVectorStores(dbVectorStores);
      setCurrentChainManager(chainManager);
      setCurrentEmbeddingsManager(embeddingsManager);
      return response;
    } catch (error) {
      console.error('Error indexing vault:', error);
      setError('Error indexing vault. Please try again: ' + error);
      return false;
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      setError('Initializing...')
      const vaultDirectory = await window.electron.getVaultDirectory();
      console.info('vaultDirectory', vaultDirectory);
      if (!vaultDirectory) {
        setError('Vault directory not set. Please configure your directory and restart the app.');
      } else {
        console.info('Vault directory already set');
        const notes = await window.context.getNotes();
        if (!notes) {
          setError('Error loading notes. Please try again.');
          return;
        }

        const response = await load(notes);
        if (!response) {
          return;
        }

        setConfigured(true);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      {!configured ? (
        <InitializationPage error={error} />
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
