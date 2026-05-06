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
          href="/consultation"
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
      { href: "/partners",   label: "Corporate Partners" },
      { href: "/contact",    label: "Contact"            },
      { href: "/dashboard",  label: "Admin Portal"       },
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
              href="tel:+923001234567"
              className="text-on-surface-muted hover:text-gold transition-colors duration-200"
              style={{
                fontFamily: "var(--font-manrope)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              +92 300 123 4567
            </a>
            <a
              href="https://wa.me/923001234567"
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
      </body>
    </html>
  );
}
