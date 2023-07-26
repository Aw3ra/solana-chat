# This is the repo for [Solana Repo Chat](https://solana-repo-chat.vercel.app)

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