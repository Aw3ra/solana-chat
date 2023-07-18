import { PineconeClient } from "@pinecone-database/pinecone";
import { OPENAI_API_KEY, PINECONE_ENVIRONMENT, PINECONE_API_KEY, PINECONE_INDEX} from "$env/static/private";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";


// Initialize the Pinecone client
const client = new PineconeClient();
await client.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
})
const index = client.Index(PINECONE_INDEX);
const embeddings = new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY});


/**
 * Function to query the index by vector
 * @param {string} query
 * @param {string} namespace
 * @param {any} filter
 */
export async function queryVectors (query, namespace, filter = {}){
    try{
        const queryRequest = {
            vector: await embeddings.embedQuery(query),
            topK: 6,
            includeMetadata: true,
            includeValues: true,
            namespace: namespace,
            filter: filter,
        };
        const queryResponse = await index.query({queryRequest});
        console.log(queryResponse.matches);
        return queryResponse;
    }
    catch(err){
        console.log("Error querying vectors: " + err)
        throw err;
    }
}

/**
 * Function to get a vector from the index by name
 * @param {string} vectorName
 * @param {string} namespace
 */
export async function getVector (vectorName, namespace){
    try{
        const fetchResponse = await index.fetch({
            ids: [vectorName],
            namespace: namespace,
        });
        return fetchResponse;
    }
    catch(err){
        console.log("Error getting vector: "+ err)
        throw err;
    }
}

/**
 * Function to get the number of results in the index
 * @param   {string} namespace
 * @returns {Promise<number>}
 * @throws  {Error}
*/
export async function getNamespaceCount(namespace)
{
    try{
        const indexInfo = await index.describeIndexStats({describeIndexStatsRequest: {}});
        if (indexInfo.namespaces[namespace] === undefined) {
            return 0;
          }
          return indexInfo.namespaces[namespace].vectorCount;
    }
    catch(err){
        console.log("Error getting results count: "+err)
        throw err;
    }
}

/**
 * Function to add multiple vectors to the index
 * Input: Array of objects with the following structure:
 * {
 *      vectorName: string,
 *      namespace: string,
 *      vector: array of numbers,
 *      metadata: object with this structure:
 *          {
 *              "Projectname": string,
 *              "author": string,
 *              "text": string,
 *              "url": string,
 *          }
 * }
 * @param {any} vectors
 * @param {string} namespace
 */
export async function addVectors (vectors, namespace){
    // Check the array to make sure the objects have the correct structure
    vectors.forEach(vector => {
        if (vector.id === undefined || vector.values === undefined || vector.metadata === undefined){
            throw new Error("Incorrect vector structure");
        }
    });
    try{
        const upsertRequest = {
            vectors: vectors,
            namespace: namespace,
        };
        const addResponse = await index.upsert({upsertRequest});
        return addResponse;
    }
    catch(err){
        console.log("Error adding vectors: "+ err)
        throw err;
    }
}
