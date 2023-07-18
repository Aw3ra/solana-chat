import { Octokit } from "@octokit/core";
import { OPENAI_API_KEY, GITHUB_TOKEN, PINECONE_ENVIRONMENT, PINECONE_INDEX, PINECONE_API_KEY} from "$env/static/private";
import { SupportedTextSplitterLanguages, RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {createEmbedding} from "$lib/utils/aiFunctions";
// Extension mapping based on your supportedLanguages array
const languageToExtension = {
    'cpp': '.cpp',
    'go': '.go',
    'java': '.java',
    'js': '.js',
    'php': '.php',
    'proto': '.proto',
    'python': '.py',
    'rst': '.rst',
    'ruby': '.rb',
    'rust': '.rs',
    'scala': '.scala',
    'swift': '.swift',
    'markdown': '.md',
    'latex': '.tex',
    'html': '.html',
    'css': '.css',
    'svelte': '.svelte',
    'vue': '.vue',
    'typescript': '.ts',
};
/**
 * @param {string} language
 */
 function createSplitter(language) {
    if (!SupportedTextSplitterLanguages.hasOwnProperty(language)) {
        // Skip this file if it's not a supported language
        return new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 0,
        })
    }
    return RecursiveCharacterTextSplitter.fromLanguage(language, {
        chunkSize: 1000,
        chunkOverlap: 0,
    });
}



/**
 * @param {Octokit}     octokit
 * @param {string}      owner
 * @param {string}      repo
 * @param {any}         path
 */
async function processDirectory(octokit, owner, repo, path) {
    const { data } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        ...(path && { path })
    });
    const fileContents = [];
    for(const item of data) {
        if (item.type === 'dir') {
            const subDirContent = await processDirectory(octokit, owner, repo, item.path);
            fileContents.push(...subDirContent);
        } else {
            const extension = item.name.split('.').pop();
            if (Object.values(languageToExtension).includes(`.${extension}`)) {
                const content = await fetch(item.download_url);
                fileContents.push({
                    name: item.name,
                    extension: `.${extension}`,
                    language: Object.keys(languageToExtension).find(key => languageToExtension[key] === `.${extension}`),
                    path: item.path,
                    content: await content.text(),
                });
            }
        }
    }
    return fileContents;
}

/**
 * @param {{ split: (arg0: string) => [any, any, any]; }} url
 */
export async function getCodeFromGithub(url) {
    // If github.com/ is in the url, split it
    const splitUrl = url.split('github.com/')[1];
    const [owner, repo, path] = splitUrl.split('/');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const fileContents = await processDirectory(octokit, owner, repo, path);
    // Turn the fileContents into a vector array for pinecone
    const vectorArray = [];
    for (const file of fileContents) {
        try{
            const splitter = createSplitter(file.language);
            const chunks = await splitter.createDocuments([file.content]);
            for (let i = 0; i < chunks.length; i++) {
                vectorArray.push({
                    id: `${file.path}-${i}`, // i is the chunk number
                    values: await createEmbedding(chunks[i].pageContent),
                    metadata: {
                        Projectname: repo,
                        author: owner,
                        text: chunks[i].pageContent,
                        url: url,
                        language: file.language,
                    },
                });
            }
        }
        catch(err){
            // Skip this file if it's not a supported language
            console.log("Error with " + file.name +": "+ err)
            continue;
        }
    }    
    return vectorArray;
}
