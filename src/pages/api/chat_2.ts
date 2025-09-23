import { NextApiRequest, NextApiResponse } from "next";
import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { BufferMemory } from 'langchain/memory';
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { ConversationChain } from "langchain/chains";

export default async function ChatApi(req: NextApiRequest, res: NextApiResponse) {
  const { human } = req.query;

  if (typeof human !== "string" || !human) {
    return res.status(400).json({ error: "Invalid or missing 'human' query parameter." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let fullAIResponse = '';

  try {
    const model = new ChatGoogleGenerativeAI({
      temperature: 0.7,
      model: "gemini-1.5-flash",
      apiKey: process.env.GOOGLE_API_KEY,
      streaming: true,
      callbacks: [
        {
          handleLLMNewToken(token: string) {
            fullAIResponse += token;
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          },
          handleLLMEnd() {
            res.write("data: [DONE]\n\n");
            res.end();
          },
          handleLLMError(err: Error) {
            console.error(err);
            res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            res.end();
          },
        },
      ],
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "You are a helpful assistant called Max."],
        new MessagesPlaceholder("chat_history"),
        ["human", "{input}"],
    ]);

    const upstashMemory = new UpstashRedisChatMessageHistory({
      sessionId: "chat1", // you can make this dynamic per user
      config: {
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      },
    });

    const memory = new BufferMemory({
      memoryKey: "chat_history",
      chatHistory: upstashMemory,
      returnMessages: true,
    });

    const chatChain = new ConversationChain({
      llm: model,
      memory,
      prompt
    });

    await chatChain.call({ input: human });

  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
  }
}
