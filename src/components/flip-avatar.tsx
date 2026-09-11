"use client";

import { useState } from "react";
import Image from "next/image";

interface FlipAvatarProps {
  src: string;
  hoverSrc: string;
  alt: string;
  fallback: string;
}

export function FlipAvatar({ src, hoverSrc, alt, fallback }: FlipAvatarProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="size-28 [perspective:600px] cursor-pointer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={() => setFlipped((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-label="Toggle profile picture"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((prev) => !prev);
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
          <Image
            alt={`${alt} alternate`}
            src={hoverSrc}
            width={112}
            height={112}
            sizes="112px"
            quality={85}
            className="aspect-square size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
