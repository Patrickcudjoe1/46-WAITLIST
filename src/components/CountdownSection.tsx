import { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-05-15T00:00:00");

const CountdownSection = () => {
  const [time, setTime] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = Math.max(0, LAUNCH_DATE.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const blocks = [
    { label: "Days", value: time.days },
    { label: "Hours", value: time.hours },
    { label: "Minutes", value: time.minutes },
    { label: "Seconds", value: time.seconds },
  ];

  return (
    <section className="section-padding bg-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-primary-foreground/40 font-body text-xs tracking-[0.3em] uppercase block mb-4">
          Next Drop In
        </span>
        <div className="flex justify-center gap-6 md:gap-12">
          {blocks.map((b) => (
            <div key={b.label} className="text-center">
              <span className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground tabular-nums">
                {String(b.value).padStart(2, "0")}
              </span>
              <span className="block text-primary-foreground/40 font-body text-xs tracking-[0.2em] uppercase mt-2">
                {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CountdownSection;
