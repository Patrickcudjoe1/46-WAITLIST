import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroFashion from "@/assets/hero-fashion.jpg";
import juneLogo from "@/assets/june_forth_logo.png";

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

  const avatars = [
    { src: "https://i.pravatar.cc/150?u=1", fallback: "JD" },
    { src: "https://i.pravatar.cc/150?u=2", fallback: "AS" },
    { src: "https://i.pravatar.cc/150?u=3", fallback: "MK" },
  ];

  return (
    <section className="min-h-screen bg-white flex flex-col-reverse md:grid md:grid-cols-2 overflow-hidden">
      {/* Left Column: Content */}
      <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-20 md:mb-32">
          <img 
            src={juneLogo} 
            alt="June Forth Logo" 
            className="h-10 w-auto object-contain brightness-0"
          />
        </div>

        {/* Badge */}
        <div className="mb-6">
          <Badge 
            variant="secondary" 
            className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-none px-3 py-1 font-body text-[10px] tracking-wider font-bold uppercase"
          >
            Launching Nov 24th, 2024
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-zinc-900 font-display text-4xl md:text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 max-w-xl">
          Something Big Is Coming.
        </h1>

        {/* Description */}
        <p className="text-zinc-500 font-body text-base md:text-lg mb-12 max-w-lg leading-relaxed">
          We’re building a new wave in fashion.<br />
          Be the first to know when we drop.
        </p>

        {/* Form */}
        <div className="mb-10 w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-4 w-full"
          >
            <div className="relative flex-1 w-full">
              <input
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="w-full bg-transparent border-b border-zinc-300 py-3 text-zinc-900 placeholder:text-zinc-300 font-body text-base focus:outline-none focus:border-black transition-colors"
                disabled={status === "loading"}
              />
            </div>
            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full sm:w-auto bg-black text-white hover:bg-zinc-800 px-8 py-6 rounded-lg font-body font-bold text-sm transition-all h-auto"
            >
              {status === "loading" ? "Joining..." : "Join the Waitlist"}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-destructive text-sm mt-3 font-body">{errorMsg}</p>
          )}
          {status === "success" && (
            <p className="text-green-600 text-sm mt-3 font-body">
              Successfully joined the waitlist!
            </p>
          )}
        </div>

        {/* Scarcity Note */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <p className="text-zinc-500 font-body text-xs md:text-sm">
            <span className="font-bold text-zinc-900">Limited slots:</span> only 30 people will be accepted
          </p>
        </div>
      </div>

      {/* Right Column: Image */}
      <div className="relative h-[60vh] md:h-full w-full bg-zinc-100">
        <div className="absolute inset-0 md:m-4 overflow-hidden md:rounded-3xl">
          <img
            src={heroFashion}
            alt="Fashion model wearing June Forth apparel"
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay gradient to match the screenshot's soft look */}
          <div className="absolute inset-0 bg-black/5 mix-blend-overlay" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
