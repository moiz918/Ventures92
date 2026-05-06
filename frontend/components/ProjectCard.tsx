import Link from 'next/link';
import { type Project, type ProjectStatus } from '@/services/projectService';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; borderColor: string }> = {
  PLANNED:           { label: 'Upcoming',          color: '#99907e', borderColor: '#4d4637'  },
  UNDER_CONSTRUCTION:{ label: 'Under Construction', color: '#E8A020', borderColor: '#E8A020' },
  COMPLETED:         { label: 'Delivered',          color: '#1D9E75', borderColor: '#1D9E75' },
};

// ── Gradient placeholders ─────────────────────────────────────────────────────
const GRADIENTS: Record<ProjectStatus, string> = {
  PLANNED:            'linear-gradient(145deg, #1e1b15 0%, #221f19 60%, #2d2a23 100%)',
  UNDER_CONSTRUCTION: 'linear-gradient(145deg, #1e1408 0%, #241a0e 60%, #2d1e0a 100%)',
  COMPLETED:          'linear-gradient(145deg, #0d1614 0%, #0e1c16 60%, #0f2018 100%)',
};

// ── Building silhouette SVG ───────────────────────────────────────────────────
function BuildingWatermark() {
  return (
    <svg
      width="120"
      height="100"
      viewBox="0 0 120 100"
      fill="currentColor"
      aria-hidden="true"
      style={{ opacity: 0.07, color: '#C9A84C' }}
    >
      <rect x="10" y="35" width="20" height="65" />
      <rect x="35" y="20" width="50" height="80" />
      <rect x="42" y="8"  width="12" height="92" />
      <rect x="57" y="8"  width="12" height="92" />
      <rect x="90" y="42" width="20" height="58" />
      <rect x="10" y="85" width="100" height="15" />
      {/* Windows */}
      <rect x="40" y="28" width="6" height="6" style={{ opacity: 0.6 }} />
      <rect x="52" y="28" width="6" height="6" style={{ opacity: 0.6 }} />
      <rect x="64" y="28" width="6" height="6" style={{ opacity: 0.6 }} />
      <rect x="76" y="28" width="6" height="6" style={{ opacity: 0.6 }} />
      <rect x="40" y="42" width="6" height="6" style={{ opacity: 0.4 }} />
      <rect x="52" y="42" width="6" height="6" style={{ opacity: 0.4 }} />
      <rect x="64" y="42" width="6" height="6" style={{ opacity: 0.4 }} />
      <rect x="76" y="42" width="6" height="6" style={{ opacity: 0.4 }} />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ProjectCard({ project }: { project: Project }) {
  const s = STATUS_CONFIG[project.status];
  const gradient = GRADIENTS[project.status];

  return (
    <Link
      href={`/projects/${project.slug}`}
      style={{ display: 'block', textDecoration: 'none' }}
      className="project-card-link"
    >
      <article
        style={{
          backgroundColor: '#1e1b15',
          border: '1px solid #4d4637',
          overflow: 'hidden',
          transition: 'border-color 0.2s',
        }}
        className="project-card"
      >
        {/* ── Image / placeholder area ──────────────────────── */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16 / 9',
            background: gradient,
            overflow: 'hidden',
          }}
        >
          {/* Grid overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), ' +
                'linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {/* Diagonal accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(201,168,76,0.04) 0%, transparent 50%)',
            }}
          />

          {/* Centred building mark */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BuildingWatermark />
          </div>

          {/* Gold left accent bar */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: '20%',
              bottom: '20%',
              width: '2px',
              background: `linear-gradient(to bottom, transparent, ${s.borderColor}, transparent)`,
              opacity: 0.5,
            }}
          />

          {/* Status badge */}
          <span
            style={{
              position: 'absolute',
              top: '14px',
              left: '14px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: s.color,
              border: `1px solid ${s.borderColor}`,
              backgroundColor: 'rgba(16,14,8,0.75)',
              backdropFilter: 'blur(4px)',
              padding: '4px 10px',
            }}
          >
            {s.label}
          </span>
        </div>

        {/* ── Card body ─────────────────────────────────────── */}
        <div style={{ padding: '22px 24px 24px' }}>

          {/* Location eyebrow */}
          {project.location && (
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#4d4637',
                margin: '0 0 8px',
              }}
            >
              {project.location.region_or_society}
              {' · '}
              {project.location.city}
            </p>
          )}

          {/* Title */}
          <h3
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '17px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: '0 0 10px',
              lineHeight: 1.2,
            }}
          >
            {project.title}
          </h3>

          {/* Description snippet */}
          {project.description && (
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '13px',
                lineHeight: 1.65,
                color: '#99907e',
                margin: '0 0 20px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {project.description}
            </p>
          )}

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #4d4637',
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#4d4637',
                margin: 0,
              }}
            >
              Development
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#C9A84C',
                }}
              >
                View Details
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6h8M7 3l3 3-3 3"
                  stroke="#C9A84C"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
