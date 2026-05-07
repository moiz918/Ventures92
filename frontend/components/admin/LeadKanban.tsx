'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getLeads,
  updateLeadStatus,
  type LeadResponse,
  type LeadStatus,
} from '@/services/leadService';

// ── Column config ─────────────────────────────────────────────────────────────
const COLUMNS: { status: LeadStatus; label: string; accent: string }[] = [
  { status: 'NEW',         label: 'New',         accent: '#99907e' },
  { status: 'CONTACTED',   label: 'Contacted',   accent: '#C9A84C' },
  { status: 'IN_PROGRESS', label: 'In Progress', accent: '#E8A020' },
  { status: 'QUALIFIED',   label: 'Qualified',   accent: '#1D9E75' },
  { status: 'LOST',        label: 'Lost',        accent: '#ff4444' },
  { status: 'CLOSED',      label: 'Closed',      accent: '#4d4637' },
];

const STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  NEW:         ['CONTACTED'],
  CONTACTED:   ['IN_PROGRESS', 'LOST'],
  IN_PROGRESS: ['QUALIFIED', 'LOST'],
  QUALIFIED:   ['CLOSED', 'LOST'],
  LOST:        ['NEW'],
  CLOSED:      [],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBudget(min?: string | null, max?: string | null): string {
  const fmt = (v: string) => {
    const n = parseFloat(v);
    if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1).replace(/\.0$/, '')} Cr`;
    if (n >= 100_000)    return `${(n / 100_000).toFixed(0)} L`;
    return v;
  };
  if (min && max) return `PKR ${fmt(min)} – ${fmt(max)}`;
  if (min)        return `PKR ${fmt(min)}+`;
  if (max)        return `Up to PKR ${fmt(max)}`;
  return '—';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Lead card ─────────────────────────────────────────────────────────────────
function LeadCard({
  lead,
  accent,
  onMove,
  moving,
}: {
  lead: LeadResponse;
  accent: string;
  onMove: (id: string, status: LeadStatus) => void;
  moving: boolean;
}) {
  const transitions = STATUS_TRANSITIONS[lead.status];

  return (
    <div
      style={{
        backgroundColor: '#1e1b15',
        border: '1px solid #4d4637',
        borderLeft: `3px solid ${accent}`,
        padding: '16px',
        opacity: moving ? 0.5 : 1,
        transition: 'opacity 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Name + type */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '14px',
              fontWeight: 700,
              color: '#e9e1d7',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {lead.first_name} {lead.last_name}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '10px',
              color: '#99907e',
              margin: '3px 0 0',
              letterSpacing: '0.06em',
            }}
          >
            {timeAgo(lead.created_at)}
          </p>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            border: `1px solid ${accent}`,
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {lead.preferred_property_type}
        </span>
      </div>

      {/* Contact info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '12px',
            color: '#d0c5b2',
            margin: 0,
          }}
        >
          {lead.email}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '12px',
            color: '#d0c5b2',
            margin: 0,
          }}
        >
          {lead.phone}
        </p>
      </div>

      {/* Budget */}
      <div
        style={{
          backgroundColor: '#2d2a23',
          padding: '8px 10px',
          borderLeft: `2px solid ${accent}`,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4d4637',
            margin: '0 0 3px',
          }}
        >
          Budget
        </p>
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '13px',
            fontWeight: 500,
            color: '#C9A84C',
            margin: 0,
          }}
        >
          {formatBudget(lead.min_budget, lead.max_budget)}
        </p>
      </div>

      {/* Message snippet */}
      {lead.message && (
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            color: '#99907e',
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {lead.message}
        </p>
      )}

      {/* Status move buttons */}
      {transitions.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
          {transitions.map((target) => {
            const col = COLUMNS.find((c) => c.status === target)!;
            return (
              <button
                key={target}
                disabled={moving}
                onClick={() => onMove(lead.id, target)}
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: col.accent,
                  border: `1px solid ${col.accent}`,
                  backgroundColor: 'transparent',
                  padding: '5px 10px',
                  cursor: moving ? 'not-allowed' : 'pointer',
                  opacity: moving ? 0.5 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                → {col.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────
function KanbanColumn({
  status,
  label,
  accent,
  leads,
  onMove,
  movingId,
}: {
  status: LeadStatus;
  label: string;
  accent: string;
  leads: LeadResponse[];
  onMove: (id: string, status: LeadStatus) => void;
  movingId: string | null;
}) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: '240px',
        maxWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
      }}
    >
      {/* Column header */}
      <div
        style={{
          borderTop: `3px solid ${accent}`,
          backgroundColor: '#1e1b15',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: accent,
            margin: 0,
          }}
        >
          {label}
        </p>
        <span
          style={{
            fontFamily: 'var(--font-space-grotesk)',
            fontSize: '13px',
            fontWeight: 700,
            color: accent,
            backgroundColor: '#16130d',
            border: `1px solid ${accent}`,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          {leads.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {leads.length === 0 ? (
          <div
            style={{
              border: '1px dashed #4d4637',
              padding: '32px 16px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '11px',
                color: '#4d4637',
                margin: 0,
                letterSpacing: '0.06em',
              }}
            >
              No leads
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              accent={accent}
              onMove={onMove}
              moving={movingId === lead.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────
export default function LeadKanban() {
  const [leads, setLeads] = useState<LeadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    getLeads()
      .then(setLeads)
      .catch(() => setError('Failed to load leads. Check the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const handleMove = useCallback(async (id: string, newStatus: LeadStatus) => {
    setMovingId(id);

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );

    try {
      const updated = await updateLeadStatus(id, newStatus);
      setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
    } catch {
      // Revert on failure
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: leads.find((x) => x.id === id)!.status } : l))
      );
    } finally {
      setMovingId(null);
    }
  }, [leads]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            style={{
              flex: '1 1 0',
              minWidth: '240px',
              maxWidth: '340px',
              borderTop: `3px solid ${col.accent}`,
              backgroundColor: '#1e1b15',
              height: '200px',
              opacity: 0.4,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          border: '1px solid #4d4637',
          backgroundColor: '#1e1b15',
          padding: '32px',
          maxWidth: '480px',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            color: '#99907e',
            margin: 0,
          }}
        >
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px',
        alignItems: 'flex-start',
      }}
    >
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.status}
          status={col.status}
          label={col.label}
          accent={col.accent}
          leads={leads.filter((l) => l.status === col.status)}
          onMove={handleMove}
          movingId={movingId}
        />
      ))}
    </div>
  );
}
