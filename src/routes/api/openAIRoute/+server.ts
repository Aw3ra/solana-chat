import { OPENAI_API_KEY} from "$env/static/private";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { json } from "@sveltejs/kit";
// This is the function to return a response to the user
// Adjust this for more accurate or more friednly responses
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
let systemPromptProfile = `The following is a conversation with an AI assistant. The assistant is helpful and concise. You have found the following code as part of a github repository, using this information answer the users query in a very short sentence:\n\n`


export async function POST({request}) {
  const { messages, query, namespace } = await request.json();
  console.log(query);
  let conversation = [];
  // For each message in the array, assign them to the right ChatMessage class
  const model = new ChatOpenAI({
    openAIApiKey: OPENAI_API_KEY, 
    temperature: 1.1,
    modelName: "gpt-3.5-turbo",
});
//   Get the response from the vector store
let systemPrompt = new SystemChatMessage("");
  if (namespace==="solana"){
      systemPromptProfile = `You are an AI that helps people understand solana GITHUB repos, if you provide any examples put them within a code identifier like this #@[EXAMPLE HERE]@#. You have found the following description for a script within a repo, use only the following information to answer the users query with a short sentence:\n\n`
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
  }

  // Create a system message with the response with a brief description of the bot, along with the results

  console.log(systemPrompt);
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
  const finalMessage = message.text + "\n\n"+ query.metadata.url;
  // Add the metadata URl to the end of the message
  return json(finalMessage);
}


// Function to upload a pdf to pinecone, maybe use put?
  