import { OPENAI_API_KEY, PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_INDEX } from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { ConversationalRetrievalQAChain, VectorDBQAChain } from "langchain/chains";
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
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY}),
  { pineconeIndex, namespace: "solana"}
);

async function searchVectors(query) {
  const results = await vectorStore.similaritySearch(
    query,
  ); 
  return results[0];
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
//   Get the response from the vector store

  // Use the most recent human message as a search query (the last message in the array)
  const query = conversation[conversation.length - 1].text;  

  const currentTime = new Date().getTime(); 
  const results = await searchVectors(query);

  // Convert results into a string

  const systemPromptProfile = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. You have found the following description for a github repository, use only the following information to respond to the users query with a single sentence:\n\n`
  // Create a system message with the response with a brief description of the bot, along with the results

  conversation.push(
    new SystemChatMessage(
      `${systemPromptProfile}\n\n${(results.pageContent)}`,
    ),
  );
  console.log(conversation);
  const pineConeresponseTime = new Date().getTime() - currentTime;
  const message = await model.call(
    conversation
  );

  const finalMessage = message.text + "\n\n" + results.metadata.url;
  console.log(finalMessage);

  // Add the metadata URl to the end of the message


  const openAIresponseTime = new Date().getTime() - currentTime - pineConeresponseTime;
  
  console.log(`Pinecone time: ${pineConeresponseTime}ms`);
  console.log(`OpenAI time: ${openAIresponseTime}ms`);
  return json(finalMessage);
}


// Function to upload a pdf to pinecone, maybe use put?
  