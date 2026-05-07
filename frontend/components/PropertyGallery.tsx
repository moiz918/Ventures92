'use client';

import { useState, useCallback } from 'react';
import type { PropertyMedia, PropertyCategory } from '@/services/propertyService';
import { SafeImage } from '@/components/SafeImage';

// ── Per-category gradient (mirrors PropertyCard) ────────────────────────────
const GRADIENTS: Record<string, string> = {
  HOUSE:     'linear-gradient(145deg, #2d2a23 0%, #1e1b15 100%)',
  APARTMENT: 'linear-gradient(145deg, #221f19 0%, #16130d 100%)',
  PLOT:      'linear-gradient(145deg, #38342d 0%, #221f19 100%)',
  OFFICE:    'linear-gradient(145deg, #1e1b15 0%, #100e08 100%)',
  SHOP:      'linear-gradient(145deg, #2d2a23 0%, #16130d 100%)',
};

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  media: PropertyMedia[];
  title: string;
  category: PropertyCategory;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PropertyGallery({ media, title, category }: Props) {
  // Sort: primary first, then ascending sort_order
  const sorted = [...media].sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.sort_order - b.sort_order;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const active = sorted[activeIdx];
  const total  = sorted.length;

  const prev = useCallback(() => setActiveIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setActiveIdx((i) => Math.min(total - 1, i + 1)), [total]);

  // ── No media: architectural gradient placeholder ─────────────────────────
  if (total === 0) {
    return (
      <div
        style={{
          aspectRatio: '16 / 9',
          background: GRADIENTS[category] ?? GRADIENTS.HOUSE,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.12 }}>
          <rect x="4" y="4" width="56" height="56" stroke="#C9A84C" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="6" stroke="#C9A84C" strokeWidth="1.5" />
          <path d="M4 44l18-18 12 12 8-8 18 18" stroke="#C9A84C" strokeWidth="1.5" />
        </svg>
        <span
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#4d4637',
          }}
        >
          No Images Available
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* ── Hero image ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          backgroundColor: '#2d2a23',
        }}
      >
        <SafeImage
          key={active.id}
          src={active.media_url}
          alt={`${title} — photo ${activeIdx + 1} of ${total}`}
          fallback={<HeroFallback category={category} />}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Bottom gradient scrim */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(16,14,8,0.6) 0%, transparent 40%)',
            pointerEvents: 'none',
          }}
        />

        {/* Photo counter — bottom right */}
        <span
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: '#e9e1d7',
            backgroundColor: 'rgba(16,14,8,0.75)',
            border: '1px solid #4d4637',
            padding: '5px 12px',
          }}
        >
          {activeIdx + 1} / {total}
        </span>

        {/* Primary badge — top left */}
        {active.is_primary && (
          <span
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: '#C9A84C',
              padding: '4px 10px',
            }}
          >
            Primary Photo
          </span>
        )}

        {/* Prev / Next arrows (only when > 1 image) */}
        {total > 1 && (
          <>
            <NavButton direction="prev" disabled={activeIdx === 0} onClick={prev} />
            <NavButton direction="next" disabled={activeIdx === total - 1} onClick={next} />
          </>
        )}
      </div>

      {/* ── Thumbnail strip ──────────────────────────────────────────────── */}
      {total > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'thin',
          }}
        >
          {sorted.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setActiveIdx(i)}
              aria-label={`View photo ${i + 1}`}
              style={{
                flexShrink: 0,
                width: '112px',
                height: '72px',
                padding: 0,
                border: i === activeIdx
                  ? '2px solid #C9A84C'
                  : '2px solid transparent',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: '#2d2a23',
                outline: 'none',
                opacity: i === activeIdx ? 1 : 0.6,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              <SafeImage
                src={m.media_url}
                alt=""
                fallback={<ThumbnailFallback />}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Image fallback (broken / missing media URL) ──────────────────────────────
function HeroFallback({ category }: { category: PropertyCategory }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: GRADIENTS[category] ?? GRADIENTS.HOUSE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg width="56" height="56" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.18 }} aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" stroke="#C9A84C" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="6" stroke="#C9A84C" strokeWidth="1.5" />
        <path d="M4 44l18-18 12 12 8-8 18 18" stroke="#C9A84C" strokeWidth="1.5" />
      </svg>
      <span
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#4d4637',
        }}
      >
        Image Unavailable
      </span>
    </div>
  );
}

function ThumbnailFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(145deg, #2d2a23 0%, #1e1b15 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.3 }} aria-hidden="true">
        <rect x="1" y="2" width="14" height="11" stroke="#C9A84C" strokeWidth="1" />
        <circle cx="5" cy="6" r="1.25" stroke="#C9A84C" strokeWidth="1" />
        <path d="M1 11l4-4 4 4 2-2 4 4" stroke="#C9A84C" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ── Nav arrow button ─────────────────────────────────────────────────────────
function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === 'prev';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Previous photo' : 'Next photo'}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [isPrev ? 'left' : 'right']: '16px',
        width: '40px',
        height: '40px',
        backgroundColor: disabled ? 'rgba(16,14,8,0.4)' : 'rgba(16,14,8,0.75)',
        border: `1px solid ${disabled ? '#2d2a23' : '#C9A84C'}`,
        color: disabled ? '#4d4637' : '#C9A84C',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.15s',
        padding: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        {isPrev
          ? <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M6 3l5 5-5 5"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </button>
  );
}
