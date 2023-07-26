import { json } from "@sveltejs/kit";
import { getCodeFromGithub} from "$lib/utils/githubFunctions"
import { addVectors } from "$lib/utils/pineconeFunctions.js";


export async function POST({request}) {
    let {url, upload} = await request.json();
    if (!url || !url.includes("github.com")) {
        return json({status: "No url was provided."});
    }
    if (upload === "full")
    {
        return json({status: "Not yet implemented."});
        const vectorsAdded = 
            await addVectors(
                await getCodeFromGithub(url), 
                url.split("github.com/")[1]
                );
        let succesfulcount = vectorsAdded;
        return json({status: "Uploaded: "+ succesfulcount + " vectors."});
    }
    else if (upload === "readme")
    {
        {
            // return json({status: "README not yet implemented."});
            const readme=true
            const vectorsAdded = 
                await addVectors(
                    await getCodeFromGithub(url, readme), 
                    "solana"
                    );
            let succesfulcount = vectorsAdded;
            return json({status: "Uploaded: "+ succesfulcount + " vectors."});
        }
    }
}