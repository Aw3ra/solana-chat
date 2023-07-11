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
const pineconeIndex = client.Index(PINECONE_INDEX);

// Function to use openAI to create a description of a README file recursively until it is small enough
async function createdDescription(documents){
    let finalSummary = "";
    // For each document
    try{
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
    catch(error) {
        console.log("Error in createdDescription: " + error+ " with document: " + documents[0].metadata.url);
    }


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

async function checkPinecone(url){
    const queryRequest = {
        vector: await embeddings.embedQuery(url),
        topK: 1,
        score: true,
        includeMetadata: true,
        filter: {
          url: url,
        },
        namespace: "solana",
      };
    // Check if there are any documents with the URL already in pinecone
    const query = await pineconeIndex.query({ queryRequest });
    if (query.matches.length === 0) {
        return false;
    }
    if (query.matches[0].metadata.url !== url) {
        return false;
    }
    return true;
}
// Function to upload github README to pinecone
async function uploadPinecone(documents){
    const metadata = documents[0].metadata;
    const query = await checkPinecone(metadata.url);
    // If there are is a document with the URL already in pinecone, return that it already exists
    if (query) {
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
    // Upload the document to pinecone
    try{
        await PineconeStore.fromDocuments([finalDoc], embeddings, {pineconeIndex, namespace: "solana"});
        // If the upload is successful, return a success message
        return json({status: "Upload successful!"});
    }
    catch(error) {
        // If the upload is unsuccessful, return an error message
        console.log(error);
        return json({status: "Upload unsuccessful..."});
    }
}

// Function to get the README.md file from the GitHub API
async function getReadmeFromGithub(url) {
    // Delete the project from pinecone
    const [owner, repo, path] = url.split('/');
    const octokit = new Octokit({ auth: GITHUB_TOKEN});
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        ...(path && { path })
      });
    // Loop through the data to find the README.md file
    for(const item of data) {
        try{
            if(item.name.includes('README')) {
                if (item.type === 'dir') {
                    return 'README not found!';
                }
                // If the README.md file is found, fetch the file
                const readme = await fetch(item.download_url);
                // Return the README.md file
                return await readme.text();
            }
            else {
                return 'README not found!';
            }
        }
        catch(error) {
            console.log("Error in getReadmeFromGithub: " + error);
            return 'README not found!';
        }


    }
}

async function getUrlList(date) {
    const dateToGrab = date;
    const octokit = new Octokit();
    const { data } = await octokit.request('https://raw.githubusercontent.com/solana-foundation/solana-developer-data/main/crawled_repos/{dateToGrab}', {dateToGrab});
    // Remove all urls that are not github urls
    let urls = data.split(',');
    urls = urls.filter(url => url.includes('github.com'));
    return urls;
}


export async function POST({request}) {
    let data = await request.json();
    let urlList = [];
    let results = [];
    urlList.push(data.url);
    if(urlList[0].includes('solana_integrated_repos')) {
        urlList = await getUrlList(urlList[0]);
        // return json({status: 'Retrieved list!'});
    }
    if(!urlList[0].includes('github.com')) {
        return json({status: 'Invalid URL!'});
    }
    // For the first 15 urls in the list
    let checkedCount = 0;
    for (const url of urlList) {
        console.log("Checking: " + url);
        try{
            const exists = await checkPinecone(url);
            if (exists) {
                // Raise error if the url already exists
                results.push({status: 'Already uploaded!'});
                // Dont check the url if it already exists
            }
            else{
                let newurl = url.split('github.com/')[1];
                const readme = await getReadmeFromGithub(newurl);
                // If readme is not found, return an error
                if(readme === 'README not found') {
                    results.push({status: 'README not found!'});
                }
                // Split url into owner and name
                const [owner, repo, path] = newurl.split('/');
                const metadata = { Projectname: repo,  author: owner, url: url};
                const documents = await splitter.createDocuments([readme], [metadata]);
                // Send the documents to be uplladed to pinecone
                let result = await uploadPinecone(documents);
                results.push(await result.json());
                // If the amount of urls checked is greater than the max amount, stop
            }
        }
        catch(error) {
            console.log("Error with url: " + url + ": " + error);
            continue;
        }
        finally {
            checkedCount++;
        }
    }
    console.log(results);
    // Count the amount of successful uploads
    let succesfulcount = 0;
    let resultsTotal = results.length;
    for(const result of results) {
        if(result.status === 'Upload successful!') {
            succesfulcount++;
        }
        else if(result.status === 'Already uploaded!') {
            resultsTotal--;
        }
    }
    // Return the amount of successful uploads
    return json({status: succesfulcount + '/' + resultsTotal + ' uploads successful!'});
}