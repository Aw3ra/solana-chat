import { checkPineconeNew } from "$lib/utils/pineconeFunctions";

export async function post(request) {
    const { query, namespace } = JSON.parse(request.body);
    const data = await checkPineconeNew(query, namespace);
    console.log(data);
    return { body: "done" };
}