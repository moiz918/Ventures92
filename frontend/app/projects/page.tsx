import type { Metadata } from 'next';
import { getProjects, type ProjectStatus } from '@/services/projectService';
import ProjectCard from '@/components/ProjectCard';

export const metadata: Metadata = {
  title: 'Developments',
  description:
    'Explore our exclusive residential and commercial developments across Pakistan's most prestigious addresses.',
};

// ── Status filter tabs ────────────────────────────────────────────────────────
const FILTERS: { value: ProjectStatus | null; label: string }[] = [
  { value: null,               label: 'All Developments'   },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'COMPLETED',         label: 'Delivered'           },
  { value: 'PLANNED',           label: 'Upcoming'            },
];

// ── Stats: computed from project list ─────────────────────────────────────────
function StatStrip({ counts }: { counts: Record<string, number> }) {
  const items = [
    { value: counts.total,         label: 'Total Projects'      },
    { value: counts.underConstruction, label: 'Under Construction' },
    { value: counts.completed,     label: 'Delivered'           },
    { value: counts.planned,       label: 'Upcoming'            },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: '1px',
        backgroundColor: '#4d4637',
        borderTop: '1px solid #4d4637',
        borderBottom: '1px solid #4d4637',
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            flex: 1,
            backgroundColor: '#1e1b15',
            padding: '18px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '28px',
              fontWeight: 700,
              color: '#C9A84C',
              margin: '0 0 2px',
              lineHeight: 1,
            }}
          >
            {it.value}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4d4637',
              margin: 0,
            }}
          >
            {it.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProjectsPage() {
  let projects = await getProjects().catch(() => null);

  const loadError = projects === null;
  if (!projects) projects = [];

  const counts = {
    total:             projects.length,
    underConstruction: projects.filter((p) => p.status === 'UNDER_CONSTRUCTION').length,
    completed:         projects.filter((p) => p.status === 'COMPLETED').length,
    planned:           projects.filter((p) => p.status === 'PLANNED').length,
  };

  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Hero header ────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#1e1b15',
          borderBottom: '1px solid #4d4637',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Architectural grid overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Gold accent — left edge */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            background: 'linear-gradient(to bottom, transparent 0%, #C9A84C 40%, transparent 100%)',
            opacity: 0.5,
          }}
        />

        <div
          className="mx-auto"
          style={{
            maxWidth: '1600px',
            paddingInline: '64px',
            paddingBlock: '60px',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A84C',
              display: 'block',
              marginBottom: '14px',
            }}
          >
            Portfolio
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(36px, 4.5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              lineHeight: 1.02,
              margin: '0 0 18px',
            }}
          >
            Exclusive<br />
            <span style={{ color: '#C9A84C' }}>Developments</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '15px',
              lineHeight: 1.8,
              color: '#99907e',
              margin: 0,
              maxWidth: '520px',
            }}
          >
            Architecturally distinguished residential and commercial projects
            crafted for permanence — across Pakistan's most sought-after addresses.
          </p>
        </div>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────── */}
      <StatStrip counts={counts} />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{ maxWidth: '1600px', paddingInline: '64px', paddingBlock: '64px' }}
      >
        {loadError ? (
          <ErrorState />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Section label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '40px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#4d4637',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </p>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
            </div>

            {/* Project grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '24px',
              }}
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom CTA band ─────────────────────────────────────── */}
      {!loadError && projects.length > 0 && (
        <div
          style={{
            backgroundColor: '#1e1b15',
            borderTop: '1px solid #4d4637',
          }}
        >
          <div
            className="mx-auto"
            style={{
              maxWidth: '1600px',
              paddingInline: '64px',
              paddingBlock: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '32px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-epilogue)',
                  fontSize: '22px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#e9e1d7',
                  margin: '0 0 6px',
                }}
              >
                Interested in a Development?
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '13px',
                  color: '#99907e',
                  margin: 0,
                }}
              >
                Speak with our specialists to secure your unit early.
              </p>
            </div>
            <a
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Enquire Now
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── State components ──────────────────────────────────────────────────────────
function ErrorState() {
  return (
    <div
      style={{
        border: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
        padding: '64px 48px',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '13px',
          color: '#99907e',
          margin: '0 0 20px',
        }}
      >
        Unable to load developments at this time.
      </p>
      <a
        href="/contact"
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          textDecoration: 'none',
        }}
      >
        Contact Our Team →
      </a>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        border: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
        padding: '80px 48px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '13px',
          color: '#4d4637',
          margin: 0,
        }}
      >
        No developments listed yet — check back soon.
      </p>
    </div>
  );
}
