import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import Work from "@/components/Work";
import About from "@/components/About";
import Process from "@/components/Process";
import Contact from "@/components/Contact";
import { projects } from "@/data/content";

// Projects come from src/data/content.ts. When you outgrow that, make this component async and
// fetch them from a CMS: <Work/> only needs the Project[] prop.
export default function Page() {
  return (
    <>
      <main id="main">
        <Hero />
        <Statement />
        <Work projects={projects} />
        <About />
        <Process />
      </main>
      <Contact />
    </>
  );
}
