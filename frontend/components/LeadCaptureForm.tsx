'use client';

import { useState } from 'react';
import { submitLead, type LeadCreatePayload, type LeadPropertyType } from '@/services/leadService';
import { ApiError } from '@/services/api';

// ── Shared style factories ────────────────────────────────────────────────────
const LABEL: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-manrope)',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: '#99907e',
  marginBottom: '8px',
};

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%',
  backgroundColor: '#16130d',
  border: `1px solid ${focused ? '#C9A84C' : '#4d4637'}`,
  color: '#e9e1d7',
  fontFamily: 'var(--font-manrope)',
  fontSize: '14px',
  padding: '12px 14px',
  outline: 'none',
  transition: 'border-color 0.15s',
  display: 'block',
});

// ── Types ─────────────────────────────────────────────────────────────────────
type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  preferred_property_type: LeadPropertyType | '';
  min_budget: string;
  max_budget: string;
  message: string;
};

const EMPTY: FormState = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  preferred_property_type: '',
  min_budget: '',
  max_budget: '',
  message: '',
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeadCaptureForm() {
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [focused, setFocused]     = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const focus = (name: string) => () => setFocused(name);
  const blur  = ()              => setFocused(null);

  const isFocused = (name: string) => focused === name;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!form.preferred_property_type) {
      setErrorMsg('Please select a property type.');
      return;
    }

    const payload: LeadCreatePayload = {
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      email:      form.email.trim(),
      phone:      form.phone.trim(),
      preferred_property_type: form.preferred_property_type as LeadPropertyType,
    };
    if (form.min_budget) payload.min_budget = form.min_budget;
    if (form.max_budget) payload.max_budget = form.max_budget;
    if (form.message.trim()) payload.message = form.message.trim();

    setIsSubmitting(true);
    try {
      await submitLead(payload);
      setForm(EMPTY);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(
          err.status === 422
            ? 'Please check your details and try again.'
            : 'Something went wrong on our end. Please try again shortly.',
        );
      } else {
        setErrorMsg('Unable to submit. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        style={{
          backgroundColor: '#1e1b15',
          border: '1px solid #4d4637',
          borderTop: '4px solid #C9A84C',
          padding: '56px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center',
        }}
      >
        {/* Gold checkmark */}
        <div
          style={{
            width: '72px',
            height: '72px',
            border: '1px solid #C9A84C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16l8 8 12-12"
              stroke="#C9A84C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3
            style={{
              fontFamily: 'var(--font-epilogue)',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: '#e9e1d7',
              margin: 0,
            }}
          >
            Enquiry Received
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#d0c5b2',
              margin: 0,
              maxWidth: '380px',
            }}
          >
            Thank you. An agent will review your requirements and contact you within{' '}
            <span style={{ color: '#C9A84C', fontWeight: 600 }}>24 hours</span> with a
            curated shortlist.
          </p>
        </div>

        <button
          onClick={() => setSuccess(false)}
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#99907e',
            background: 'transparent',
            border: '1px solid #4d4637',
            padding: '10px 24px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          Submit Another Enquiry
        </button>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        backgroundColor: '#1e1b15',
        border: '1px solid #4d4637',
        borderTop: '4px solid #C9A84C',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        opacity: isSubmitting ? 0.7 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Form header */}
      <div>
        <p
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            margin: '0 0 8px',
          }}
        >
          Property Matchmaking
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-epilogue)',
            fontSize: 'clamp(20px, 2vw, 28px)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: '#e9e1d7',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Submit Your Requirements
        </h2>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#4d4637' }} />

      {/* Name row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField label="First Name">
          <input
            type="text"
            required
            autoComplete="given-name"
            value={form.first_name}
            onChange={set('first_name')}
            onFocus={focus('first_name')}
            onBlur={blur}
            placeholder="Ahmad"
            style={inputStyle(isFocused('first_name'))}
          />
        </FormField>
        <FormField label="Last Name">
          <input
            type="text"
            required
            autoComplete="family-name"
            value={form.last_name}
            onChange={set('last_name')}
            onFocus={focus('last_name')}
            onBlur={blur}
            placeholder="Khan"
            style={inputStyle(isFocused('last_name'))}
          />
        </FormField>
      </div>

      {/* Email */}
      <FormField label="Email Address">
        <input
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          onFocus={focus('email')}
          onBlur={blur}
          placeholder="ahmad@example.com"
          style={inputStyle(isFocused('email'))}
        />
      </FormField>

      {/* Phone */}
      <FormField label="Phone Number">
        <input
          type="tel"
          required
          autoComplete="tel"
          value={form.phone}
          onChange={set('phone')}
          onFocus={focus('phone')}
          onBlur={blur}
          placeholder="+92 300 000 0000"
          style={inputStyle(isFocused('phone'))}
        />
      </FormField>

      {/* Property type */}
      <FormField label="Property Type">
        <div style={{ position: 'relative' }}>
          <select
            required
            value={form.preferred_property_type}
            onChange={set('preferred_property_type')}
            onFocus={focus('preferred_property_type')}
            onBlur={blur}
            style={{
              ...inputStyle(isFocused('preferred_property_type')),
              cursor: 'pointer',
              appearance: 'none',
              paddingRight: '36px',
            }}
          >
            <option value="" disabled>Select type…</option>
            <option value="RESIDENTIAL">Residential</option>
            <option value="COMMERCIAL">Commercial</option>
          </select>
          {/* Chevron icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              position: 'absolute',
              right: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#99907e',
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </FormField>

      {/* Budget range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormField label="Min Budget (PKR)">
          <input
            type="number"
            min="0"
            value={form.min_budget}
            onChange={set('min_budget')}
            onFocus={focus('min_budget')}
            onBlur={blur}
            placeholder="5,000,000"
            style={inputStyle(isFocused('min_budget'))}
          />
        </FormField>
        <FormField label="Max Budget (PKR)">
          <input
            type="number"
            min="0"
            value={form.max_budget}
            onChange={set('max_budget')}
            onFocus={focus('max_budget')}
            onBlur={blur}
            placeholder="50,000,000"
            style={inputStyle(isFocused('max_budget'))}
          />
        </FormField>
      </div>

      {/* Message */}
      <FormField label="Additional Requirements">
        <textarea
          rows={4}
          value={form.message}
          onChange={set('message')}
          onFocus={focus('message')}
          onBlur={blur}
          placeholder="Preferred location, bedrooms, timeline, or any other details…"
          style={{
            ...inputStyle(isFocused('message')),
            resize: 'vertical',
            minHeight: '100px',
          }}
        />
      </FormField>

      {/* Error message */}
      {errorMsg && (
        <div
          style={{
            backgroundColor: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="8" cy="8" r="7" stroke="#C9A84C" strokeWidth="1.25" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="#C9A84C" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-manrope)',
              fontSize: '13px',
              color: '#d0c5b2',
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </span>
        </div>
      )}

      {/* Submit */}
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
          padding: '16px 32px',
          border: 'none',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          width: '100%',
        }}
      >
        {isSubmitting ? (
          <>
            <SpinnerIcon />
            Submitting…
          </>
        ) : (
          <>
            Submit Enquiry
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </button>

      <p
        style={{
          fontFamily: 'var(--font-manrope)',
          fontSize: '11px',
          color: '#4d4637',
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Your information is kept strictly confidential and shared only with our verified agents.
      </p>
    </form>
  );
}

// ── Small primitives ──────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20 14" strokeLinecap="round" />
    </svg>
  );
}
