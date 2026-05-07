import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectBySlug, type ProjectStatus } from '@/services/projectService';
import MilestoneTimeline from '@/components/MilestoneTimeline';
import { ApiError } from '@/services/api';

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; borderColor: string }> = {
  PLANNING:           { label: 'Upcoming',          color: '#99907e', borderColor: '#4d4637'  },
  UNDER_CONSTRUCTION: { label: 'Under Construction', color: '#E8A020', borderColor: '#E8A020' },
  COMPLETED:          { label: 'Delivered',          color: '#1D9E75', borderColor: '#1D9E75' },
};

const HERO_GRADIENTS: Record<ProjectStatus, string> = {
  PLANNING:           'linear-gradient(160deg, #1e1b15 0%, #221f19 100%)',
  UNDER_CONSTRUCTION: 'linear-gradient(160deg, #1e1408 0%, #241a0e 100%)',
  COMPLETED:          'linear-gradient(160deg, #0d1614 0%, #0e1c16 100%)',
};

// ── Shared data loader ────────────────────────────────────────────────────────
async function loadProject(slug: string) {
  try {
    return await getProjectBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await loadProject(slug);
  return {
    title: project.title,
    description:
      project.description?.slice(0, 160) ??
      `Explore ${project.title} — an exclusive Ventures 92 development.`,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await loadProject(slug);
  const status = STATUS_CONFIG[project.status];
  const heroGradient = HERO_GRADIENTS[project.status];

  const completedCount = project.milestones.filter((m) => (m.completion_percentage ?? 0) >= 100).length;

  return (
    <div style={{ backgroundColor: '#16130d', minHeight: '100vh' }}>

      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div
        style={{
          backgroundColor: '#1e1b15',
          borderBottom: '1px solid #4d4637',
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: '1600px',
            paddingInline: '64px',
            paddingBlock: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Link
            href="/projects"
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#4d4637',
              textDecoration: 'none',
            }}
          >
            Developments
          </Link>
          <span style={{ color: '#4d4637', fontSize: '11px' }}>/</span>
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#99907e',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.title}
          </span>
        </div>
      </div>

      {/* ── Hero banner ────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          background: heroGradient,
          overflow: 'hidden',
          minHeight: '320px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        {/* Grid overlay */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), ' +
              'linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />

        {/* Faint building silhouette */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            right: '64px',
            bottom: 0,
            opacity: 0.05,
            color: '#C9A84C',
          }}
        >
          <svg width="280" height="240" viewBox="0 0 280 240" fill="currentColor">
            <rect x="20"  y="60"  width="60"  height="180" />
            <rect x="85"  y="30"  width="110" height="210" />
            <rect x="100" y="10"  width="30"  height="230" />
            <rect x="140" y="10"  width="30"  height="230" />
            <rect x="200" y="80"  width="60"  height="160" />
            <rect x="0"   y="200" width="280" height="40"  />
          </svg>
        </div>

        {/* Gold left edge */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: 0,
            width: '3px',
            background: `linear-gradient(to bottom, transparent, ${status.borderColor})`,
            opacity: 0.6,
          }}
        />

        {/* Gradient scrim — bottom */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(22,19,13,0.95) 0%, transparent 60%)',
          }}
        />

        {/* Hero text */}
        <div
          className="mx-auto"
          style={{
            maxWidth: '1600px',
            paddingInline: '64px',
            paddingBottom: '48px',
            position: 'relative',
            width: '100%',
          }}
        >
          {/* Status badge */}
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-manrope)',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: status.color,
              border: `1px solid ${status.borderColor}`,
              backgroundColor: 'rgba(16,14,8,0.6)',
              padding: '5px 12px',
              marginBottom: '14px',
            }}
          >
            {status.label}
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: '0 0 12px',
              lineHeight: 1.05,
              maxWidth: '800px',
            }}
          >
            {project.title}
          </h1>

          {project.location && (
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#99907e',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M6 1C4.07 1 2.5 2.57 2.5 4.5 2.5 7.25 6 11 6 11s3.5-3.75 3.5-6.5C9.5 2.57 7.93 1 6 1z" stroke="#99907e" strokeWidth="1" />
                <circle cx="6" cy="4.5" r="1.25" stroke="#99907e" strokeWidth="1" />
              </svg>
              {project.location.region_or_society}, {project.location.city}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div
        className="mx-auto"
        style={{
          maxWidth: '1600px',
          paddingInline: '64px',
          paddingBlock: '64px',
        }}
      >
        <div
          className="grid gap-16 lg:grid-cols-[1fr_360px]"
          style={{ alignItems: 'start' }}
        >

          {/* ── Left column ──────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '56px' }}>

            {/* Description */}
            {project.description && (
              <section>
                <SectionHeading>About This Development</SectionHeading>
                <p
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: '#d0c5b2',
                    margin: 0,
                    maxWidth: '680px',
                  }}
                >
                  {project.description}
                </p>
              </section>
            )}

            {/* Milestone timeline */}
            <section>
              <SectionHeading>Construction Timeline</SectionHeading>
              <MilestoneTimeline milestones={project.milestones} />
            </section>

          </div>

          {/* ── Right sidebar ─────────────────────────────── */}
          <aside style={{ position: 'sticky', top: '88px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Info card */}
            <div
              style={{
                backgroundColor: '#1e1b15',
                border: '1px solid #4d4637',
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  borderBottom: '1px solid #4d4637',
                  padding: '18px 20px',
                  backgroundColor: '#100e08',
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
                    margin: '0 0 6px',
                  }}
                >
                  Development Status
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: status.color,
                    border: `1px solid ${status.borderColor}`,
                    padding: '4px 12px',
                    display: 'inline-block',
                  }}
                >
                  {status.label}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: '20px' }}>

                {/* Location */}
                {project.location && (
                  <InfoRow label="Location">
                    {project.location.region_or_society}
                    <br />
                    <span style={{ color: '#4d4637' }}>{project.location.city}</span>
                  </InfoRow>
                )}

                {/* Milestones progress */}
                {project.milestones.length > 0 && (
                  <InfoRow label="Progress">
                    {completedCount} of {project.milestones.length} phases complete
                  </InfoRow>
                )}

                {/* Date added */}
                <InfoRow label="Listed">
                  {new Date(project.created_at).toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </InfoRow>
              </div>
            </div>

            {/* CTA: Enquire */}
            <a
              href="/contact"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '16px',
                textDecoration: 'none',
              }}
            >
              Enquire About This Development
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            {/* CTA: WhatsApp */}
            <a
              href="https://wa.me/923039640744"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: '1px solid #C9A84C',
                color: '#C9A84C',
                backgroundColor: 'transparent',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '14px',
                textDecoration: 'none',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>

            {/* Back link */}
            <Link
              href="/projects"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-manrope)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#4d4637',
                textDecoration: 'none',
                paddingTop: '4px',
                justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 6H3M5 3L2 6l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All Developments
            </Link>
          </aside>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '28px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#C9A84C',
          margin: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {children}
      </p>
      <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        paddingBlock: '12px',
        borderBottom: '1px solid #4d4637',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#4d4637',
          margin: '0 0 4px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '13px',
          color: '#d0c5b2',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {children}
      </p>
    </div>
  );
}
