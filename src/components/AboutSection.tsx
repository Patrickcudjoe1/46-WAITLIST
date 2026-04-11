import { useEffect, useRef, useState } from "react";

const AboutSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-card">
      <div className="max-w-4xl mx-auto text-center">
        <span
          className={`text-muted-foreground font-body text-xs tracking-[0.3em] uppercase block mb-8 transition-all duration-700 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          Our Story
        </span>
        <p
          className={`font-display text-3xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          We create timeless pieces that blend street culture with luxury design.
        </p>
        <p
          className={`text-muted-foreground font-body text-base md:text-lg mt-8 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "400ms" }}
        >
          Every drop is intentional, limited, and made to stand out. This isn't fast fashion — it's a statement.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;
