import { OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } from "$env/static/private";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { json } from "@sveltejs/kit";


const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const pineconeIndex = client.Index(PINECONE_INDEX);


async function searchVectors(query:string, namespace:string) {
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY}),
    { pineconeIndex, namespace: namespace}
  );
    const results = await vectorStore.similaritySearch(
      query,
      7,
    ); 
    return results;
  }

async function getIndexCount(namespace:string) {
    const pineconeIndex = client.Index(PINECONE_INDEX);
    const indexInfo = await pineconeIndex.describeIndexStats({describeIndexStatsRequest: {}});
    // Return the number of vectors in the index of the given namespace, if it exists, otherwise return 0
    if (indexInfo.namespaces[namespace] === undefined) {
      return 0;
    }

    return indexInfo.namespaces[namespace].vectorCount;
}


export async function POST({request}) {
    const {messages, namespace}= await request.json();
    if (messages === undefined) {
      const count = await getIndexCount(namespace);
      return json(count);
    }
    console.log(namespace)
    const query = messages[messages.length - 2].data.content;
    const results = await searchVectors(query, namespace);
    return json(results);
}
  