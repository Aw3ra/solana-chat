import { OPENAI_API_KEY} from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { json } from "@sveltejs/kit";
// This is the function to return a response to the user
// Adjust this for more accurate or more friednly responses
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
let systemPromptProfile = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. You have found the following code as part of a github repository, using this information answer the users query in a short sentence:\n\n`


export async function POST({request}) {
  const { messages, query, namespace } = await request.json();
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

  if (namespace==="solana"){
      systemPromptProfile = `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. You have found the following description for a solana github repository, use only the following information to respond to the users query with a single sentence:\n\n`
  }

  // Create a system message with the response with a brief description of the bot, along with the results
  conversation.push(
    new SystemChatMessage(
      `${systemPromptProfile}\n${(query.metadata.text)}`,
    ),
  );
  const message = await model.call(
    conversation
  );
  const finalMessage = message.text + "\n\n"+ capitalizeFirstLetter(query.metadata.Projectname) + " by: " + capitalizeFirstLetter(query.metadata.author)+ "\n" + query.metadata.url;
  // Add the metadata URl to the end of the message
  return json(finalMessage);
}


// Function to upload a pdf to pinecone, maybe use put?
  