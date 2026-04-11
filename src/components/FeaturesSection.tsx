import { useEffect, useRef, useState } from "react";

const features = [
  {
    title: "Premium Quality",
    subtitle: "Materials",
    description: "Sourced from the finest mills. Every thread is intentional.",
  },
  {
    title: "Limited Edition",
    subtitle: "Drops",
    description: "Small batches. Once they're gone, they're gone.",
  },
  {
    title: "Designed for",
    subtitle: "Culture",
    description: "Where streetwear meets luxury. Made for those who move different.",
  },
];

const FeaturesSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className={`border-t border-foreground/10 pt-8 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              <span className="text-muted-foreground font-body text-xs tracking-[0.3em] uppercase">
                0{i + 1}
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-semibold text-foreground mt-4 leading-tight">
                {f.title}
                <br />
                <span className="text-muted-foreground">{f.subtitle}</span>
              </h3>
              <p className="text-muted-foreground font-body text-sm mt-4 leading-relaxed max-w-xs">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
