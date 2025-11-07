## Set up guidelines

///////////////////////////////////////////////////////////////////////////////////////////////////////

## your .env file should be

GOOGLE_API_KEY=your_gemini_api_key

TAVILY_API_KEY=tavily_api
PINECONE_API_KEY=pinecone_api
PINECONE_INDEX_NAME=my-embeddings
HF_API_KEY=hugging_face_api


///////////////////////////////////////////////////////////////////////////////////////////////////////////

npm install

Run hugging face embedding model in base directory called "model"

preembed data with "node src/scripts/embedPdf.js"

