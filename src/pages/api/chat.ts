import { NextApiRequest, NextApiResponse } from "next";
import 'dotenv/config';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
// import { CallbackManager } from "langchain/callbacks";
import { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";



export default async function ChatApi(req: NextApiRequest, res: NextApiResponse) {
    // if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

    const { human } = req.query;

    // console.log(human);

    if (typeof human !== "string" || !human) {
        return res.status(400).json({ error: "Invalid or missing 'human' query parameter." });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders(); // start streaming


    let chatHistory: (HumanMessage | AIMessage)[] = [];
    chatHistory.push(new HumanMessage({ content: human }));


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
                        res.write(`data: ${JSON.stringify({ token })}\n\n`); // stream token to frontend

                    },
                    handleLLMEnd() {
                        res.write("data: [DONE]\n\n"); // end signal
                        chatHistory.push(new AIMessage(fullAIResponse))
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
            new MessagesPlaceholder("agent_scratchpad"),
        ]);

        const searchTool = new TavilySearchResults();
        const tools = [searchTool];

        const agent = await createToolCallingAgent({
            llm: model,
            tools,
            prompt,
        });


        const agentExecutor = new AgentExecutor({
            agent,
            tools,
        });
        // const formattedPromptValue = await prompt.formatPromptValue({ input: human });

        // // Wrap in array to satisfy generatePrompt
        // await model.generatePrompt([formattedPromptValue]);


        await agentExecutor.invoke({
            input: human,
            chat_history: chatHistory,
            // chat_history: chatHistory.filter(msg => msg instanceof HumanMessage),
        });


    } catch (error) {
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming." })}\n\n`);
    }

}