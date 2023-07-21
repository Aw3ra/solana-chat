import { json } from "@sveltejs/kit";
import { getCodeFromGithub} from "$lib/utils/githubFunctions"
import { addVectors } from "$lib/utils/pineconeFunctions.js";


export async function POST({request}) {
    let {url, upload} = await request.json();
    if (!url) {
        return json({status: "No url was provided."});
    }
    if (upload === "full")
    {
        const vectors = await getCodeFromGithub(url);
        const namespace = url.split("github.com/")[1];
        console.log(vectors)
        const vectorsAdded = await addVectors(vectors, namespace);
        let succesfulcount = vectorsAdded;
        return json({status: "Uploaded: "+ succesfulcount + " vectors to the database."});
    }
    else if (upload === "readme")
    {
        console.log("Readme upload not yet implemented.")
        return json({status: "Readme upload not yet implemented."});
    }

}