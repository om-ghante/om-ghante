"use client";

import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import content from "../data/content.json";

const Contact = () => {
    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-20 text-center">
            {/* Title Banner */}
            <div className="w-full bg-white py-4 mb-12">
                <div className="mx-auto w-full max-w-4xl px-6 md:px-12 lg:px-24">
                    <h2 className="text-center text-4xl font-bold tracking-tight md:text-5xl text-gray-900 flex items-center justify-center gap-4">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-30"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.6)]"></span>
                        </span>
                        {content.contact.title}
                    </h2>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-6 md:px-12 lg:px-24">
                <div className="flex flex-col items-center">
                    <p className="mb-6 max-w-2xl text-center text-xl text-gray-600">
                        {content.contact.description}
                    </p>

                    <Link
                        href={content.hero.socialLinks.email}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-base font-bold text-white transition-transform hover:-translate-y-1"
                    >
                        <Mail size={16} strokeWidth={1.5} />
                        {content.contact.emailText}
                    </Link>

                    {/* Social Links for easy access */}
                    <div className="mt-8 flex justify-center gap-8 text-sky-600">
                        <Link
                            href={content.hero.socialLinks.github}
                            target="_blank"
                            className="transition-colors hover:text-black"
                            aria-label="GitHub"
                        >
                            <Github size={20} strokeWidth={1.5} />
                        </Link>
                        <Link
                            href={content.hero.socialLinks.linkedin}
                            target="_blank"
                            className="transition-colors hover:text-[#0077b5]"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} strokeWidth={1.5} />
                        </Link>
                        <Link
                            href={content.hero.socialLinks.twitter}
                            target="_blank"
                            className="transition-colors hover:text-black"
                            aria-label="Twitter"
                        >
                            <Twitter size={20} strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
