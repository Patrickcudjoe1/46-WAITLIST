const Footer = () => (
  <footer className="bg-foreground px-6 md:px-12 lg:px-24 py-12">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <span className="font-display text-xl tracking-widest text-primary-foreground">
        BUILT DIFFERENT
      </span>
      <div className="flex gap-8">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-foreground/50 hover:text-primary-foreground font-body text-sm tracking-widest uppercase transition-colors duration-300"
        >
          Instagram
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-foreground/50 hover:text-primary-foreground font-body text-sm tracking-widest uppercase transition-colors duration-300"
        >
          Twitter
        </a>
      </div>
      <span className="text-primary-foreground/30 font-body text-xs">
        © 2026 Built Different. All rights reserved.
      </span>
    </div>
  </footer>
);

export default Footer;
