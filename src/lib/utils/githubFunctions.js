import { Octokit } from "@octokit/core";
import { GITHUB_TOKEN } from "$env/static/private";
import { SupportedTextSplitterLanguages, RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {createEmbedding, createDescription} from "$lib/utils/aiFunctions";
import { ParseStatus } from "zod";
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
            chunkSize: 4000,
            chunkOverlap: 0,
        })
    }
    return RecursiveCharacterTextSplitter.fromLanguage(language, {
        chunkSize: 4000,
        chunkOverlap: 0,
    });
}

/**
 * @param {Octokit}     octokit
 * @param {string}      owner
 * @param {string}      repo
 * @param {any}         path
 */
async function processDirectory(octokit, owner, repo, path, readme=false) {
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
            // If we only want the readme, check if readme is true and that the name of the file contains readme
            if (item.name.toLowerCase().includes('readme'))
            {
                if (readme) {
                    const content = await fetch(item.download_url);
                    const contentText = await content.text();
                    fileContents.push({
                        name: item.name,
                        extension: `.${extension}`,
                        language: Object.keys(languageToExtension).find(key => languageToExtension[key] === `.${extension}`),
                        path: item.path,
                        content: contentText,
                        url: item.html_url,
                    });
                    // Break out of the loop
                    break
                }
            }

            if (Object.values(languageToExtension).includes(`.${extension}`)) {
                const content = await fetch(item.download_url);
                const contentText = await content.text();
                fileContents.push({
                    name: item.name,
                    extension: `.${extension}`,
                    language: Object.keys(languageToExtension).find(key => languageToExtension[key] === `.${extension}`),
                    path: item.path,
                    content: contentText,
                    url: item.html_url,
                });
            }
        }
    }
    return fileContents;
}

/**
 * @param {any} owner
 * @param {any} repo
 * @param {any} path
 * @param {any} fileContents
 */
async function createVectors(owner, repo, path, fileContents){
    const vectorArray = [];
    for (const file of fileContents) {
        let chunks = [];
        try{
            const splitter = createSplitter(file.language);
            if (!file.path.includes('readme')) {
                chunks = await splitter.createDocuments([file.content]);
            }
            else {
                chunks = [file.content]
            }
            for (let i = 0; i < chunks.length; i++) {
                vectorArray.push({
                    id: `${file.path}-${i}`, // i is the chunk number
                    values: await createEmbedding(chunks[i].pageContent),
                    metadata: {
                        Projectname: repo,
                        author: owner,
                        code: chunks[i].pageContent,
                        description: await createDescription(file.name, owner, repo, path, file.content),
                        url: file.url,
                        language: file.language,
                        filename: file.name,
                        path: file.path,
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

/**
 * @param {{split: (arg0: string) => [any, any, any];}} url
 * @param {boolean | undefined} [readme]
 */
export async function getCodeFromGithub(url, readme) {
    // If github.com/ is in the url, split it
    const splitUrl = url.split('github.com/')[1];
    const [owner, repo, path] = splitUrl.split('/');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const fileContents = await processDirectory(octokit, owner, repo, path, readme);
    // Turn the fileContents into a vector array for pinecone
    return await createVectors(owner, repo, path, fileContents);
    
}
