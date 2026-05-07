'use client';

import { useState } from 'react';

import { ApiError } from '@/services/api';
import { changePassword } from '@/services/authService';

interface StrengthRule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: StrengthRule[] = [
  { label: 'At least 10 characters', test: (p) => p.length >= 10 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function isStrong(pw: string) {
  return RULES.every((r) => r.test(pw));
}

function fieldStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%',
    backgroundColor: '#100e08',
    border: `1px solid ${focused ? '#C9A84C' : '#4d4637'}`,
    color: '#e9e1d7',
    fontFamily: 'var(--font-manrope)',
    fontSize: '14px',
    padding: '13px 14px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#99907e',
  marginBottom: '8px',
};

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const pwType = showPasswords ? 'text' : 'password';
  const allRulesMet = isStrong(newPassword);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (!allRulesMet) {
      setErrorMsg('New password does not meet the strength requirements below.');
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Could not change your password.');
      } else {
        setErrorMsg('Network error — please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ marginTop: '48px' }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            whiteSpace: 'nowrap',
          }}
        >
          Security
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: '#4d4637' }} />
      </div>

      <h2
        style={{
          fontFamily: 'var(--font-epilogue)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          color: '#e9e1d7',
          margin: '0 0 6px',
        }}
      >
        Change Password
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '13px',
          color: '#99907e',
          margin: '0 0 28px',
          lineHeight: 1.6,
        }}
      >
        Update your account password. After a successful change your active session is refreshed automatically.
      </p>

      {success ? (
        <div
          style={{
            border: '1px solid rgba(29,158,117,0.4)',
            backgroundColor: 'rgba(29,158,117,0.06)',
            padding: '20px 24px',
            fontFamily: 'var(--font-manrope)',
            fontSize: '13px',
            color: '#d0c5b2',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}
        >
          Password changed successfully. Your session has been refreshed.{' '}
          <button
            onClick={() => setSuccess(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#C9A84C',
              fontFamily: 'var(--font-manrope)',
              fontSize: '13px',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Change again
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '520px',
            opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {/* Current password */}
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type={pwType}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              onFocus={() => setFocused('current')}
              onBlur={() => setFocused(null)}
              style={fieldStyle(focused === 'current')}
              disabled={isSubmitting}
            />
          </div>

          {/* New password */}
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type={pwType}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setFocused('new')}
              onBlur={() => setFocused(null)}
              style={fieldStyle(focused === 'new')}
              disabled={isSubmitting}
            />
            {/* Strength checklist */}
            {newPassword.length > 0 && (
              <ul
                style={{
                  listStyle: 'none',
                  margin: '10px 0 0',
                  padding: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px 20px',
                }}
              >
                {RULES.map((rule) => {
                  const met = rule.test(newPassword);
                  return (
                    <li
                      key={rule.label}
                      style={{
                        fontFamily: 'var(--font-manrope)',
                        fontSize: '11px',
                        color: met ? '#1D9E75' : '#4d4637',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'color 0.15s',
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>{met ? '✓' : '○'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirm new password */}
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type={pwType}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFocused('confirm')}
              onBlur={() => setFocused(null)}
              style={fieldStyle(focused === 'confirm')}
              disabled={isSubmitting}
            />
            {confirmPassword.length > 0 && newPassword !== confirmPassword && (
              <p
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '11px',
                  color: '#E8A020',
                  margin: '6px 0 0',
                }}
              >
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Show passwords toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-manrope)',
              fontSize: '12px',
              color: '#99907e',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
            />
            Show passwords
          </label>

          {/* Error */}
          {errorMsg && (
            <div
              style={{
                border: '1px solid rgba(255,68,68,0.4)',
                backgroundColor: 'rgba(255,68,68,0.06)',
                padding: '11px 14px',
                fontFamily: 'var(--font-manrope)',
                fontSize: '13px',
                color: '#e9e1d7',
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#7a6a2e' : '#C9A84C',
                color: '#1A1A1A',
                fontFamily: 'var(--font-manrope)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '14px 28px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Updating…' : 'Update Password'}
            </button>
            {isSubmitting && (
              <span
                style={{
                  fontFamily: 'var(--font-manrope)',
                  fontSize: '12px',
                  color: '#4d4637',
                }}
              >
                Saving…
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
