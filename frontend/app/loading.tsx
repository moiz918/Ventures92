export default function Loading() {
  return (
    <div
      style={{
        backgroundColor: '#16130d',
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          aria-hidden="true"
          style={{ animation: 'spin 1.2s linear infinite' }}
        >
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#4d4637"
            strokeWidth="2"
          />
          <path
            d="M36 20a16 16 0 0 0-16-16"
            stroke="#C9A84C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-manrope)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#4d4637',
          }}
        >
          Loading
        </span>
      </div>
    </div>
  );
}
