"use client";

/**
 * Client Component wrapper for <img> that hides the element on load error.
 * Use this in Server Components where onError event handlers are not allowed.
 */
export function SafeImg({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
