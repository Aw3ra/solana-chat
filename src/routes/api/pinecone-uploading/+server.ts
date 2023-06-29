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

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: OPENAI_API_KEY,
});

async function uploadVectors(docs) {
    // Crerate embeddings for some text
    await PineconeStore.fromDocuments(docs, embeddings, {pineconeIndex});
}


export async function POST({request}) {
    const file = await request.body;
    console.log(file);
    // uploadVectors(file);
    return json("Uploaded");
}
  