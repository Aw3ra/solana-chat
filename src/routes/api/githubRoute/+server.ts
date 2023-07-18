import { json } from "@sveltejs/kit";
import { getCodeFromGithub} from "$lib/utils/githubFunctions"
import { addVectors } from "$lib/utils/pineconeFunctions.js";


export async function POST({request}) {
    let data = await request.json();
    let results = [];
    const vectors = await getCodeFromGithub(data.url);
    const namespace = data.url.split("github.com/")[1];
    const vectorsAdded = await addVectors(vectors, namespace);
    console.log(vectorsAdded);
    let succesfulcount = 0;
    let resultsTotal = results.length;
    return json({status: succesfulcount + '/' + resultsTotal + ' uploads successful!'});
}