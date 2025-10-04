// // pages/api/chat.ts
// import { NextApiRequest, NextApiResponse } from "next";
// import 'dotenv/config';
// import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
// import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
// import { createRetrievalChain } from "langchain/chains/retrieval";
// import { Chroma } from "@langchain/community/vectorstores/chroma";
// import { HumanMessage, AIMessage } from "@langchain/core/messages";
// import path from "path";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { human } = req.query;

//     if (typeof human !== "string" || !human) {
//         return res.status(400).json({ error: "Invalid or missing 'human' query parameter." });
//     }

//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache, no-transform");
//     res.setHeader("Connection", "keep-alive");
//     res.flushHeaders();

//     let fullAIResponse = '';
//     const chatHistory: (HumanMessage | AIMessage)[] = [new HumanMessage({ content: human })];

//     try {
//         // Load PDF or any document
//         const pdfPath = path.join(process.cwd(), "public", "presentation_skill.pdf");
//         const loader = new PDFLoader(pdfPath);
//         const docs = await loader.load();

//         // Split into chunks
//         const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 50 });
//         const splitDocs = await splitter.splitDocuments(docs);
//         const sanitizedDocs = splitDocs.map(doc => ({
//             ...doc,
//             metadata: Object.fromEntries(
//                 Object.entries(doc.metadata).map(([k, v]) => [k, String(v)]) // convert all metadata to string
//             ),
//         }));


//         // Create embeddings
//         const embeddingsPath = path.join(process.cwd(), "models", "all-MiniLM-L6-v2");
//         const embeddings = new HuggingFaceTransformersEmbeddings({ model: embeddingsPath });

//         // Create vectorstore & retriever
//         const vectorStore = await Chroma.fromDocuments(sanitizedDocs, embeddings, { numDimensions: 384 });
//         const retriever = vectorStore.asRetriever({ k: 2 });

//         // Create LLM with streaming callbacks
//         const model = new ChatGoogleGenerativeAI({
//             temperature: 0.7,
//             model: "gemini-2.5-flash",
//             apiKey: process.env.GOOGLE_API_KEY,
//             streaming: true,
//         });

//         // Create combineDocsChain with prompt
//         const prompt = ChatPromptTemplate.fromTemplate(`
//             You are a helpful assistant giving tips for study and presentation skills. 
//             You are only allowed to answer questions based on the following context from a document If the user greets you, respond politely in a friendly tone.

//             Context: {context}

//             Question: {input}

//             Instructions:
//             - Only answer if the answer is found in the context.
//             - If the question is not related to the context, reply politely with: 
//             "I'm sorry, I can only provide information based on the provided document."
//             - Keep your answers concise and professional, as if explanining someone about the topic from provided document.
//             `);

//         const combineDocsChain = await createStuffDocumentsChain({
//             llm: model,
//             prompt
//         });

//         //  Create RetrievalChain
//         const retrievalChain = await createRetrievalChain({
//             combineDocsChain,
//             retriever
//         });

//         // Invoke the chain
//         // await retrievalChain.invoke({ input: human, chat_history: chatHistory });

//         const stream = retrievalChain.streamEvents(
//             { input: human, chat_history: chatHistory },
//             { version: "v1" } // LangChain config object can be passed here
//         );

//         for await (const event of stream) {
//             // 2. Adjust the event check to filter for the final answer chunk
//             //    It is typically in 'on_chain_stream' for the 'answer' or the final chain itself.
//             if (event.event === "on_chain_stream" && event.name === "retrieval_chain") {
//                 const token = event.data.chunk.answer;
//                 if (token) {
//                     fullAIResponse += token;
//                     // Write token data immediately
//                     res.write(`data: ${JSON.stringify({ token })}\n\n`);
//                 }
//             }
//         }

//         // 3. End the response after the stream completes.
//         res.write("data: [DONE]\n\n");
//         res.end();

//     } catch (error) {
//         console.error("Streaming error:", error);
//         res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
//         res.end();
//     }
// }


import { NextApiRequest, NextApiResponse } from "next";
import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import path from "path";

// /////////////////////////////////////////////////////////////////
// 🚀 FIX: 1. Move Heavy Setup Outside Handler (Caching)
// /////////////////////////////////////////////////////////////////

// 1. Define global variable for the Retriever. It starts as null.
let globalRetriever: any;

/**
 * Initialization function to load documents, embed them, and create the vector store once.
 * This runs when the server starts, eliminating latency on subsequent requests.
 */
async function initializeRetriever() {
    // Only run this if the retriever hasn't been set up yet
    if (globalRetriever) return;

    try {
        console.log("Starting RAG asset initialization...");

        // --- 1. Load PDF (Time-consuming) ---
        const pdfPath = path.join(process.cwd(), "public", "presentation_skill.pdf");
        const loader = new PDFLoader(pdfPath);
        const docs = await loader.load();

        // --- 2. Split into chunks ---
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 50 });
        const splitDocs = await splitter.splitDocuments(docs);
        const sanitizedDocs = splitDocs.map(doc => ({
            ...doc,
            metadata: Object.fromEntries(
                Object.entries(doc.metadata).map(([k, v]) => [k, String(v)])
            ),
        }));

        // --- 3. Create Embeddings (Time-consuming) ---
        const embeddingsPath = path.join(process.cwd(), "models", "all-MiniLM-L6-v2");
        const embeddings = new HuggingFaceTransformersEmbeddings({ model: embeddingsPath });

        // --- 4. Create Vector Store & Retriever (VERY Time-consuming) ---
        console.log("Creating Chroma Vector Store...");
        const vectorStore = await Chroma.fromDocuments(sanitizedDocs, embeddings, { numDimensions: 384 });
        globalRetriever = vectorStore.asRetriever({ k: 2 });
        console.log("Vector Store initialization complete! Ready to handle requests.");
    } catch (error) {
        console.error("RAG Initialization FAILED:", error);
        // You might want to handle initialization failure here (e.g., exit process)
    }
}

// Immediately call the initialization function when the module is loaded
initializeRetriever();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { human } = req.query;

    if (typeof human !== "string" || !human) {
        return res.status(400).json({ error: "Invalid or missing 'human' query parameter." });
    }

    // Check if the retriever is initialized before proceeding
    if (!globalRetriever) {
        return res.status(503).json({ error: "Server is initializing RAG assets. Please try again in a moment." });
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let fullAIResponse = '';
    const chatHistory: (HumanMessage | AIMessage)[] = [new HumanMessage({ content: human })];

    try {
        const retriever = globalRetriever;

        const model = new ChatGoogleGenerativeAI({
            temperature: 0.7,
            model: "gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            streaming: true,
        });

        // Create combineDocsChain with prompt
        const prompt = ChatPromptTemplate.fromTemplate(`
            You are a helpful assistant giving tips for study and presentation skills. 
            You are only allowed to answer questions based on the following context from a document If the user greets you, respond politely in a friendly tone.

            Context: {context}

            Question: {input}

            Instructions:
            - Only answer if the answer is found in the context.
            - If the question is not related to the context, reply politely with: 
            "I'm sorry, I can only provide information based on the provided document."
            - Keep your answers concise and professional, as if explanining someone about the topic from provided document.
            `);

        const combineDocsChain = await createStuffDocumentsChain({
            llm: model,
            prompt
        });

        // Create RetrievalChain
        const retrievalChain = await createRetrievalChain({
            combineDocsChain,
            retriever
        });

        const stream = await retrievalChain.stream({ input: human, chat_history: chatHistory });

        for await (const chunk of stream) {
            const token = chunk?.answer; 

            if (token) {
                fullAIResponse += token;
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        // Send DONE signal and close the connection
        chatHistory.push(new AIMessage(fullAIResponse));
        res.write("data: [DONE]\n\n");
        res.end();

    } catch (error) {
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
        res.end();
    }
}

