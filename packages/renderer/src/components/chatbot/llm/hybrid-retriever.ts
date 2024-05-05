import VectorDBManager from './vectorDB-manager';
import {BaseRetriever} from '@langchain/core/retrievers';
import type {VectorStore} from '@langchain/core/vectorstores';
import {Document} from 'langchain/document';
import type {
  ScoreThresholdRetrieverInput} from 'langchain/retrievers/score_threshold';
import {
  ScoreThresholdRetriever
} from 'langchain/retrievers/score_threshold';
import {extractNoteTitles} from './utils';
import type {NoteFile} from '@shared/models';

export class HybridRetriever<V extends VectorStore> extends BaseRetriever {
  public lc_namespace = ['hybrid_retriever'];

  constructor(
    private db: PouchDB.Database,
    private vault: NoteFile[],
    private options: ScoreThresholdRetrieverInput<V>,
    private debug?: boolean,
  ) {
    super();
  }

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const noteTitles = extractNoteTitles(query);
    const explicitChunks = await this.getExplcitChunks(noteTitles);

    // DEBUG
    console.info('Query: ', query);
    console.info('Note Titles: ', noteTitles);
    console.info('Explicit Chunks: ', explicitChunks);

    // vector simiarlity search
    const vectorChunks = await this.getVectorChunks(query);
    console.info('Vector Chunks: ', vectorChunks);

    // combining two chunks, duplicate removed
    const uniqueChunks = new Set<string>(explicitChunks.map(chunk => chunk.pageContent));
    const combinedChunks: Document[] = [...explicitChunks];

    for (const chunk of vectorChunks) {
      const chunkContent = chunk.pageContent;
      if (!uniqueChunks.has(chunkContent)) {
        uniqueChunks.add(chunkContent);
        combinedChunks.push(chunk);
      }
    }

    // get max K chunks
    return combinedChunks.slice(0, this.options.maxK);
  }

  private async getExplcitChunks(noteTitles: string[]): Promise<Document[]> {
    const explicitChunks: Document[] = [];
    const getNoteByTitle = async (title: string) => { return this.vault.find(note => note.metadata.title === title); };
    console.log("[getExplicitChunks]: ", noteTitles);

    for (const noteTitle of noteTitles) {
      const noteFile = await getNoteByTitle(noteTitle);
      if (!noteFile) {
        console.info(`Note not found: ${noteTitle}`);
        continue;
      }
      const docHash = VectorDBManager.getDocumentHash(noteFile.path);
      const memoryVectors = await VectorDBManager.getMemoryVectors(this.db, docHash);
      if (memoryVectors) {
        const matchingChunks = memoryVectors.map(
          memoryVector =>
            new Document({
              pageContent: memoryVector.content,
              metadata: memoryVector.metadata,
            }),
        );
        explicitChunks.push(...matchingChunks);
      }
    }
    return explicitChunks;
  }

  private async getVectorChunks(query: string): Promise<Document[]> {
    console.log("[getVectorChunks]: ", this.options.vectorStore, this.options.minSimilarityScore, this.options.maxK, this.options.kIncrement)
    const retriever = ScoreThresholdRetriever.fromVectorStore(this.options.vectorStore, {
      minSimilarityScore: this.options.minSimilarityScore,
      maxK: this.options.maxK,
      kIncrement: this.options.kIncrement,
    });

    const vectorChunks = await retriever.getRelevantDocuments(query);
    return vectorChunks;
  }
}
