
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/layout"



export default function Home() {
  return (
    <main className="w-full h-screen md:px-0 px-3 ">
      <div className="flex flex-col justify-center items-center">
        <div className="mb-6">
          <Image
            className="mx-auto"
            src="/robot1.gif"
            alt="Picture of the author"
            width={150}
            height={150}
          />
          <h1 className="text-2xl font-bold text-cyan-500 mt-5 text-center">Welcome to Langchain Chatapp</h1>
          <div className="p-5 bg-slate-700 rounded-md text-center mt-4">
            <p className="text-amber-400">Navigate to Specific Chatroom</p>
          </div>
        </div>

        {/* <div className="w-full lg:w-3/4 ">
          <div className="w-full flex flex-col md:flex-row gap-3">
            <div className="lg:w-1/3 md:w-1/2 sm:w-full  bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg font-bold text-amber-500 mb-3">Health</p>
              <p className="text-md">Mental health issues such as anxiety, depression, and eating disorders affect daily life but can be treated with proper care and support.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white-900 hover:bg-cyan-600 rounded-sm mt-4 cursor-pointer">
                  <Link href="/chat?topic=mental-health">Go Chat</Link>
                </button>
              </div>
            </div>
             <div className="lg:w-1/3 md:w-1/2 sm:w-full bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg text-amber-500 font-bold mb-3">Study and Presentation Skills</p>
              <p className="text-md">How to develop effective study and presentation skills, manage time, set goals, and work independently to succeed in higher education.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white-900 hover:bg-cyan-600 rounded-sm mt-4 cursor-pointer">
                  <Link href="/chat?topic=higher-education">Go Chat</Link>
                </button>
              </div>
            </div>
             <div className="lg:w-1/3 md:w-full sm:w-full bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg text-amber-500 font-bold mb-3">React Cheatsheet</p>
              <p className="text-md">We Provide Mental Health Update. You can ask about mental illnesss.Syndromes of Mentall illness and how to set back mental illness.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white-900 hover:bg-cyan-600 rounded-sm mt-4 cursor-pointer">
                  <Link href="/chat?topic=mental-health">Go Chat</Link>
                </button>
              </div>
            </div>
          </div>
        </div> */}

        <div className="container mx-auto sm:px-2 lg:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Card 1 */}
            <div className="bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg font-bold text-amber-500 mb-3">Health</p>
              <p className="text-md">Mental health issues such as anxiety, depression, and eating disorders affect daily life but can be treated with proper care and support.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 rounded-sm mt-4">
                  <Link href="/chat?topic=mental-health">Go Chat</Link>
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg font-bold text-amber-500 mb-3">Study and Presentation Skills</p>
              <p className="text-md">How to develop effective study and presentation skills, manage time, set goals, and work independently to succeed in higher education.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 rounded-sm mt-4">
                  <Link href="/chat?topic=higher-education">Go Chat</Link>
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-cyan-900 p-5 border-cyan-600 rounded-md flex flex-col">
              <p className="text-center text-lg font-bold text-amber-500 mb-3">React Cheatsheet</p>
              <p className="text-md">We provide Mental Health Update. You can ask about mental illnesses, syndromes, and how to set back mental illness.</p>
              <div className="text-center mt-auto">
                <button className="bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 rounded-sm mt-4">
                  <Link href="/chat?topic=mental-health">Go Chat</Link>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
