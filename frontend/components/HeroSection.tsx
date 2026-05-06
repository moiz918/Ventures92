// Server Component — the search form uses native HTML GET, no client JS needed.

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#99907e',
  display: 'block',
  marginBottom: '8px',
};

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#16130d',
  border: '1px solid #4d4637',
  color: '#e9e1d7',
  fontFamily: 'var(--font-manrope)',
  fontSize: '14px',
  padding: '11px 14px',
  outline: 'none',
};

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col justify-center overflow-hidden"
      style={{
        minHeight: '92vh',
        background: `
          radial-gradient(ellipse 80% 70% at 75% 40%, rgba(201,168,76,0.07) 0%, transparent 100%),
          linear-gradient(180deg, #100e08 0%, #16130d 60%, #221f19 100%)
        `,
      }}
    >
      {/* Architectural grid lines */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
        }}
      />

      {/* Gold vertical accent line */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{
          left: '64px',
          width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.35) 30%, rgba(201,168,76,0.35) 70%, transparent)',
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 mx-auto w-full"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '120px',
        }}
      >
        <div style={{ maxWidth: '680px' }} className="flex flex-col gap-7">
          {/* Tag */}
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}
          >
            Verified Real Estate · Direct from the Developer
          </span>

          {/* Display headline */}
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(44px, 5.5vw, 80px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: 0,
            }}
          >
            Heritage-Grade
            <br />
            <span style={{ color: '#C9A84C' }}>Real Estate</span>
            <br />
            Excellence
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '16px',
              lineHeight: 1.75,
              color: '#d0c5b2',
              maxWidth: '520px',
              margin: 0,
            }}
          >
            Discover unparalleled living spaces designed for architectural precision
            and absolute reliability — Pakistan&apos;s premier destination for
            exclusive developments.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/properties"
              style={{
                display: 'inline-block',
                backgroundColor: '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '16px 36px',
                textDecoration: 'none',
              }}
            >
              Browse Properties
            </a>
            <a
              href="/projects"
              style={{
                display: 'inline-block',
                border: '2px solid #C9A84C',
                color: '#C9A84C',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '14px 36px',
                textDecoration: 'none',
              }}
            >
              View Projects
            </a>
          </div>
        </div>

        {/* ── Quick Search Bar ─────────────────────────────────────────── */}
        <div
          className="mt-20"
          style={{
            backgroundColor: '#1e1b15',
            border: '1px solid #4d4637',
            borderLeft: '4px solid #C9A84C',
            padding: '28px 28px',
            maxWidth: '860px',
          }}
        >
          {/* Bar label */}
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              marginBottom: '18px',
            }}
          >
            Quick Search
          </p>

          {/* Native GET form — works without JavaScript */}
          <form
            method="GET"
            action="/properties"
            className="flex flex-col sm:flex-row items-end gap-3"
          >
            {/* Location */}
            <div style={{ flex: 1, minWidth: '160px' }}>
              <label htmlFor="hs-location" style={LABEL_STYLE}>
                Location
              </label>
              <input
                id="hs-location"
                name="q"
                type="text"
                placeholder="DHA, Gulberg, Bahria…"
                autoComplete="off"
                style={INPUT_STYLE}
              />
            </div>

            {/* Property type */}
            <div style={{ width: '170px' }}>
              <label htmlFor="hs-type" style={LABEL_STYLE}>
                Type
              </label>
              <select
                id="hs-type"
                name="property_type"
                style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">All Types</option>
                <option value="RESIDENTIAL">Residential</option>
                <option value="COMMERCIAL">Commercial</option>
              </select>
            </div>

            {/* Budget */}
            <div style={{ width: '200px' }}>
              <label htmlFor="hs-budget" style={LABEL_STYLE}>
                Budget
              </label>
              <select
                id="hs-budget"
                name="budget"
                style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none' }}
              >
                <option value="">Any Budget</option>
                <option value="u50m">Under 50M PKR</option>
                <option value="50m-150m">50M – 150M PKR</option>
                <option value="150m-plus">150M+ PKR</option>
              </select>
            </div>

            {/* Search */}
            <button
              type="submit"
              style={{
                backgroundColor: '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '12px 28px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
