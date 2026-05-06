import { type ProjectMilestone } from '@/services/projectService';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyTimeline() {
  return (
    <div
      style={{
        border: '1px solid #4d4637',
        backgroundColor: '#1e1b15',
        padding: '40px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Placeholder nodes */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              border: '1px solid #4d4637',
              opacity: 1 - i * 0.25,
            }}
          />
        ))}
      </div>
      <div>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4d4637',
            margin: '0 0 4px',
          }}
        >
          Construction Timeline
        </p>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            lineHeight: 1.6,
            color: '#4d4637',
            margin: 0,
          }}
        >
          Development timeline coming soon — check back for construction updates.
        </p>
      </div>
    </div>
  );
}

// ── Milestone node ────────────────────────────────────────────────────────────
function MilestoneNode({
  milestone,
  isLast,
  index,
}: {
  milestone: ProjectMilestone;
  isLast: boolean;
  index: number;
}) {
  const pct = milestone.completion_percentage;
  const isDone = pct >= 100;
  const isActive = pct > 0 && pct < 100;

  const nodeColor = isDone ? '#C9A84C' : isActive ? '#E8A020' : '#4d4637';
  const lineColor = isDone ? 'rgba(201,168,76,0.25)' : '#2d2a23';
  const titleColor = isDone ? '#e9e1d7' : isActive ? '#d0c5b2' : '#99907e';
  const dateColor = isDone ? '#C9A84C' : isActive ? '#E8A020' : '#4d4637';
  const barFill = isDone ? '#C9A84C' : isActive ? '#E8A020' : '#2d2a23';

  return (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        paddingBottom: isLast ? 0 : '36px',
        position: 'relative',
      }}
    >
      {/* ── Timeline spine ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          width: '20px',
        }}
      >
        {/* Step number + node */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              border: `2px solid ${nodeColor}`,
              backgroundColor: isDone ? '#C9A84C' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, border-color 0.2s',
            }}
          >
            {isDone ? (
              /* Checkmark */
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                <path
                  d="M1 4l3 3 5-6"
                  stroke="#1A1A1A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  fontSize: '9px',
                  fontWeight: 700,
                  color: nodeColor,
                  lineHeight: 1,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Connecting line */}
        {!isLast && (
          <div
            style={{
              width: '2px',
              flex: 1,
              minHeight: '20px',
              marginTop: '4px',
              backgroundColor: lineColor,
            }}
          />
        )}
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Date */}
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: dateColor,
            margin: '0 0 5px',
            lineHeight: 1,
            paddingTop: '2px',
          }}
        >
          {formatDate(milestone.milestone_date)}
        </p>

        {/* Title */}
        <h4
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: titleColor,
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}
        >
          {milestone.title}
        </h4>

        {/* Description */}
        {milestone.description && (
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              lineHeight: 1.65,
              color: isDone ? '#99907e' : '#4d4637',
              margin: '0 0 12px',
            }}
          >
            {milestone.description}
          </p>
        )}

        {/* Progress bar + percentage */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '3px',
              backgroundColor: '#2d2a23',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: barFill,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              fontSize: '12px',
              fontWeight: 500,
              color: isDone ? '#C9A84C' : isActive ? '#E8A020' : '#4d4637',
              flexShrink: 0,
              letterSpacing: '0.02em',
            }}
          >
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MilestoneTimeline({
  milestones,
}: {
  milestones: ProjectMilestone[];
}) {
  if (milestones.length === 0) {
    return <EmptyTimeline />;
  }

  const completed = milestones.filter((m) => m.completion_percentage >= 100).length;
  const overallPct = Math.round(
    milestones.reduce((sum, m) => sum + m.completion_percentage, 0) / milestones.length,
  );

  return (
    <div>
      {/* Overall progress header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          gap: '16px',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
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
              Overall Progress
            </p>
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk)',
                fontSize: '13px',
                fontWeight: 700,
                color: '#C9A84C',
                margin: 0,
              }}
            >
              {completed}/{milestones.length} Phases Complete
            </p>
          </div>
          {/* Master progress track */}
          <div
            style={{
              height: '4px',
              backgroundColor: '#2d2a23',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${overallPct}%`,
                background: 'linear-gradient(90deg, #C9A84C, #e6c364)',
              }}
            />
          </div>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '24px',
            fontWeight: 700,
            color: '#C9A84C',
            letterSpacing: '-0.02em',
            flexShrink: 0,
          }}
        >
          {overallPct}%
        </span>
      </div>

      {/* Milestone list */}
      <div>
        {milestones.map((m, i) => (
          <MilestoneNode
            key={m.id}
            milestone={m}
            index={i}
            isLast={i === milestones.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
