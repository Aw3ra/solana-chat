export async function getResultsCount(namespace)
{
    try{return await fetch('/api/pineconeRoute',
        {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"count": true, "namespace": namespace})
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
 * @param {any} messages
 * @param {any} namespace
 */
export async function getResults(messages, namespace)
{
    try{return await fetch('/api/pineconeRoute',
        {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"messages": messages, "namespace": namespace})
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
            body: JSON.stringify({"messages": messages, "query": results[0]})
        })
        // API returns a json object with the response
        .then(response => response.json())
        .then(data => {
            return [data, results.slice(1)]
        })
    }
    catch(err){
        console.log(err)
    }
}