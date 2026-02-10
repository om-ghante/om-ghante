"use client";

import content from "../data/content.json";

const Skills = () => {
    const { skills: skillsData } = content;

    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-20 text-gray-900">
            {/* Title Banner */}
            <div className="w-full bg-white py-4 mb-12">
                <div className="mx-auto max-w-4xl text-left px-6 md:px-12 lg:px-24">
                    <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 flex items-center justify-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]"></span>
                        </span>
                        {skillsData.title}
                    </h2>
                </div>
            </div>

            <div className="mx-auto max-w-7xl text-left px-6 md:px-12 lg:px-24">
                <div className="grid gap-12 md:grid-cols-2 text-left mb-12">
                    {/* Advanced Skills */}
                    <div>
                        <h3 className="mb-6 text-xl font-semibold text-gray-700">
                            {skillsData.advancedTitle}
                        </h3>
                        <div className="flex flex-wrap justify-start gap-3">
                            {skillsData.advanced.map((skill) => {
                                const isHighlighted = ["Java", "MERN Stack", "Ubuntu", "JavaScript", "Git"].includes(skill);
                                return (
                                    <span
                                        key={skill}
                                        className={`rounded-md border px-6 py-3 text-lg font-medium transition-transform hover:scale-105 cursor-pointer ${isHighlighted
                                            ? "bg-black text-sky-400 border-gray-800"
                                            : "bg-white text-gray-800 border-gray-200"
                                            }`}
                                    >
                                        {skill}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Intermediate Skills */}
                    <div>
                        <h3 className="mb-6 text-xl font-semibold text-gray-700">
                            {skillsData.intermediateTitle}
                        </h3>
                        <div className="flex flex-wrap justify-start gap-3">
                            {skillsData.intermediate.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-md bg-white px-6 py-3 text-lg font-medium text-gray-800 border border-gray-200 transition-colors hover:bg-gray-50 cursor-pointer"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>


            </div>
        </section>
    );
};

export default Skills;
