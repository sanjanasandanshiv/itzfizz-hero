"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Car from "./Car";

gsap.registerPlugin(ScrollTrigger, useGSAP);
ScrollTrigger.config({ ignoreMobileResize: true }); // no jumps when the mobile address bar moves

/* ------------------------------------------------------------------ */
/* Content and constants                                               */
/* ------------------------------------------------------------------ */

const HEADLINE = "WELCOME ITZFIZZ";

// Sample numbers: replace with your own
const STATS = [
  { value: 58, label: "faster page loads" },
  { value: 23, label: "more leads from the website" },
  { value: 40, label: "lower bounce rate on mobile" },
  { value: 96, label: "average Lighthouse performance score" },
];

// Speed streaks: length and height are relative to the car's width
const STREAKS = [
  { len: 0.8, h: 0.06 },
  { len: 0.5, h: 0.14 },
  { len: 0.9, h: 0.2 },
  { len: 0.6, h: 0.27 },
  { len: 0.35, h: 0.32 },
];

const LANE_TRAVEL = 1440; // multiple of the dash period (120px) so the loop is seamless
const FAR_TRAVEL = 240; // far skyline drifts slowest
const NEAR_TRAVEL = 520; // near skyline drifts faster (parallax)

// Seeded random (integer maths only, so server and browser render the same HTML)
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeSkyline(count, seed, minW, maxW, minH, maxH) {
  const rnd = rng(seed);
  return Array.from({ length: count }, () => ({
    w: Math.round(minW + rnd() * (maxW - minW)),
    h: Math.round(minH + rnd() * (maxH - minH)), // in vh
  }));
}

function makeStars(count, seed) {
  const rnd = rng(seed);
  return Array.from({ length: count }, () => ({
    left: Math.round((2 + rnd() * 96) * 10) / 10, // vw
    top: Math.round((3 + rnd() * 55) * 10) / 10, // vh
    size: 2 + Math.round(rnd() * 2), // px
  }));
}

const FAR = makeSkyline(60, 7, 40, 90, 8, 20);
const NEAR = makeSkyline(50, 21, 50, 110, 5, 13);
const STARS = makeStars(26, 3);

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export default function Hero() {
  const root = useRef(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---------- 1. INITIAL LOAD ANIMATION ---------- */
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

        intro
          // headline: staggered fade + rise
          .fromTo(
            ".letter",
            { autoAlpha: 0, y: 50 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.045 }
          )
          // stats: one by one, small delay between each
          .addLabel("stats", "-=0.3")
          .fromTo(
            ".stat",
            { autoAlpha: 0, y: 30 },
            { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.18 },
            "stats"
          )
          // road + car, with the sun fading in alongside
          .fromTo(".road-stage", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "-=0.4")
          .fromTo(".sky-layer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" }, "<");

        // numbers count up as each stat appears (tabular-nums keeps the width stable)
        gsap.utils.toArray(".num", root.current).forEach((el, i) => {
          const counter = { v: 0 };
          el.textContent = "0";
          intro.to(
            counter,
            {
              v: Number(el.dataset.to),
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => (el.textContent = Math.round(counter.v)),
            },
            `stats+=${i * 0.18}`
          );
        });

        // "Scroll to drive" hint appears once the intro is done, arrow bobs gently
        intro.fromTo(".hint", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, ">-0.2");
        gsap.to(".hint-arrow", { y: 6, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });

        /* ---------- 2. SCROLL-BASED ANIMATION ---------- */
        // Wheels: GSAP only animates this number; plain CSS does the rotation
        // around each wheel's own centre, so it can never drift off the arch.
        const wheels = gsap.utils.toArray(".wheel", root.current);
        const spin = { deg: 0 };

        // Measurements live in functions: GSAP re-evaluates them on resize/refresh,
        // not on every scroll event.
        const carEl = () => root.current.querySelector(".car");
        const W = () => root.current.offsetWidth;
        const carW = () => carEl().offsetWidth;
        const startX = () => W() * 0.07;
        const endX = () => W() - carW() - W() * 0.04;
        const streakLen = (i) => carW() * STREAKS[i].len;

        // Stats light up as the car passes under them.
        // Column centres (relative to the hero) are measured once per refresh, not per scroll event.
        const stats = gsap.utils.toArray(".stat", root.current);
        let centers = [];
        const measure = () => {
          const base = root.current.getBoundingClientRect().left;
          centers = stats.map((el) => {
            const r = el.getBoundingClientRect();
            return { x: r.left - base + r.width / 2, half: r.width / 2 };
          });
        };
        measure();

        const highlight = (p) => {
          const carCenter = startX() + (endX() - startX()) * p + carW() / 2;
          stats.forEach((el, i) => {
            el.classList.toggle("is-active", Math.abs(carCenter - centers[i].x) < centers[i].half);
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=200%",
            pin: true,
            scrub: 0.8, // interpolates toward the scroll position
            invalidateOnRefresh: true,
            onRefresh: measure,
          },
          onUpdate: () => highlight(tl.progress()),
        });

        tl
          // car drives with scroll progress
          .fromTo(".car-wrap", { x: () => startX() }, { x: () => endX(), duration: 1 }, 0)
          // wheels roll as it moves
          .to(
            spin,
            {
              deg: 1080,
              duration: 1,
              onUpdate: () => {
                wheels.forEach((w) => {
                  w.style.transform = `rotate(${spin.deg}deg)`;
                });
              },
            },
            0
          )
          // parallax: far skyline slow, near skyline faster, road lanes fastest
          .fromTo(".sky-far", { x: 0 }, { x: -FAR_TRAVEL, duration: 1 }, 0)
          .fromTo(".sky-near", { x: 0 }, { x: -NEAR_TRAVEL, duration: 1 }, 0)
          .fromTo(".lane", { x: 0 }, { x: -LANE_TRAVEL, duration: 1 }, 0)

          // ---- day to night ----
          .fromTo(".sun", { yPercent: 0, xPercent: 0 }, { yPercent: 240, xPercent: 30, duration: 0.55 }, 0)
          .fromTo(".sun", { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0.3)
          .fromTo(".night", { opacity: 0 }, { opacity: 0.6, duration: 0.7 }, 0.2)
          .fromTo(
            ".star",
            { opacity: 0 },
            { opacity: 0.9, duration: 0.2, stagger: { each: 0.01, from: "random" } },
            0.45
          )
          .fromTo(".moon", { yPercent: 240 }, { yPercent: 0, duration: 0.45 }, 0.5)
          .fromTo(".moon", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.5)

          // speed streaks stay attached to the car's rear and stretch out as it speeds up
          .fromTo(
            ".streak",
            { x: (i) => startX() - streakLen(i) - 6 },
            { x: (i) => endX() - streakLen(i) - 6, duration: 1 },
            0
          )
          .fromTo(".streak", { scaleX: 0.15 }, { scaleX: 1, duration: 0.25, ease: "power2.out" }, 0)
          // headlight beam swells mid-way, then settles
          .fromTo(
            ".beam",
            { opacity: 0.5, scaleX: 0.8 },
            { opacity: 1, scaleX: 1.2, duration: 0.5, repeat: 1, yoyo: true, ease: "sine.inOut" },
            0
          )
          // progress line fills along the road edge
          .fromTo(".line-fill", { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
          // car leans in mid-way, then settles
          .to(".car", { scale: 1.1, duration: 0.5, repeat: 1, yoyo: true, ease: "sine.inOut" }, 0)
          // hint fades out as soon as scrolling starts
          .to(".hint-inner", { autoAlpha: 0, duration: 0.04 }, 0)
          // finish flag unfurls as the car arrives
          .fromTo(".flag", { scaleX: 0.15 }, { scaleX: 1, duration: 0.15, ease: "power2.out" }, 0.85);
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative h-svh overflow-hidden bg-[#0c3b34] px-[5vw] pt-[10vh] text-[#f1fff8]"
    >
      {/* ---------- Sky: night tint, stars, sun, moon (behind everything) ---------- */}
      <div className="sky-layer pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="night absolute inset-0" style={{ background: "#020d0b", opacity: 0 }} />

        {STARS.map((s, i) => (
          <span
            key={i}
            className="star absolute rounded-full bg-white"
            style={{ left: `${s.left}vw`, top: `${s.top}vh`, width: s.size, height: s.size, opacity: 0 }}
          />
        ))}

        <div
          className="sun absolute rounded-full will-change-transform"
          style={{
            right: "12vw",
            top: "48vh",
            width: "clamp(64px, 8vw, 140px)",
            aspectRatio: "1",
            background: "radial-gradient(circle at 50% 50%, #fff3b0 0 35%, #ffc94a 62%, #ff9f3d 100%)",
            boxShadow: "0 0 60px 20px rgba(255,201,74,0.35)",
          }}
        />

        <div
          className="moon absolute rounded-full will-change-transform"
          style={{
            left: "16vw",
            top: "48vh",
            width: "clamp(60px, 7vw, 124px)",
            aspectRatio: "1",
            opacity: 0,
            background: "radial-gradient(circle at 35% 35%, #ffffff, #dfe9f2 55%, #b7c4d6 100%)",
            boxShadow: "0 0 50px 10px rgba(200,225,255,0.25)",
          }}
        >
          <span className="absolute rounded-full" style={{ left: "58%", top: "22%", width: "18%", height: "18%", background: "rgba(120,140,170,0.35)" }} />
          <span className="absolute rounded-full" style={{ left: "28%", top: "52%", width: "26%", height: "26%", background: "rgba(120,140,170,0.3)" }} />
          <span className="absolute rounded-full" style={{ left: "62%", top: "60%", width: "12%", height: "12%", background: "rgba(120,140,170,0.35)" }} />
        </div>
      </div>

      {/* ---------- Letter-spaced headline, spread edge to edge ---------- */}
      <h1
        aria-label="Welcome Itzfizz"
        className="relative z-10 flex w-full justify-between font-[family-name:var(--font-syne)] text-[clamp(1rem,5.2vw,6rem)] font-extrabold leading-none"
      >
        {HEADLINE.split("").map((ch, i) =>
          ch === " " ? (
            <span key={i} aria-hidden="true" className="w-[0.8em] shrink-0" />
          ) : (
            <span key={i} aria-hidden="true" className="letter inline-block">
              {ch}
            </span>
          )
        )}
      </h1>

      {/* ---------- Impact stats: Bootstrap grid (row / col-6 / col-md-3), Tailwind styling ---------- */}
      <div className="relative z-10 mt-[6vh]">
        <div className="row g-3 g-md-4">
          {STATS.map((s) => (
            <div key={s.label} className="col-6 col-md-3">
              <div className="stat group border-l border-white/25 pl-[clamp(0.6rem,1.2vw,1.2rem)] transition-colors duration-500 [&.is-active]:border-[#ffc94a]">
                <div className="transition-transform duration-500 ease-out group-[.is-active]:-translate-y-2">
                  <div className="font-[family-name:var(--font-syne)] text-[clamp(2rem,5vw,4.8rem)] font-extrabold leading-none tabular-nums">
                    <span className="num" data-to={s.value}>
                      {s.value}
                    </span>
                    <span className="text-[#ffc94a]">%</span>
                  </div>
                  <p className="mt-2 max-w-[18ch] text-[clamp(0.75rem,1.2vw,1.05rem)] text-white/70 transition-colors duration-500 group-[.is-active]:text-white">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Road: skyline, road, finish flag, streaks, car ---------- */}
      <div
        className="road-stage absolute inset-x-0 bottom-0 h-[44vh]"
        style={{ "--car": "clamp(200px, 30vw, 440px)", "--road": "16vh" }}
      >
        {/* parallax skyline: far layer */}
        <div className="sky-far absolute left-0 flex w-max items-end will-change-transform" style={{ bottom: "var(--road)" }}>
          {FAR.map((b, i) => (
            <div key={i} className="shrink-0" style={{ width: b.w, height: `${b.h}vh`, background: "#0f463e", borderRadius: "3px 3px 0 0" }} />
          ))}
        </div>

        {/* parallax skyline: near layer */}
        <div className="sky-near absolute left-0 flex w-max items-end will-change-transform" style={{ bottom: "var(--road)" }}>
          {NEAR.map((b, i) => (
            <div key={i} className="shrink-0" style={{ width: b.w, height: `${b.h}vh`, background: "#0a322c", borderRadius: "3px 3px 0 0" }} />
          ))}
        </div>

        {/* road surface */}
        <div
          className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-[#082d27]"
          style={{ height: "var(--road)" }}
        >
          <div className="line-fill absolute left-0 top-0 h-[3px] w-full bg-[#ffc94a]" style={{ transformOrigin: "left center" }} />
          {/* moving lane marks */}
          <div
            className="lane absolute left-0 top-1/2 h-[4px] will-change-transform"
            style={{
              width: `calc(100% + ${LANE_TRAVEL}px)`,
              background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 60px, transparent 60px 120px)",
            }}
          />
        </div>

        {/* finish pole + checkered flag */}
        <div
          className="finish absolute"
          style={{ right: "5.5vw", bottom: "calc(var(--road) - 1.4vh)", height: "calc(var(--car) * 0.5)" }}
        >
          <div className="h-full w-[3px] bg-white/70" />
          <div
            className="flag absolute left-[3px] top-0 will-change-transform"
            style={{
              width: "clamp(18px, 3.2vw, 64px)",
              height: "clamp(14px, 2.2vw, 40px)",
              transformOrigin: "left center",
              background: "repeating-conic-gradient(#fff 0 25%, #0a1f1b 0 50%) 0 0 / 12px 12px",
            }}
          />
        </div>

        {/* speed streaks (behind the car) */}
        {STREAKS.map((s, i) => (
          <div
            key={i}
            className="streak absolute left-0 rounded-full will-change-transform"
            style={{
              bottom: `calc(var(--road) - 1.4vh + var(--car) * ${s.h})`,
              width: `calc(var(--car) * ${s.len})`,
              height: "3px",
              transformOrigin: "right center",
              opacity: 0.95 - i * 0.1,
              background: "linear-gradient(90deg, rgba(127,240,208,0), rgba(127,240,208,0.95))",
            }}
          />
        ))}

        {/* car */}
        <div className="car-wrap absolute left-0 will-change-transform" style={{ bottom: "calc(var(--road) - 1.4vh)" }}>
          <div className="car relative will-change-transform" style={{ width: "var(--car)", transformOrigin: "50% 100%" }}>
            {/* headlight beam */}
            <div
              className="beam pointer-events-none absolute will-change-transform"
              style={{
                left: "96%",
                top: "calc(58% - var(--car) * 0.15)",
                width: "calc(var(--car) * 0.65)",
                height: "calc(var(--car) * 0.3)",
                transformOrigin: "left center",
                background: "linear-gradient(90deg, rgba(255,214,140,0.55), rgba(255,214,140,0))",
                clipPath: "polygon(0 42%, 100% 0, 100% 100%, 0 58%)",
              }}
            />
            <Car />
          </div>
        </div>
      </div>

      {/* ---------- "Scroll to drive" hint ---------- */}
      <div className="hint pointer-events-none absolute inset-x-0 bottom-[2.2vh] z-10 flex justify-center">
        <div className="hint-inner flex flex-col items-center gap-1 text-[0.7rem] uppercase tracking-[0.3em] text-white/70">
          <span>Scroll to drive</span>
          <svg className="hint-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 4l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}