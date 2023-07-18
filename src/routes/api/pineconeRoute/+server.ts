import { json } from "@sveltejs/kit";
import { getNamespaceCount, queryVectors } from "$lib/utils/pineconeFunctions";



export async function POST({request}) {
    const {action, query, messages, namespace}= await request.json();
    try{
        if (action === "count") {
          return json(await getNamespaceCount(namespace));
        }
        else if (action === "vector search") {
          return json(await queryVectors(query, namespace));
        }
        else if (action === "check") {
          return json("Not implemented");
        }
        else{
          console.log(action, query, messages, namespace);
          return json("Invalid action");
        }
    }
    catch (e) {
      console.log(e);
      return json(e);
    }
}

  