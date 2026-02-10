import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";
import content from "../data/content.json";

const Hero = () => {
    const { hero } = content;

    return (
        <section className="flex min-h-screen w-full flex-col justify-center py-0">
            {/* Name Section */}
            <div className="w-full bg-white px-6 md:px-12 lg:px-24">
                <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center md:items-start md:text-left">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                        {hero.name}
                    </h1>
                </div>
            </div>

            {/* Full Width Roles Banner */}
            <div className="w-full bg-white py-2">
                <div className="w-full px-6 md:px-12 lg:px-24">
                    <div className="mx-auto w-full max-w-5xl">
                        <div className="flex flex-wrap justify-center gap-4 text-base font-bold text-sky-600 md:justify-start md:text-xl uppercase tracking-wider">
                            {hero.roles.map((role, index) => (
                                <div key={role} className="flex items-center gap-3">
                                    <span>{role}</span>
                                    {index < hero.roles.length - 1 && (
                                        <span className="hidden md:inline text-sky-800">•</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Description & Socials */}
            <div className="w-full px-6 md:px-12 lg:px-24">
                <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center md:items-start md:text-left">
                    <p className="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl leading-relaxed">
                        {hero.description}
                    </p>

                    <div className="flex gap-6">
                        <Link
                            href={hero.socialLinks.github}
                            target="_blank"
                            className="text-sky-600 transition-colors hover:text-black"
                            aria-label="GitHub"
                        >
                            <Github size={24} strokeWidth={1.5} />
                        </Link>
                        <Link
                            href={hero.socialLinks.linkedin}
                            target="_blank"
                            className="text-sky-600 transition-colors hover:text-[#0077b5]"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={24} strokeWidth={1.5} />
                        </Link>
                        <Link
                            href={hero.socialLinks.twitter}
                            target="_blank"
                            className="text-sky-600 transition-colors hover:text-black"
                            aria-label="Twitter"
                        >
                            <Twitter size={24} strokeWidth={1.5} />
                        </Link>
                        <Link
                            href={hero.socialLinks.email}
                            className="text-sky-600 transition-colors hover:text-red-500"
                            aria-label="Email"
                        >
                            <Mail size={24} strokeWidth={1.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
