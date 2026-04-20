import { FormEvent, useState } from "react";
import landscapeHero from "@/assets/landscape hero.jpeg";
import asamoahHero from "@/assets/asamoah.jpeg";
import { sendWaitlistNotification } from "@/lib/waitlistEmail";

const HeroSection = () => {
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      console.log(">>> Submitting waitlist form with endpoint:", import.meta.env.VITE_WAITLIST_WEBHOOK_URL || "/api/waitlist");
      const response = await sendWaitlistNotification({ 
        name, 
        size, 
        location, 
        quantity: parseInt(quantity, 10), 
        email, 
        phone 
      });
      
      if (response?.paymentLink) {
        console.log(">>> Success! Redirecting to Paystack:", response.paymentLink);
        window.location.href = response.paymentLink;
      } else {
        console.log(">>> Success! Status:", status);
        setStatus("success");
        setName("");
        setSize("");
        setQuantity("1");
        setLocation("");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      console.error(">>> Waitlist submission failed:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Unable to send right now. Please try again.");
    }
  };

  return (
    <>
      <section className="flex h-screen min-h-[640px] flex-col w-full overflow-hidden bg-black">
        {/* Top shipping strip */}
        <div className="z-30 border-b border-zinc-200 bg-white/95 py-2">
          <p className="flex items-center justify-center gap-2 font-body text-xs text-zinc-500 md:text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>
              <span className="font-extrabold text-zinc-800">Limited slots:</span> 20 slots only
            </span>
          </p>
        </div>

        {/* Hero image */}
        <div className="relative flex-1">
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
        </div>
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
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <select
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  required
                  className="appearance-none h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black focus:outline-none"
                >
                  <option value="" disabled hidden className="text-black/60">
                    Select Size
                  </option>
                  <option value="XS">XS</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg className="h-4 w-4 fill-current text-black" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                required
                className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Delivery Location (e.g. East Legon)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
              className="h-11 w-full border border-black bg-transparent px-3 font-body text-sm text-black placeholder:text-black/60 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email Address"
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
