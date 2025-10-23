// import { HealthData } from "@/utils/data/health"
// import { EducationData } from "@/utils/data/education";
// import Link from "next/link";

// interface SidebarProps {
//     topic: string;
//      onSelectQuestion: (question: string) => void;
// }

// export default function Sidebar({ topic, onSelectQuestion }: SidebarProps) {
//     return (
//         <div className="p-4">
//             <p className="mb-2 text-cyan-700">Questions</p>
//             {
//                 topic == "mental-health" && (
//                     HealthData.map((data) => (
//                         <div onClick={() => onSelectQuestion(data)} className="health p-3 bg-slate-900 mb-3 rounded-md hover:bg-slate-800 cursor-pointer transition-colors duration-200">
//                             <p className="text-sm text-cyan-600">{data}</p>
//                         </div>
//                     ))
//                 )
//             }

//             {
//                 topic == "higher-education" && (
//                     EducationData.map((data) => (
//                         <div onClick={() => onSelectQuestion(data)} className="health p-3 bg-slate-900 mb-3 rounded-md hover:bg-slate-800 cursor-pointer transition-colors duration-200">
//                             <p className="text-sm text-cyan-600">{data}</p>
//                         </div>
//                     ))
//                 )
//             }

//         </div>
//     )
// }


import { HealthData } from "@/utils/data/health";
import { EducationData } from "@/utils/data/education";
import { useState } from "react";
import { X } from 'lucide-react';

interface SidebarProps {
  topic: string;
  onSelectQuestion: (question: string) => void;
  isOpen : boolean;
  onClose: () => void;
}

export default function Sidebar({ topic, onSelectQuestion, isOpen, onClose }: SidebarProps) {
  

  const dataList =
    topic === "mental-health"
      ? HealthData
      : topic === "higher-education"
      ? EducationData
      : [];

  return (
    <>
      <div
        className={`
          fixed top-0 left-0 h-full w-3/4 md:w-full p-4 z-50 transform transition-transform duration-300
          md:relative md:translate-x-0 bg-slate-900 md:bg-transparent   
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <div className=" text-cyan-400 font-bold">Questions</div>
          <div className="md:hidden">
            <button className="cursor-pointer hover:bg-slate-700 p-2 rounded" onClick={onClose}>
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {dataList.map((data, index) => (
          <div
            key={index}
            onClick={() => onSelectQuestion(data)}
            className="p-3 mb-3 bg-slate-800 rounded-md hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <p className="text-sm text-cyan-200">{data}</p>
          </div>
        ))}
      </div>
    </>
  );
}
