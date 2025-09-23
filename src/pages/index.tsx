
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/layout"



export default function Home() {
  return (
    <main className="w-full h-screen flex items-center justify-center md:px-0 px-3">
      <div className="">
        <Image
          className="mx-auto"
          src="/robot1.gif"
          alt="Picture of the author"
          width={150}
          height={150}
        />
        <h1 className="text-2xl font-bold text-cyan-500 mt-5">Welcome to Langchain Chatapp</h1>
        <div className="p-5 bg-slate-700 rounded-sm text-center mt-4">
          <p className="text-amber-400">Navigate to Chatroom</p>
          <button className="bg-cyan-500 px-4 py-2 text-white-900 hover:bg-cyan-600 rounded-sm mt-5 cursor-pointer">
            <Link href="/chat">Chat</Link>
          </button>
        </div>
      </div>
    </main>
  );
}
