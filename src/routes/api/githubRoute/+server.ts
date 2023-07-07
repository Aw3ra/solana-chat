// A server for the GitHub API route
// First it fetches the URL from the GitHub API
// Then it uses the URL to fetch the README.md file
// Then it uses the README.md file to generate a response

import { json } from "@sveltejs/kit";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage, AIChatMessage, SystemChatMessage } from "langchain/schema";
import { OPENAI_API_KEY, GITHUB_TOKEN, PINECONE_ENVIRONMENT, PINECONE_INDEX, PINECONE_API_KEY} from "$env/static/private";
import { Octokit } from "@octokit/core";
import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PineconeStore } from "langchain/vectorstores/pinecone";

const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000, chunkOverlap: 100, separators: ['\n\n','\n', '.', '?', '!']});
const model = new ChatOpenAI({openAIApiKey: OPENAI_API_KEY});
const embeddings = new OpenAIEmbeddings({openAIApiKey: OPENAI_API_KEY});
const client = new PineconeClient();
await client.init({
    apiKey: PINECONE_API_KEY,
    environment: PINECONE_ENVIRONMENT,
})

// Function to use openAI to create a description of a README file recursively until it is small enough
async function createdDescription(documents){
    let finalSummary = "";
    // For each document
    for(const document of documents) {
        // Ask open AI to describe the document in 2 sentences
        const description = await model.call([
            new SystemChatMessage("You are an AI designed to describe github READMES. Please describe this repository in 2 sentences, focus on common points."),
            new HumanChatMessage(document.pageContent),
            new SystemChatMessage("TI will now describe the repo called " + document.metadata.Projectname + ", by " + document.metadata.author + " in 2 sentences."),
        ])
        // Add the description to the final summary
        finalSummary += description.text;
    }
    // If the final summary is too long, separate it into chunks
    let finalDocument = await splitter.createDocuments([finalSummary], [documents[0].metadata]);
    // If the finalDocument is multiple documents, repeat the process
    if(finalDocument.length > 1) {
        createdDescription(finalDocument);
    }
    // Return the final summary
    return finalDocument[0].pageContent;
}

async function deleteProject(url){
    const pineconeIndex = client.Index(PINECONE_INDEX);
    const deleteOneRequest = {
        deleteAll: true,
        filter: {
            url: { $in: [url] },
        },
        namespace: "solana",
    };
    const deleted = await pineconeIndex.delete1(deleteOneRequest);
}


// Function to upload github README to pinecone
async function uploadPinecone(documents){
    const metadata = documents[0].metadata;
    const pineconeIndex = client.Index(PINECONE_INDEX);
    const queryRequest = {
        vector: await embeddings.embedQuery(documents[0].pageContent),
        topK: 1,
        filter: {
          url: { $in: [documents[0].metadata.url] },
        },
        namespace: "solana",
      };
    // Check if there are any documents with the URL already in pinecone
    const query = await pineconeIndex.query({ queryRequest });
    // If there are is a document with the URL already in pinecone, return that it already exists
    if (query.matches.length > 0) {
        return json({status: "Already uploaded!"});
    }

    let finalSummary = await createdDescription(documents);
    // // Ask AI to summarize the final summary
    const summary = await model.call([
        new SystemChatMessage("You are an AI designed to summarize github repositories. Please describe this repository in 4-8 sentences."),
        new HumanChatMessage(finalSummary),
        new SystemChatMessage("I will now summarize the repo called " + metadata.Projectname + ", by " + metadata.author + " in 2 sentences."),
    ])
    // Create document
    const finalDoc = new Document({pageContent: summary.text, metadata: metadata});
    // // Upload the document to pinecone
    try{
        await PineconeStore.fromDocuments([finalDoc], embeddings, {pineconeIndex, namespace: "solana"});
        // If the upload is successful, return a success message
        return json({status: "Upload successful!"});
    }
    catch(error) {
        // If the upload is unsuccessful, return an error message
        return json({status: "Upload unsuccessful..."});
    }
}

// Function to get the README.md file from the GitHub API
async function getReadmeFromGithub(url) {
    // Delete the project from pinecone
    const [owner, repo, path] = url.split('/');
    const octokit = new Octokit();
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        ...(path && { path })
      });
    // Loop through the data to find the README.md file
    for(const item of data) {
        if(item.name === 'README.md') {
            if (item.type === 'dir') {
                return 'README.md not found!';
            }
            // If the README.md file is found, fetch the file
            const readme = await fetch(item.download_url);
            // Return the README.md file
            return readme.text();
        }
    }
}

export async function POST({request}) {
    let data = await request.json();
    let url = data.url;
    if(!url.includes('github.com')) {
        return json({status: 'Invalid URL!'});
    }
    let newurl = url.split('github.com/')[1];
    const readme = await getReadmeFromGithub(newurl);
    // If readme is not found, return an error
    if(readme === 'README.md not found') {
        return json({status: 'README.md not found!'});
    }
    // Split url into owner and name
    const [owner, repo, path] = newurl.split('/');
    const metadata = { Projectname: repo,  author: owner, url: url};
    const documents = await splitter.createDocuments([readme], [metadata]);
    // Send the documents to be uplladed to pinecone
    return uploadPinecone(documents);
}