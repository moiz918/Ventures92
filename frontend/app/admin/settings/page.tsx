import type { Metadata } from 'next';

import { api } from '@/services/api';
import ChangePasswordForm from './ChangePasswordForm';

export const metadata: Metadata = {
  title: 'Settings — Admin',
};

interface SettingResponse {
  id: string;
  setting_key: string;
  setting_value: string;
  description: string | null;
  updated_at: string;
}

async function loadSettings(): Promise<SettingResponse[] | null> {
  try {
    return await api.get<SettingResponse[]>('/settings/');
  } catch {
    return null;
  }
}

export default async function AdminSettingsPage() {
  const settings = await loadSettings();
  const loadError = settings === null;
  const list = settings ?? [];

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
          Configuration
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
          Site Settings
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            color: '#99907e',
            margin: '8px 0 0',
          }}
        >
          Read-only view of public-facing settings (WhatsApp number, contact email, etc.).
          Editing is performed via <code style={{ color: '#C9A84C' }}>PUT /api/v1/settings/&#123;key&#125;</code>.
        </p>
      </div>

      {loadError ? (
        <div
          style={{
            border: '1px solid #4d4637',
            backgroundColor: '#1e1b15',
            padding: '32px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-manrope)', fontSize: '13px', color: '#99907e', margin: 0 }}>
            Failed to load settings. Check that the backend is reachable.
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
            No site settings configured.
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #4d4637' }}>
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 2fr 1fr',
              backgroundColor: '#100e08',
              borderBottom: '2px solid #4d4637',
            }}
          >
            {['Key', 'Value', 'Description', 'Updated'].map((h) => (
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
          {list.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 2fr 1fr',
                backgroundColor: '#1e1b15',
                borderBottom: '1px solid #4d4637',
                alignItems: 'center',
              }}
              className="table-row-hover"
            >
              <div style={{ padding: '14px 20px', minWidth: 0 }}>
                <code
                  style={{
                    fontFamily: 'var(--font-space-grotesk)',
                    fontSize: '12px',
                    color: '#C9A84C',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.setting_key}
                </code>
              </div>
              <div style={{ padding: '14px 20px', minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '13px',
                    color: '#e9e1d7',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: '100%',
                  }}
                >
                  {s.setting_value}
                </span>
              </div>
              <div style={{ padding: '14px 20px', minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '12px',
                    color: '#99907e',
                  }}
                >
                  {s.description ?? '—'}
                </span>
              </div>
              <div style={{ padding: '14px 20px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    fontSize: '11px',
                    color: '#4d4637',
                  }}
                >
                  {new Date(s.updated_at).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ChangePasswordForm />
    </div>
  );
}
