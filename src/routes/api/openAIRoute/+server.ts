import { OPENAI_API_KEY} from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { json } from "@sveltejs/kit";
// This is the function to return a response to the user
// Adjust this for more accurate or more friednly responses
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
let systemPromptProfile = `The following is a conversation with an AI assistant. The assistant is helpful and concise. Solai has searched it's memory and found the following code as part of a github repository, using this information answer the users query in a very short sentence. Other relavent answers are to the users right, make sure they know this:\n\n`


export async function POST({request}) {
  const { messages, query, namespace } = await request.json();
  let conversation = [];
  // For each message in the array, assign them to the right ChatMessage class
  const model = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY, 
    temperature: 1.1,
    modelName: "gpt-3.5-turbo",
});
//   Get the response from the vector store
let systemPrompt = new SystemChatMessage("");
if (query!==undefined){
  if (namespace==="solana"){
      systemPromptProfile = `You are an SolAI, an AI helps people understand solana GITHUB repos. Other relevant information can be found to the right of the user, when responding remind the user that the information can be found in the results section to the right. Solai has searched it's memory and found the following information regarding a solana based Github repository, use only the following information to answer the users query with a short sentence and tell them more infor can be found to the right in the results section:\n\n`
      systemPrompt = new SystemChatMessage(
        `${systemPromptProfile}\n
        Project Name: ${capitalizeFirstLetter(query.metadata.Projectname)}\n
        Description: ${query.metadata.text}\n
        `);
  }
  else{
      systemPrompt = new SystemChatMessage(
      `${systemPromptProfile}\n
      Project Name: ${capitalizeFirstLetter(query.metadata.Projectname)}\n
      Description: ${query.metadata.description}\n
      Code: ${query.metadata.code}\n
      Language: ${query.metadata.language}\n
      File path: ${query.metadata.filepath}\n
      `,
    );
  }}
  else{
    systemPromptProfile = `You are an AI that helps people understand GITHUB repos, if you provide any examples put them within a code identifier like this #@[EXAMPLE HERE]@#. You could not find any related GITHUB repositories, apologies for the user and ask them to try a different question.\n\n`
    systemPrompt = new SystemChatMessage(
      `${systemPromptProfile}\n'`,
    );
  }



  // Create a system message with the response with a brief description of the bot, along with the results
  conversation.push(systemPrompt);
  for (const message of messages) {
    if (message.type === "human") {
      conversation.push(new HumanChatMessage(message.data.content));
    } else if (message.type === "ai") {
      conversation.push(new AIChatMessage(message.data.content));
    }
  }
  const message = await model.call(
    conversation
  );
  const finalMessage = message.text
  // Add the metadata URl to the end of the message
  return json(finalMessage);
}


// Function to upload a pdf to pinecone, maybe use put?
  