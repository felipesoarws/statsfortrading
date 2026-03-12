"use client";

import Image from "next/image";

/**
 * Client Component wrapper for <img> that hides the element on load error.
 * Use this in Server Components where onError event handlers are not allowed.
 */
export function SafeImg({
  src,
  alt = "",
  className,
  width = 16,
  height = 16
}: {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      unoptimized={true}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
