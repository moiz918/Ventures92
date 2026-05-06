import type { Metadata } from 'next';
import LeadKanban from '@/components/admin/LeadKanban';

export const metadata: Metadata = {
  title: 'Dashboard — Admin',
};

export default function DashboardPage() {
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
          CRM
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
          Lead Management Pipeline
        </h1>
      </div>

      {/* Kanban board */}
      <LeadKanban />
    </div>
  );
}
