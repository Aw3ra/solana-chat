import { OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } from "$env/static/private";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { Document } from "langchain/document";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { json } from "@sveltejs/kit";


const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const pineconeIndex = client.Index(PINECONE_INDEX);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY}),
  { pineconeIndex, namespace: "solana"}
);

async function searchVectors(query) {
    const results = await vectorStore.similaritySearch(
      query,
    ); 
    return results;
  }


export async function POST({request}) {
    const {messages}= await request.json();
    const query = messages[messages.length - 2].data.content;
    console.log(query);
    const results = await searchVectors(query);

    return json(results);
    // uploadVectors(file);
}
  