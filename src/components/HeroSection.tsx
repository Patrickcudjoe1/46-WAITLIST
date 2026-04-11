import { useState } from "react";
import heroImage from "@/assets/hero-fashion.jpg";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Jersey hanging on clothesline against blue sky"
          className="w-full h-full object-cover object-center"
          width={720}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-2xl">
        <p
          className="text-primary-foreground/60 font-body text-sm tracking-[0.3em] uppercase mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.2s" }}
        >
          Exclusive Access
        </p>
        <h1
          className="text-primary-foreground font-display text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.9] mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          JUNE
          <br />
          FORTH*
        </h1>
        <p
          className="text-primary-foreground/70 font-body text-lg md:text-xl font-light mb-2 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          Coming Soon.
        </p>
        <p
          className="text-primary-foreground/50 font-body text-sm md:text-base font-light mb-10 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.7s" }}
        >
          Be the first to access our exclusive drop.
        </p>

        {/* Email form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md opacity-0 animate-fade-up"
          style={{ animationDelay: "0.9s" }}
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            className="flex-1 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-5 py-3.5 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:border-primary-foreground/50 transition-colors"
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-primary-foreground text-foreground px-8 py-3.5 font-display text-sm tracking-widest uppercase hover:bg-primary-foreground/90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center min-w-[160px]"
          >
            {status === "loading" ? (
              <span className="inline-block w-5 h-5 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              "Join Waitlist"
            )}
          </button>
        </form>

        {status === "error" && (
          <p className="text-destructive text-sm mt-3 font-body">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="text-primary-foreground/80 text-sm mt-3 font-body">
            You're on the list. We'll be in touch.
          </p>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
