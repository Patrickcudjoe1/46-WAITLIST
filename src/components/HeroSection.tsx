import { ChevronLeft, ChevronRight } from "lucide-react";
import landscapeHero from "@/assets/landscape hero.jpeg";
import asamoahHero from "@/assets/asamoah.jpeg";

const HeroSection = () => {
  return (
    <>
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black">
        {/* Top shipping strip */}
        <div className="absolute inset-x-0 top-0 z-30 border-b border-zinc-200 bg-white/95 py-2">
          <p className="flex items-center justify-center gap-2 font-body text-xs text-zinc-500 md:text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              <span className="font-extrabold text-zinc-800">Limited slots:</span> only 30 people will be accepted
            </span>
          </p>
        </div>

        {/* Hero image */}
        <img
          src={asamoahHero}
          alt="June Forth hero mobile"
          className="absolute inset-0 h-full w-full object-cover md:hidden"
        />
        <img
          src={landscapeHero}
          alt="June Forth hero"
          className="absolute inset-0 hidden h-full w-full object-cover md:block"
        />

        {/* Side arrows (visual only) */}
        <button
          type="button"
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 text-white/70 transition hover:text-white md:left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label="Next"
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 text-white/70 transition hover:text-white md:right-4"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      <section className="bg-[#f6f6f4] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-3xl font-extrabold normal-case tracking-normal text-black md:text-4xl">
            Flowerboy Collection
          </h2>
          <p className="mt-3 font-body text-[10px] font-medium uppercase tracking-[0.2em] text-black md:text-xs">
            New drop coming soon, sign up to get notified when we drop 🌸
          </p>

          <form className="mx-auto mt-16 w-full max-w-[360px] space-y-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-black font-body text-sm font-semibold text-white transition hover:bg-black/90"
            >
              Sign up
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
