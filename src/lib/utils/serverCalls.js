/**
 * @param {string} namespace
 */
export async function getResultsCount(namespace)
{
    try{return await fetch('/api/pineconeRoute',
        {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "action": "count",
                "namespace": namespace})
        })
        // API returns a json object with the response
        .then(response => response.json())
        .then(data => {
            return data
        })
    }
    catch(err){
        console.log("Error getting results count: "+err)
    }
}

/**
 * @param {any} query
 * @param {any} namespace
 */
 export async function checkPinecone(query, namespace) {
    const response = await fetch('/api/pineconeRoute', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            "action": "check",
            "query": query, 
            "namespace": namespace
        })
    });
    return response.json();
}


/**
 * @param {any} messages
 * @param {any} namespace
 */
export async function getResults(messages, namespace)
{
    // Get the second last message and return the content as a query
    const query = messages[messages.length-2].text;
    try{return await fetch('/api/pineconeRoute',
        {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "action": "vector search",
                "query": query, 
                "namespace": namespace})
        })
        // API returns a json object with the response
        .then(response => response.json())
        .then(data => {
            return data
        })
    }
    catch(err){
        console.log("Error getting array of results" + err)
    } 
}

/**
 * @param {import("langchain/schema").AIChatMessage[]} messages
 * @param {string} namespace
 */
export async function getMessage (messages, namespace)
{
    const results = await getResults(messages, namespace);
    try{
      return await fetch('/api/openAIRoute',
        {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                "messages": messages, 
                "query": results.matches[0],
                "namespace": namespace
            })
        })
        // API returns a json object with the response
        .then(response => response.json())
        .then(data => {
            return [data, results.matches]
        })
    }
    catch(err){
        console.log(err)
    }
}