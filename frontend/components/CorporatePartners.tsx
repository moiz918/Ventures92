import { getPartners, type Partner } from '@/services/partnerService';
import { SafeImage } from '@/components/SafeImage';

// ── Premium text fallback (used when logo missing or fails to load) ──────────
function PartnerTextMark({ name }: { name: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-manrope)',
        fontSize: '13px',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#99907e',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        // subtle gold underline accent on hover via parent
      }}
    >
      {name}
    </span>
  );
}

// ── Single partner tile ───────────────────────────────────────────────────────
function PartnerTile({ partner }: { partner: Partner }) {
  const inner = (
    <SafeImage
      src={partner.logo_url}
      alt={partner.name}
      fallback={<PartnerTextMark name={partner.name} />}
      style={{
        maxHeight: '40px',
        maxWidth: '140px',
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)',
        opacity: 0.45,
      }}
    />
  );

  return partner.website_url ? (
    <a
      href={partner.website_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        flexShrink: 0,
        textDecoration: 'none',
        opacity: 1,
        transition: 'opacity 0.2s',
      }}
    >
      {inner}
    </a>
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        flexShrink: 0,
      }}
    >
      {inner}
    </div>
  );
}

// ── Main section ─────────────────────────────────────────────────────────────
export default async function CorporatePartners() {
  const partners = await getPartners().catch(() => [] as Partner[]);

  if (partners.length === 0) return null;

  // Duplicate for seamless CSS loop
  const doubled = [...partners, ...partners];

  return (
    <section
      style={{
        backgroundColor: '#100e08',
        borderTop: '1px solid #4d4637',
        borderBottom: '1px solid #4d4637',
        paddingBlock: '48px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          marginBottom: '36px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#4d4637',
            whiteSpace: 'nowrap',
          }}
        >
          Trusted By
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#2d2a23' }} />
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '11px',
            color: '#4d4637',
            whiteSpace: 'nowrap',
          }}
        >
          {partners.length} Corporate {partners.length === 1 ? 'Partner' : 'Partners'}
        </span>
      </div>

      {/* Marquee track */}
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fade edges */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '120px',
            background: 'linear-gradient(to right, #100e08 0%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '120px',
            background: 'linear-gradient(to left, #100e08 0%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Scrolling row — doubled list enables seamless loop */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '64px',
            width: 'max-content',
            animation: 'marquee 40s linear infinite',
          }}
        >
          {doubled.map((partner, i) => (
            <PartnerTile key={`${partner.id}-${i}`} partner={partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
