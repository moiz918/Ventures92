'use client';

import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';

/**
 * Renders <img> with a graceful fallback when:
 *   - `src` is empty/undefined
 *   - the network request fails (404, CORS, etc.)
 *   - the resource decodes as a non-image (broken file)
 *
 * Used everywhere user-supplied / seeded image URLs are displayed
 * (CorporatePartners logos, property galleries, property card hero images).
 */

interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string | null | undefined;
  alt: string;
  /** Rendered when the image is missing or fails to load. */
  fallback: ReactNode;
}

export function SafeImage({ src, alt, fallback, ...rest }: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
