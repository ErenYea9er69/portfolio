"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface FlipAvatarProps {
  src: string;
  hoverSrc: string;
  alt: string;
  fallback: string;
}

export function FlipAvatar({ src, hoverSrc, alt, fallback }: FlipAvatarProps) {
  const [flipped, setFlipped] = useState(false);
  const [shouldLoadBack, setShouldLoadBack] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(() => setShouldLoadBack(true), { timeout: 3500 });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => setShouldLoadBack(true), 2000);
      return () => clearTimeout(id);
    }
  }, []);

  const handleInteraction = () => {
    setShouldLoadBack(true);
    setFlipped((prev) => !prev);
  };

  return (
    <div
      className="size-28 [perspective:600px] cursor-pointer"
      onMouseEnter={() => {
        setShouldLoadBack(true);
        setFlipped(true);
      }}
      onMouseLeave={() => setFlipped(false)}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      aria-label="Toggle profile picture"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleInteraction();
        }
      }}
    >
      <div
        className="relative size-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div className="absolute inset-0 size-28 rounded-full overflow-hidden [backface-visibility:hidden] bg-muted">
          <Image
            alt={alt}
            src={src}
            width={112}
            height={112}
            priority
            sizes="112px"
            quality={85}
            className="aspect-square size-full object-cover"
          />
        </div>

        {/* Back */}
        <div className="absolute inset-0 size-28 rounded-full overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] bg-muted">
          {shouldLoadBack ? (
            <Image
              alt={`${alt} alternate`}
              src={hoverSrc}
              width={112}
              height={112}
              sizes="112px"
              quality={85}
              className="aspect-square size-full object-cover"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
