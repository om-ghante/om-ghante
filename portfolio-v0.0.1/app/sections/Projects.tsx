"use client";

import { useState } from "react";
import Image from "next/image";
import { Link2, Code, Smartphone, Brain, Package, ChevronDown, ChevronUp, ArrowUpRight, Folder } from "lucide-react";

import content from "../data/content.json";

interface Project {
    id: number;
    title: string;
    description: string;
    category: "website" | "mobile" | "ai" | "library";
    techStack: string[];
    imageUrl: string;
    demoUrl: string;
    repoUrl: string;
}

const projects = content.projects.items as unknown as Project[];

const Projects = () => {
    const [activeTab, setActiveTab] = useState<
        "website" | "mobile" | "ai" | "library"
    >("website");
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

    const ITEMS_PER_PAGE = 4;

    const filteredProjects = projects.filter((p) => p.category === activeTab);
    const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);

    const visibleProjects = filteredProjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Default to the first project in the list for the preview if none hovered
    const activePreview = hoveredProject || visibleProjects[0];

    const tabIcons: Record<string, any> = {
        website: Code,
        mobile: Smartphone,
        ai: Brain,
        library: Package
    };

    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-20 text-gray-900">
            {/* Title Banner */}
            <div className="w-full bg-white py-4 mb-12">
                <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
                    <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 flex items-center justify-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]"></span>
                        </span>
                        {content.projects.title}
                    </h2>
                </div>
            </div>

            <div className="mx-auto w-full max-w-7xl px-6 md:px-12 lg:px-24">
                {/* Tabs */}
                <div className="mb-16 flex flex-wrap justify-center gap-4">
                    {content.projects.tabs.map((tab) => {
                        const Icon = tabIcons[tab.id];
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setCurrentPage(1);
                                    setHoveredProject(null);
                                }}
                                className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? "bg-black text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={16} strokeWidth={1.5} className={activeTab === tab.id ? "text-sky-400" : "text-sky-600"} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Interactive List Layout */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                    {/* List Column */}
                    <div className="flex flex-col">
                        <div className="flex flex-col min-h-[350px]">
                            {visibleProjects.map((project) => (
                                <div
                                    key={project.id}
                                    onMouseEnter={() => setHoveredProject(project)}
                                    className={`group relative flex cursor-pointer items-center justify-between border-b border-gray-100 py-6 px-4 transition-all hover:bg-transparent`}
                                >
                                    <div className="flex items-center gap-4">
                                        <Folder
                                            size={20}
                                            strokeWidth={1.5}
                                            className={`transition-colors group-hover:text-gray-400 ${(hoveredProject?.id === project.id || (!hoveredProject && activePreview?.id === project.id)) ? "text-sky-600" : "text-sky-600"
                                                }`}
                                        />
                                        <h3 className={`text-xl font-bold transition-colors group-hover:text-gray-400 ${(hoveredProject?.id === project.id || (!hoveredProject && activePreview?.id === project.id)) ? "text-black" : "text-black"
                                            }`}>
                                            {project.title}
                                        </h3>
                                    </div>
                                    <ArrowUpRight
                                        size={20}
                                        className={`transition-transform duration-300 group-hover:text-gray-400 group-hover:-translate-y-1 group-hover:translate-x-1 ${(hoveredProject?.id === project.id || (!hoveredProject && activePreview?.id === project.id))
                                            ? "text-sky-600"
                                            : "text-sky-600"
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-full transition-colors ${currentPage === 1
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                                        }`}
                                >
                                    <ChevronUp size={20} className="-rotate-90" />
                                </button>

                                <span className="text-sm font-medium text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-full transition-colors ${currentPage === totalPages
                                        ? "text-gray-300 cursor-not-allowed"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                                        }`}
                                >
                                    <ChevronDown size={20} className="-rotate-90" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview Column (Sticky) */}
                    <div className="hidden lg:block relative h-[600px] w-full">
                        <div className="top-24 h-[500px] w-full overflow-hidden rounded-2xl border border-gray-200 bg-white flex flex-col">
                            {activePreview && (
                                <>
                                    <div className="relative h-[60%] w-full bg-black">
                                        <Image
                                            src={activePreview.imageUrl}
                                            alt={activePreview.title}
                                            fill
                                            className="object-contain p-8"
                                            priority
                                        />
                                    </div>
                                    <div className="flex-1 px-8 pt-4 pb-8 flex flex-col justify-between border-t border-gray-100">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-3xl font-bold text-black">{activePreview.title}</h3>
                                                <div className="flex gap-2">
                                                    {activePreview.techStack.slice(0, 3).map((tech) => (
                                                        <span key={tech} className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{tech}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm leading-relaxed mb-2">{activePreview.description}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <a
                                                href={activePreview.demoUrl}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-black py-2 text-sm font-bold text-white transition-opacity hover:opacity-80"
                                            >
                                                <Link2 size={18} strokeWidth={2} /> Live Demo
                                            </a>
                                            <a
                                                href={activePreview.repoUrl}
                                                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                                            >
                                                <Code size={18} strokeWidth={2} /> View Code
                                            </a>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
