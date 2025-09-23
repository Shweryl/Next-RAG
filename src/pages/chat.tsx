'use client'

import { useRef, useState } from "react"

export default function ChatRoom() {
    const [messages, setMessages] = useState<{ human: string, AI?: string }[]>([]);
    const [humanInput, setHumanInput] = useState("");
    const aiMessageRef = useRef("");

    const handleSubmit = async () => {
        if (humanInput == "") {
            return;
        }

        setMessages((prev) => [...prev, { human: humanInput }]);
        setHumanInput("");

        aiMessageRef.current = "";

        const source = new EventSource(`/api/chat_2?human=${encodeURIComponent(humanInput)}`);

        source.onmessage = (event) => {
            const data = event.data;

            if (data === "[DONE]") {
                source.close();
                return;
            }

            try {
                //Assuming the data is a JSON string of a chunk

                const chunk = JSON.parse(data);

                if (chunk.token) {
                    aiMessageRef.current += chunk.token;
                    // console.log(aiMessageRef.current);
                    setMessages((prev) => {
                        const newMessages = [...prev];
                        const lastMessage = newMessages[newMessages.length - 1];
                        lastMessage.AI = aiMessageRef.current;
                        return newMessages;
                    });
                }


            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        };

        source.onerror = (error) => {
            console.error("EventSource failed:", error);
            source.close();
        };
    };


    return (
        <main className="w-full flex justify-center h-full">
            <div className=" md:w-3/5 h-full grid grid-rows-[20px_minmax(0,1fr)_auto] p-4">
                <h1 className="text-cyan-700 ">Gemini Flash 1.5</h1>
                <div className="bg-slate-900 my-2 overflow-y-scroll no-scrollbar p-3 md:p-5 rounded-sm">
                    {
                        messages.length == 0 && (

                            <div className="flex items-center justify-center h-full">
                                <p className="text-slate-600">What is your question?</p>
                            </div>
                        )
                    }

                    {messages && messages.map((message, index) => (
                        <div key={index}>
                            <div className="text-end mb-5">
                                <p className="human-message px-4 py-2 max-w-[80%] bg-slate-800 inline-block rounded-l-lg rounded-tr-lg">
                                    {message.human}
                                </p>
                            </div>
                            {
                                message.AI && (
                                    <div className="mb-5">
                                        <p className="ai-message px-4 py-2 max-w-[80%] bg-cyan-700 inline-block rounded-r-lg rounded-tl-lg">
                                            {message.AI}
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    ))}


                </div>
                <div className="input-box mt-3">
                    <textarea name="" id=""
                        placeholder="Press Enter for answer." value={humanInput}
                        onChange={(e) => setHumanInput(e.target.value)} onKeyUp={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        className="w-full p-3 bg-gray-900 rounded-sm" rows={3}></textarea>
                </div>
            </div>
        </main>
    )
}