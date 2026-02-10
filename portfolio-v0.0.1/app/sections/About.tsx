"use client";

import content from "../data/content.json";

const About = () => {
    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-20 text-gray-900">
            {/* Title Banner */}
            <div className="w-full bg-white py-4 mb-12">
                <div className="mx-auto w-full max-w-4xl text-center px-6 md:px-12 lg:px-24">
                    <h2 className="text-center text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 flex items-center justify-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]"></span>
                        </span>
                        {content.about.title}
                    </h2>
                </div>
            </div>

            <div className="mx-auto max-w-4xl text-center px-6 md:px-12 lg:px-24">
                <div
                    className="mx-auto max-w-2xl text-center text-xl leading-relaxed text-gray-700"
                    dangerouslySetInnerHTML={{ __html: content.about.description }}
                />
            </div>
        </section>
    );
};

export default About;
