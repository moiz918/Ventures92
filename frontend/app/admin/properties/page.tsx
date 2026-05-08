'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getProperties,
  deleteProperty,
  type Property,
  type AvailabilityStatus,
} from '@/services/propertyService';
import PropertyForm from '@/components/admin/PropertyForm';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPKR(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return price;
  if (n >= 10_000_000) return `PKR ${(n / 10_000_000).toFixed(1).replace(/\.0$/, '')} Cr`;
  if (n >= 100_000)    return `PKR ${(n / 100_000).toFixed(0)} L`;
  return `PKR ${n.toLocaleString()}`;
}

const STATUS_COLORS: Record<AvailabilityStatus, { color: string; border: string }> = {
  AVAILABLE: { color: '#C9A84C', border: '#C9A84C' },
  RESERVED:  { color: '#E8A020', border: '#E8A020' },
  SOLD:      { color: '#4d4637', border: '#4d4637' },
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        backgroundColor: '#1e1b15',
        border: '1px solid #4d4637',
        padding: '16px 20px',
        minWidth: '120px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-space-grotesk)',
          fontSize: '28px',
          fontWeight: 700,
          color: '#C9A84C',
          margin: '0 0 4px',
          lineHeight: 1,
        }}
      >
        {value}
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
        {label}
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProperties({ limit: 100 });
      setProperties(data);
    } catch {
      setError('Failed to load properties. Check the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    setActionError(null);
    try {
      await deleteProperty(id);
      setProperties((prev) => prev.filter((p) => p.id !== id));
      // Invalidate RSC cache so /properties reflects the deletion.
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? `Failed to delete: ${err.message}`
          : 'Failed to delete property.',
      );
    } finally {
      setDeletingId(null);
    }
  }, [router]);

  const handleFormSuccess = useCallback((savedProp: Property) => {
    setProperties((prev) => {
      const idx = prev.findIndex((p) => p.id === savedProp.id);
      if (idx !== -1) {
        // Edit: replace existing row in-place
        const updated = [...prev];
        updated[idx] = savedProp;
        return updated;
      }
      // Create: prepend new row
      return [savedProp, ...prev];
    });
    setEditingProperty(null);
    setActionError(null);
    // Invalidate RSC cache so /properties + homepage feature grid update.
    router.refresh();
  }, [router]);

  const handleEdit = useCallback((property: Property) => {
    setEditingProperty(property);
    setShowForm(true);
  }, []);

  // Stats
  const available = properties.filter((p) => p.availability_status === 'AVAILABLE').length;
  const reserved  = properties.filter((p) => p.availability_status === 'RESERVED').length;
  const sold      = properties.filter((p) => p.availability_status === 'SOLD').length;

  return (
    <>
      <div style={{ padding: '32px' }}>

        {/* ── Page header ───────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '32px',
            flexWrap: 'wrap',
          }}
        >
          <div>
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
              Inventory
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
              Property Listings
            </h1>
          </div>

          <button
            onClick={() => { setEditingProperty(null); setShowForm(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#1A1A1A',
              backgroundColor: '#C9A84C',
              border: 'none',
              padding: '14px 24px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            Add New Property
          </button>
        </div>

        {/* ── Action error banner ──────────────────────────────── */}
        {actionError && (
          <div
            style={{
              border: '1px solid #4d4637',
              borderLeft: '3px solid #C9A84C',
              backgroundColor: '#1e1b15',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#d0c5b2', margin: 0 }}>
              {actionError}
            </p>
            <button
              onClick={() => setActionError(null)}
              style={{
                fontFamily: 'var(--font-manrope)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#99907e',
                backgroundColor: 'transparent',
                border: '1px solid #4d4637',
                padding: '6px 12px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Stats row ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '28px',
            flexWrap: 'wrap',
          }}
        >
          <StatCard value={properties.length} label="All Listings" />
          <StatCard value={available} label="Available" />
          <StatCard value={reserved}  label="Reserved" />
          <StatCard value={sold}      label="Sold" />
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        {loading ? (
          <TableSkeleton />
        ) : error ? (
          <div
            style={{
              border: '1px solid #4d4637',
              backgroundColor: '#1e1b15',
              padding: '32px',
            }}
          >
            <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e', margin: 0 }}>
              {error}
            </p>
          </div>
        ) : (
          <div
            className="admin-table-wrap"
            style={{
              border: '1px solid #4d4637',
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <div style={{ minWidth: '780px' }}>
            {/* Table header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                backgroundColor: '#100e08',
                borderBottom: '2px solid #4d4637',
                padding: '0',
              }}
            >
              {['Property', 'Type', 'Price', 'Status', 'Actions'].map((h) => (
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
            {properties.length === 0 ? (
              <div
                style={{
                  padding: '48px 20px',
                  textAlign: 'center',
                  backgroundColor: '#1e1b15',
                }}
              >
                <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#4d4637', margin: 0 }}>
                  No properties found. Add your first listing.
                </p>
              </div>
            ) : (
              properties.map((p) => {
                const statusStyle = STATUS_COLORS[p.availability_status];
                const isDeleting = deletingId === p.id;
                const isConfirming = confirmDeleteId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      backgroundColor: isDeleting ? '#100e08' : '#1e1b15',
                      borderBottom: '1px solid #4d4637',
                      opacity: isDeleting ? 0.4 : 1,
                      transition: 'background-color 0.15s, opacity 0.15s',
                    }}
                    className="table-row-hover"
                  >
                    {/* Title + slug */}
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

                    {/* Type + category */}
                    <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          color: '#d0c5b2',
                          margin: 0,
                          textTransform: 'capitalize',
                        }}
                      >
                        {p.property_type.charAt(0) + p.property_type.slice(1).toLowerCase()}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '11px',
                          color: '#4d4637',
                          margin: 0,
                          textTransform: 'capitalize',
                        }}
                      >
                        {p.property_category.charAt(0) + p.property_category.slice(1).toLowerCase()}
                      </p>
                    </div>

                    {/* Price */}
                    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-space-grotesk)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#C9A84C',
                          margin: 0,
                        }}
                      >
                        {formatPKR(p.price)}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-manrope)',
                          fontSize: '9px',
                          fontWeight: 700,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '3px 8px',
                        }}
                      >
                        {p.availability_status}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isConfirming ? (
                        <>
                          <button
                            onClick={() => handleDelete(p.id)}
                            style={actionBtnStyle('#99907e', '#1e1b15')}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={actionBtnStyle('#4d4637', 'transparent')}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <a
                            href={`/properties/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              ...actionBtnStyle('#C9A84C', 'transparent'),
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="View public listing"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleEdit(p)}
                            disabled={isDeleting}
                            style={actionBtnStyle('#99907e', 'transparent')}
                            title="Edit property"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            disabled={isDeleting}
                            style={actionBtnStyle('#4d4637', 'transparent')}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        )}
      </div>

      {/* ── Slide-over form ──────────────────────────────────────── */}
      {showForm && (
        <PropertyForm
          onClose={() => { setShowForm(false); setEditingProperty(null); }}
          onSuccess={handleFormSuccess}
          property={editingProperty ?? undefined}
        />
      )}
    </>
  );
}

// ── Micro-helpers ─────────────────────────────────────────────────────────────
function actionBtnStyle(color: string, bg: string): React.CSSProperties {
  return {
    fontFamily: 'var(--font-manrope)',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color,
    border: `1px solid ${color}`,
    backgroundColor: bg,
    padding: '6px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}

function TableSkeleton() {
  return (
    <div style={{ border: '1px solid #4d4637', overflow: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          backgroundColor: '#100e08',
          borderBottom: '2px solid #4d4637',
        }}
      >
        {['Property', 'Type', 'Price', 'Status', 'Actions'].map((h) => (
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
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            backgroundColor: '#1e1b15',
            borderBottom: '1px solid #4d4637',
            opacity: 0.4,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          {[0, 1, 2, 3, 4].map((j) => (
            <div key={j} style={{ padding: '14px 20px' }}>
              <div
                style={{
                  height: '14px',
                  backgroundColor: '#2d2a23',
                  width: j === 0 ? '70%' : '50%',
                }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
