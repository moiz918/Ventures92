import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjects } from '@/services/projectService';

export const metadata: Metadata = {
  title: 'Projects — Admin',
};

const STATUS_COLORS: Record<string, { color: string; border: string }> = {
  PLANNING:           { color: '#99907e', border: '#4d4637' },
  UNDER_CONSTRUCTION: { color: '#E8A020', border: '#E8A020' },
  COMPLETED:          { color: '#1D9E75', border: '#1D9E75' },
};

const STATUS_LABEL: Record<string, string> = {
  PLANNING:           'Upcoming',
  UNDER_CONSTRUCTION: 'Under Construction',
  COMPLETED:          'Delivered',
};

export default async function AdminProjectsPage() {
  const projects = await getProjects().catch(() => null);
  const loadError = projects === null;
  const list = projects ?? [];

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          Pipeline
        </span>
        <h1
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: 0,
          }}
        >
          Development Projects
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            color: '#99907e',
            marginTop: '8px',
            margin: 0,
            paddingTop: '8px',
          }}
        >
          Read-only roster of every project tracked in the system.
          Construction milestones are logged via the API; in-app editing is on the roadmap.
        </p>
      </div>

      {/* Error state */}
      {loadError ? (
        <div
          style={{
            border: '1px solid #4d4637',
            backgroundColor: '#1e1b15',
            padding: '32px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e', margin: 0 }}>
            Failed to load projects. Check that the backend is reachable.
          </p>
        </div>
      ) : list.length === 0 ? (
        <div
          style={{
            border: '1px solid #4d4637',
            backgroundColor: '#1e1b15',
            padding: '48px 32px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#4d4637', margin: 0 }}>
            No projects yet — seed the database or create one via the API.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #4d4637' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              backgroundColor: '#100e08',
              borderBottom: '2px solid #4d4637',
            }}
          >
            {['Project', 'Status', 'Listed', 'Actions'].map((h) => (
              <div
                key={h}
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4d4637',
                  padding: '12px 20px',
                }}
              >
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          {list.map((p) => {
            const sc = STATUS_COLORS[p.status] ?? STATUS_COLORS.PLANNING;
            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  backgroundColor: '#1e1b15',
                  borderBottom: '1px solid #4d4637',
                }}
                className="table-row-hover"
              >
                <div style={{ padding: '14px 20px', minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#e9e1d7',
                      margin: '0 0 3px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '11px',
                      color: '#4d4637',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    /{p.slug}
                  </p>
                </div>

                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                      padding: '3px 8px',
                    }}
                  >
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                </div>

                <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '12px',
                      color: '#99907e',
                    }}
                  >
                    {new Date(p.created_at).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    href={`/projects/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-manrope)',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#C9A84C',
                      border: '1px solid #C9A84C',
                      padding: '6px 12px',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
