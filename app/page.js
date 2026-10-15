import Hero from "@/components/Hero";
import SmoothScroll from "@/components/SmoothScroll";

export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <Hero />
      <section className="grid min-h-svh place-items-center bg-[#061f1b] p-8 text-center font-[family-name:var(--font-syne)] text-[clamp(1.5rem,4vw,3rem)] text-[#f1fff8]">
        Built for speed. Built for people.
      </section>
    </main>
  );
}