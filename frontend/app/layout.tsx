import type { Metadata } from "next";
import { Epilogue, Manrope, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// ── Google Fonts ────────────────────────────────────────────────────────────
const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

// ── Metadata ────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Ventures 92 | Premium Real Estate",
    template: "%s | Ventures 92",
  },
  description:
    "Exclusive residential and commercial properties across Pakistan's finest developments.",
};

// ── Navbar ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/projects",   label: "Projects"   },
  { href: "/about",      label: "About"      },
  { href: "/contact",    label: "Contact"    },
] as const;

function Navbar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: "rgba(255, 255, 255, 0.10)",
        borderBottom: "1px solid rgba(201, 168, 76, 0.25)",
      }}
    >
      <nav
        className="flex items-center justify-between h-16 mx-auto"
        style={{ paddingInline: "var(--spacing-margin)", maxWidth: "1600px" }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-gold font-extrabold uppercase shrink-0"
          style={{
            fontFamily: "var(--font-epilogue)",
            fontSize: "18px",
            letterSpacing: "0.18em",
          }}
        >
          VENTURES 92
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-on-surface-muted hover:text-gold transition-colors duration-200"
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/contact"
          className="hidden md:inline-block bg-gold text-charcoal font-bold uppercase hover:bg-gold-hover transition-colors duration-200"
          style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "11px",
            letterSpacing: "0.12em",
            padding: "12px 24px",
          }}
        >
          Book Consultation
        </Link>
      </nav>
    </header>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────
const FOOTER_COLS = [
  {
    heading: "Properties",
    links: [
      { href: "/properties?property_type=RESIDENTIAL", label: "Residential" },
      { href: "/properties?property_type=COMMERCIAL",  label: "Commercial"  },
      { href: "/properties?is_featured=true",           label: "Featured"    },
      { href: "/properties?availability_status=AVAILABLE", label: "Available Now" },
    ],
  },
  {
    heading: "Projects",
    links: [
      { href: "/projects",                                  label: "All Projects"        },
      { href: "/projects?status=UNDER_CONSTRUCTION",        label: "Under Construction"  },
      { href: "/projects?status=COMPLETED",                 label: "Completed"           },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",      label: "About Us"           },
      { href: "/#partners",  label: "Corporate Partners" },
      { href: "/contact",    label: "Contact"            },
      { href: "/admin/dashboard", label: "Admin Portal"  },
    ],
  },
] as const;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#100e08",
        borderTop: "1px solid rgba(201, 168, 76, 0.20)",
      }}
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: "1600px",
          paddingInline: "var(--spacing-margin)",
          paddingBlock: "var(--spacing-section)",
        }}
      >
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <span
              className="text-gold font-extrabold uppercase"
              style={{
                fontFamily: "var(--font-epilogue)",
                fontSize: "16px",
                letterSpacing: "0.18em",
              }}
            >
              VENTURES 92
            </span>
            <span
              className="uppercase"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "#99907e",
              }}
            >
              Premium Real Estate
            </span>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "#d0c5b2" }}
            >
              Pakistan&apos;s premier destination for exclusive residential
              and commercial properties.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.heading}>
              <p
                className="uppercase mb-5"
                style={{
                  fontFamily: "var(--font-manrope)",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: "#C9A84C",
                }}
              >
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
                {col.links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-on-surface-muted hover:text-gold transition-colors duration-200"
                      style={{ fontFamily: "var(--font-manrope)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(201, 168, 76, 0.15)" }}
        >
          <div className="flex flex-col sm:flex-row gap-6">
            <a
              href="tel:+923039640744"
              className="text-on-surface-muted hover:text-gold transition-colors duration-200"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              +92 303 964 0744
            </a>
            <a
              href="https://wa.me/923039640744"
              className="text-on-surface-muted hover:text-gold transition-colors duration-200"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              WhatsApp
            </a>
          </div>
          <p
            style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "11px",
              color: "#4d4637",
            }}
          >
            © {year} Ventures 92. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── WhatsApp icon ────────────────────────────────────────────────────────────
function WhatsAppIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ── Root layout ─────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${epilogue.variable} ${manrope.variable} ${spaceGrotesk.variable}`}
    >
      <body className="flex flex-col min-h-dvh">
        <Navbar />
        {/* pt-16 offsets the fixed navbar height */}
        <main className="flex-1 pt-16">{children}</main>
        <Footer />

        {/* ── Floating WhatsApp button — visible on all pages ─────── */}
        <a
          href="https://wa.me/923039640744"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className="hover:scale-110 transition-transform duration-200 group"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 50,
            width: '56px',
            height: '56px',
            backgroundColor: '#1e1b15',
            border: '1px solid #C9A84C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#C9A84C',
            boxShadow: '0 4px 24px rgba(201,168,76,0.15)',
          }}
        >
          <WhatsAppIcon />
        </a>
      </body>
    </html>
  );
}
