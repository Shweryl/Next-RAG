import { HealthData } from "@/utils/data/health"
import { EducationData } from "@/utils/data/education";
import Link from "next/link";

interface SidebarProps {
    topic: string;
     onSelectQuestion: (question: string) => void;
}

export default function Sidebar({ topic, onSelectQuestion }: SidebarProps) {
    return (
        <div className="p-4">
            <p className="mb-2 text-cyan-700">Questions</p>
            {
                topic == "mental-health" && (
                    HealthData.map((data) => (
                        <div onClick={() => onSelectQuestion(data)} className="health p-3 bg-slate-900 mb-3 rounded-md hover:bg-slate-800 cursor-pointer transition-colors duration-200">
                            <p className="text-sm text-cyan-600">{data}</p>
                        </div>
                    ))
                )
            }

            {
                topic == "higher-education" && (
                    EducationData.map((data) => (
                        <div onClick={() => onSelectQuestion(data)} className="health p-3 bg-slate-900 mb-3 rounded-md hover:bg-slate-800 cursor-pointer transition-colors duration-200">
                            <p className="text-sm text-cyan-600">{data}</p>
                        </div>
                    ))
                )
            }

        </div>
    )
}