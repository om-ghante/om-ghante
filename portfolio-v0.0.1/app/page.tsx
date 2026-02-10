"use client";
import { ReactLenis } from "@studio-freight/react-lenis";
import Hero from "./sections/Hero";
import ExperienceEducation from "./sections/ExperienceEducation";
import Projects from "./sections/Projects";
import Skills from "./sections/Skills";
import About from "./sections/About";
import Contact from "./sections/Contact";

import ParticleNetwork from "./components/ParticleNetwork";

export default function Home() {
  return (
    <ReactLenis root>
      <main className="relative flex min-h-screen flex-col">
        <ParticleNetwork />

        {/* Sections Wrapper - Standard Scroll to allow transparency without overlap */}
        <div className="relative w-full z-10">
          <div className="min-h-screen w-full bg-transparent">
            <Hero />
          </div>

          <div className="min-h-screen w-full bg-transparent">
            <ExperienceEducation />
          </div>

          <div className="min-h-screen w-full bg-transparent">
            <Projects />
          </div>

          <div className="min-h-screen w-full bg-transparent">
            <Skills />
          </div>

          <div className="min-h-screen w-full bg-transparent">
            <About />
          </div>

          <div className="min-h-screen w-full bg-transparent">
            <Contact />
          </div>
        </div>
      </main>
    </ReactLenis>
  );
}
