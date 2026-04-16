import { FormEvent, useState } from "react";
import landscapeHero from "@/assets/landscape hero.jpeg";
import asamoahHero from "@/assets/asamoah.jpeg";
import { sendWaitlistNotification } from "@/lib/waitlistEmail";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await sendWaitlistNotification({ email, phone });
      
      if (response?.paymentLink) {
        window.location.href = response.paymentLink;
      } else {
        setStatus("success");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to send right now. Please try again.");
    }
  };

  return (
    <>
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black">
        {/* Top shipping strip */}
        <div className="absolute inset-x-0 top-0 z-30 border-b border-zinc-200 bg-white/95 py-2">
          <p className="flex items-center justify-center gap-2 font-body text-xs text-zinc-500 md:text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              <span className="font-extrabold text-zinc-800">Limited slots:</span> 20 slots only
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

      </section>

      <section className="bg-[#f6f6f4] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-3xl font-extrabold normal-case tracking-normal text-black md:text-4xl">
            46 GOLD COAST JERSEY
          </h2>
          <p className="mt-3 font-body text-[10px] font-medium uppercase tracking-[0.2em] text-black md:text-xs">
            JOIN THE PRE-ORDER WAITLIST
          </p>

          <form onSubmit={handleSubmit} className="mx-auto mt-16 w-full max-w-[360px] space-y-3">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="h-12 w-full rounded-md bg-black font-body text-sm font-semibold text-white transition hover:bg-black/90"
            >
              {status === "loading" ? "Submitting..." : "Sign up"}
            </button>
          </form>
          {status === "success" && (
            <p className="mt-4 text-xs font-medium text-black">Signup submitted successfully.</p>
          )}
          {status === "error" && (
            <p className="mt-4 text-xs font-medium text-red-600">
              {errorMessage || "Unable to send right now. Please try again."}
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default HeroSection;
