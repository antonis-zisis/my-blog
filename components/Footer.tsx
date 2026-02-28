import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4">
        <span className="text-xs text-(--muted-foreground)">
          Copyright © {new Date().getFullYear()} | All rights reserved.
        </span>

        <div className="flex gap-5">
          <a
            href="https://github.com/antonis-zisis"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Github link"
            className="text-(--muted-foreground) transition-colors hover:text-(--primary)"
          >
            <Github size={24} />
          </a>
          <a
            href="https://www.linkedin.com/in/antonios-zisis/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn link"
            className="text-(--muted-foreground) transition-colors hover:text-(--primary)"
          >
            <Linkedin size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
