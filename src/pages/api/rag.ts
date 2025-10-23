import { NextApiRequest, NextApiResponse } from "next";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

// --- Initialize Pinecone & embeddings ---
const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = client.Index("topic-chat-index");

// const embeddingsPath = path.join(process.cwd(), "models", "all-MiniLM-L6-v2");
// const embeddings = new HuggingFaceTransformersEmbeddings({ model: embeddingsPath });

const embeddings = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_API_KEY,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});



const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { human, topic } = req.query;

    if (typeof human !== "string" || !human) {
        return res.status(400).json({ error: "Invalid or missing 'human' query parameter." });
    }
    let searchTopic = "general";
    if (typeof topic === "string") {
        searchTopic = topic.replace(/-/g, " "); // "mental-health" -> "mental health"
    }

    // try {
    //     const docsAll = await vectorStore.similaritySearch(`mental health: ${human}`, 10);
    //     const docs = docsAll.filter(doc => doc.metadata?.topic === searchTopic);

    //     const context = docs.map(d => d.pageContent).join("\n\n");

    //     res.setHeader("Content-Type", "text/event-stream");
    //     res.setHeader("Cache-Control", "no-cache, no-transform");
    //     res.setHeader("Connection", "keep-alive");
    //     res.flushHeaders();

    //     const model = new ChatGoogleGenerativeAI({
    //         temperature: 0.7,
    //         model: "gemini-2.5-flash",
    //         apiKey: process.env.GOOGLE_API_KEY,
    //         streaming: true,
    //     });

    //     // const stream = await model.stream([
    //     //     {
    //     //         role: "system",
    //     //         content: `You are a highly professional and formal AI assistant.
    //     //         Answer questions **only** based on the provided context.
    //     //         Always maintain a formal and polite tone.
    //     //         Do NOT provide any information not included in the context.

    //     //         Context:
    //     //         ${context}`
    //     //     },
    //     //     { role: "user", content: human },
    //     // ]);

    //     const stream = await model.stream([
    //         {
    //             role: "system",
    //             content: `You are a highly professional AI assistant.
    //             Answer questions strictly based on the provided context.
    //             Whenever you use information from the context, explicitly mention the **source PDF file and page number**.
    //             Do NOT provide information not included in the context.

    //             Context:
    //             ${context}`
    //         },
    //         { role: "user", content: human },
    //     ]);


    //     for await (const chunk of stream) {
    //         const token =  chunk.content ?? "";
    //         if (token) {
    //             res.write(`data: ${JSON.stringify({ token })}\n\n`);
    //         }
    //     }

    //     res.write("data: [DONE]\n\n");
    //     res.end();

    // } catch (error) {
    //     console.error("Streaming error:", error);
    //     res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
    //     res.end();
    // }

     try {
        const docsAll = await vectorStore.similaritySearch(`mental health: ${human}`, 10);
        const docs = docsAll.filter(doc => doc.metadata?.topic === searchTopic);

        // const context = docs.map(d => d.pageContent).join("\n\n");

        const context = docs
            .map(
                d => `From ${d.metadata?.source ?? "unknown file"}, page ${d.metadata?.page ?? "?"}:\n${d.pageContent}`
            )
            .join("\n\n");

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const model = new ChatGoogleGenerativeAI({
            temperature: 0.7,
            model: "gemini-2.5-flash",
            apiKey: process.env.GOOGLE_API_KEY,
            streaming: true,
        });

        // const stream = await model.stream([
        //     {
        //         role: "system",
        //         content: `You are a highly professional and formal AI assistant.
        //         Answer questions **only** based on the provided context.
        //         Always maintain a formal and polite tone.
        //         Do NOT provide any information not included in the context.

        //         Context:
        //         ${context}`
        //     },
        //     { role: "user", content: human },
        // ]);

        const stream = await model.stream([
            {
                role: "system",
                content: `You are a highly professional AI assistant.
                Answer questions strictly based on the provided context.
                Whenever you use information from the context, explicitly mention the **source PDF file and page number**.
                Do NOT provide information not included in the context.

                Context:
                ${context}`
            },
            { role: "user", content: human },
        ]);


        for await (const chunk of stream) {
            const token = chunk.content ?? "";
            if (token) {
                res.write(`data: ${JSON.stringify({ token })}\n\n`);
            }
        }

        res.write("data: [DONE]\n\n");
        res.end();

    } catch (error) {
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
        res.end();
    }

}
