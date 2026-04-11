import { useEffect, useRef, useState } from "react";
import grid1 from "@/assets/grid-1.jpg";
import grid2 from "@/assets/grid-2.jpg";
import grid3 from "@/assets/grid-3.jpg";
import grid4 from "@/assets/grid-4.jpg";
import grid5 from "@/assets/grid-5.jpg";
import grid6 from "@/assets/grid-6.jpg";

const images = [grid1, grid2, grid3, grid4, grid5, grid6];

const SocialGrid = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-muted-foreground font-body text-xs tracking-[0.3em] uppercase block mb-4">
            @BUILTDIFFERENT
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
            Join the Community
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {images.map((src, i) => (
            <div
              key={i}
              className={`aspect-square overflow-hidden group transition-all duration-700 ${
                visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img
                src={src}
                alt={`Community photo ${i + 1}`}
                loading="lazy"
                width={640}
                height={640}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialGrid;
