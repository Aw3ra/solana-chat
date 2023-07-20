import { OPENAI_API_KEY} from "$env/static/private";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { AIChatMessage, HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { json } from "@sveltejs/kit";

/**
 * @param {string} text
 */
export async function createEmbedding(text){
    try{
        const embeddings = new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY});
        const embed = await embeddings.embedQuery(text);
        return embed;
    }
    catch(err){
        console.log("Error creating embedding: " + err)
        throw err;
    }
}

/**
 * @param {string} name
 * @param {string} author
 * @param {string} repo
 * @param {string} structure
 * @param {string} content
*/
export async function createDescription(name, author, repo, structure, content){
    try{
        const model = new ChatOpenAI({openAIApiKey: OPENAI_API_KEY, modelName: "gpt-3.5-turbo-4k"});
        const systemMessage = new SystemChatMessage("You are an AI design to analyse code files and convert them into plain english. The user will give you a file name, repo structure, author, repo name and the file contents. You will then return a brief description of the file in plain english.");
        const humanMessage = new HumanChatMessage(
            `
            I want this file described in plain english:
            name: ${name}
            author: ${author}
            repository: ${repo}
            repository structur: ${structure}
            file content: ${content}
            `
            );
        const response = await model.call([systemMessage, humanMessage]);
        return response.text;

    }
    catch(err){
        console.log("Error creating description: " + err)
        throw err;
    }
}

