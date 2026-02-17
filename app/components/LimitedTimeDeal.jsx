import React, { useEffect, useMemo, useState } from "react";

export default function SitewidePromoSection() {
  const endsAt = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Math.max(0, endsAt.getTime() - now);

  const { days, hours, minutes, seconds, done } = useMemo(() => {
    const total = remaining;
    const s = Math.floor(total / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    return { days, hours, minutes, seconds, done: total <= 0 };
  }, [remaining]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section
      aria-label="Sitewide discount promotion"
      className="hidden md:block" // Apply responsive classes here
      style={{
        background: "#fff",
        color: "#000",
        padding: "clamp(20px, 4vw, 56px)",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          position: "relative",
          border: "3px solid #000",
          padding: "clamp(18px, 3.5vw, 44px)",
          overflow: "hidden",
        }}
      >
        {/* Minimal geometric accents */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -18,
              left: -18,
              width: 120,
              height: 120,
              border: "3px solid #000",
              background: "#fff",
              transform: "rotate(8deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -22,
              right: -22,
              width: 160,
              height: 160,
              background: "#000",
              transform: "rotate(-6deg)",
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr",
            gap: "clamp(16px, 3vw, 28px)",
            alignItems: "stretch",
          }}
        >
          {/* Left Column: Copy */}
          <div
            style={{
              border: "3px solid #000",
              padding: "clamp(14px, 2.6vw, 22px)",
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                border: "3px solid #000",
                padding: "8px 10px",
                width: "fit-content",
              }}
            >
              <span style={{ width: 10, height: 10, background: "#000" }} />
              <span style={{ fontWeight: 800, letterSpacing: "0.18em", fontSize: 12 }}>
                LIMITED TIME
              </span>
            </div>

            <h2
              style={{
                margin: 0,
                fontWeight: 900,
                lineHeight: 0.95,
                fontSize: "clamp(34px, 4.2vw, 64px)",
                textTransform: "uppercase",
              }}
            >
              Sitewide
              <br />
              Discount
            </h2>

            <p style={{ margin: 0, fontSize: "clamp(14px, 1.35vw, 16px)", lineHeight: 1.5 }}>
              Bold savings across the entire store. Clean, minimal, and built to stand out.
            </p>

            <a
              href="#shop"
              style={{
                display: "inline-block",
                width: "fit-content",
                background: "#000",
                color: "#fff",
                padding: "12px 24px",
                fontWeight: 900,
                textDecoration: "none",
                textTransform: "uppercase",
                border: "3px solid #000",
                marginTop: 10
              }}
            >
              Shop now
            </a>
          </div>

          {/* Right Column: Countdown & Code */}
          <div
            style={{
              border: "3px solid #000",
              background: "#fff",
              padding: "clamp(14px, 2.6vw, 22px)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Timer Section */}
            <div style={{ border: "3px solid #000", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                <span>Countdown</span>
                <span>{done ? "Ended" : "Ends soon"}</span>
              </div>

              <div
                role="timer"
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 8,
                }}
              >
                <TimeBox label="Days" value={String(days)} />
                <TimeBox label="Hrs" value={pad(hours)} />
                <TimeBox label="Mins" value={pad(minutes)} />
                <TimeBox label="Secs" value={pad(seconds)} />
              </div>
            </div>

            {/* Code Section */}
            <div style={{ border: "3px solid #000", padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 900, fontSize: 12, textTransform: "uppercase" }}>Code</span>
                <span
                  style={{
                    border: "3px solid #000",
                    padding: "6px 12px",
                    fontWeight: 900,
                    fontSize: 18,
                    background: "#000",
                    color: "#fff"
                  }}
                >
                  SAVE10
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }) {
  return (
    <div
      style={{
        border: "3px solid #000",
        padding: "10px 2px",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 0,
      }}
    >
      <div style={{ fontWeight: 1000, fontSize: "clamp(18px, 2vw, 24px)", lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: "9px",
          fontWeight: 900,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
}