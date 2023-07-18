import { OPENAI_API_KEY} from "$env/static/private";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { json } from "@sveltejs/kit";

/**
 * @param {any} text
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


