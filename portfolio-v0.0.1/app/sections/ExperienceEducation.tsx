"use client";

import { useState } from "react";
import { GraduationCap, Briefcase } from "lucide-react";
import content from "../data/content.json";

interface TimelineItem {
    id: number;
    title: string;
    organization: string;
    duration: string;
    description: string;
    technologies?: string[];
    post?: string;
}

const ExperienceEducation = () => {
    const [activeTab, setActiveTab] = useState<"experience" | "education">("experience");
    const [showAll, setShowAll] = useState(false);

    const fullData: TimelineItem[] =
        activeTab === "experience" ? content.experience : content.education;

    const activeData = showAll ? fullData : fullData.slice(0, 4);

    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-20 text-gray-900">
            {/* Title Banner */}
            <div className="w-full bg-white py-4 mb-12">
                <div className="mx-auto w-full max-w-4xl px-6 md:px-12 lg:px-24">
                    <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 flex items-center justify-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]"></span>
                        </span>
                        {content.experienceEducation.title}
                    </h2>
                </div>
            </div>

            <div className="mx-auto w-full max-w-6xl px-6 md:px-12 lg:px-24">
                {/* Tabs */}
                <div className="mb-10 flex justify-center space-x-4">
                    <button
                        onClick={() => {
                            setActiveTab("experience");
                            setShowAll(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-all ${activeTab === "experience"
                            ? "bg-black text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <Briefcase size={16} strokeWidth={1.5} className={activeTab === "experience" ? "text-sky-400" : "text-sky-600"} />
                        {content.experienceEducation.experienceTab}
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("education");
                            setShowAll(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium transition-all ${activeTab === "education"
                            ? "bg-black text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                            }`}
                    >
                        <GraduationCap size={16} strokeWidth={1.5} className={activeTab === "education" ? "text-sky-400" : "text-sky-600"} />
                        {content.experienceEducation.educationTab}
                    </button>
                </div>

                {/* Content - Single Column */}
                <div className="grid gap-6 grid-cols-1">
                    {activeData.map((item) => (
                        <div
                            key={item.id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 pb-16 transition-all hover:-translate-y-1"
                        >
                            <span className="absolute right-6 top-6 text-sm font-medium text-sky-600">
                                {item.duration}
                            </span>
                            <h3 className="mb-1 text-xl font-bold">{item.title}</h3>
                            <p className="mb-1 text-lg font-semibold text-gray-900">
                                {item.organization}
                            </p>

                            {/* Decorative line */}
                            <div className="my-3 h-0.5 w-12 bg-sky-600"></div>

                            <p className="text-sm leading-relaxed text-gray-600">
                                {item.description}
                            </p>

                            {/* Bottom black bar with content */}
                            <div className="absolute bottom-0 left-0 w-full bg-black py-3 px-6 flex items-center">
                                {activeTab === "experience" && item.technologies && (
                                    <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                                        {item.technologies.join(" • ")}
                                    </p>
                                )}
                                {activeTab === "education" && item.post && (
                                    <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
                                        {item.post}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                </div>

                {/* View More Button */}
                {fullData.length > 4 && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="rounded-full bg-white px-6 py-2 text-sm font-bold text-black border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            {showAll ? "View Less" : "View More"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ExperienceEducation;
