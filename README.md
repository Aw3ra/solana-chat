# This is the repo for [Solanoid](https://solanoid.xyz)
### By awera

This chat app utilises pinecone, openAI and sveltekit to allow users to talk to solana github repos.
It is accessible at solanoid.xyz and was built for the Encode Hackathon.

## Installation
- git clone
- npm install i
- set .env vars in a .env file, vars needed:
  - OPENAI_API_KEY       (Your openAI api key for embeddings and chat functionality)
  - GITHUB_TOKEN         (A github token to enable more github api requests, rate limit is 5k files per hour using the token)
  - PINECONE_API_KEY     (Your pinecone api key, support for other vector stores later)
  - PINECONE_ENVIRONMENT (The enivornment for pinecone)
  - PINECONE_INDEX       (The index or database on pinecone you are connecting to)


Adding a change
