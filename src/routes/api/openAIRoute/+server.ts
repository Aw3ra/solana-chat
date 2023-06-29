import { OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage } from "langchain/schema";
import { ConversationalRetrievalQAChain, VectorDBQAChain } from "langchain/chains";
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { BufferMemory } from "langchain/memory";
import { json } from "@sveltejs/kit";


const client = new PineconeClient();
await client.init({
  apiKey: PINECONE_API_KEY,
  environment: PINECONE_ENVIRONMENT,
});
const pineconeIndex = client.Index(PINECONE_INDEX);
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY}),
  { pineconeIndex }
);

async function searchVectors(query) {
  const results = await vectorStore.similaritySearch(
    query,
  ); 

  return results;
}

// This is the function to return a response to the user
// Adjust this for more accurate or more friednly responses
export async function POST({request}) {
  const { messages } = await request.json();
  let conversation = [];
  
  // For each message in the array, assign them to the right ChatMessage class
  for (const message of messages) {
    if (message.type === "human") {
      conversation.push(new HumanChatMessage(message.data.content));
    } else if (message.type === "ai") {
      conversation.push(new AIChatMessage(message.data.content));
    }
  }
  const model = new ChatOpenAI({openAIApiKey: OPENAI_API_KEY, temperature: 1.1});
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  );

  // Use the most recent human message as a search query (the last message in the array)
  const query = conversation[conversation.length - 1].text;  

  const message = await chain.call({question: query, chat_history: conversation});
  return json(message.text);
}


// Function to upload a pdf to pinecone, maybe use put?
  