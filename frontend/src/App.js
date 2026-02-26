import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://olympicsdashboard.onrender.com";

const COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  accent1: "#00F5FF",
  accent2: "#FF006E",
  accent3: "#8338EC",
  bg: "#050A14",
  card: "#0D1B2A",
  cardBorder: "#1A2E45",
  text: "#E8F4FD",
  muted: "#6B8CAE",
};

function Card({ title, children, glow, style }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${COLORS.card} 0%, #0A1628 100%)`,
        border: `1px solid ${glow ? COLORS.accent1 : COLORS.cardBorder}`,
        borderRadius: 16,
        padding: "24px",
        boxShadow: glow
          ? `0 0 30px rgba(0,245,255,0.15), inset 0 0 60px rgba(0,245,255,0.02)`
          : `0 4px 24px rgba(0,0,0,0.4)`,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 13,
            letterSpacing: 3,
            color: COLORS.accent1,
            textTransform: "uppercase",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 4,
              height: 16,
              background: COLORS.accent1,
              borderRadius: 2,
              display: "inline-block",
            }}
          />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function PredictorPanel() {
  const [age, setAge] = useState(25);
  const [sex, setSex] = useState("M");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/predict-medal`, {
        params: { age, sex, height, weight },
        timeout: 10000,
      });
      if (res.data && res.data.medal_probability !== undefined) {
        setResult(res.data.medal_probability);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Backend unreachable");
      setResult(null);
    }
    setLoading(false);
  };

  const prob = result ?? 0;
  const color = prob > 50 ? "0,245,255" : prob > 25 ? "255,196,0" : "255,0,110";

  return (
    <Card title="🎯 Medal Probability Predictor" glow>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          { label: "Age", value: age, setter: setAge, min: 14, max: 70, step: 1 },
          { label: "Height (cm)", value: height, setter: setHeight, min: 140, max: 220, step: 1 },
          { label: "Weight (kg)", value: weight, setter: setWeight, min: 40, max: 150, step: 1 },
        ].map(({ label, value, setter, min, max, step }) => (
          <div key={label}>
            <label
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: COLORS.muted,
                letterSpacing: 1,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 4,
              }}
            >
              {label}: <span style={{ color: COLORS.accent1 }}>{value}</span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              style={{ width: "100%", accentColor: COLORS.accent1 }}
            />
          </div>
        ))}
        <div>
          <label
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: COLORS.muted,
              letterSpacing: 1,
              textTransform: "uppercase",
              display: "block",
              marginBottom: 6,
            }}
          >
            Gender
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["M", "F"].map((g) => (
              <button
                key={g}
                onClick={() => setSex(g)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: 8,
                  border: `1px solid ${sex === g ? COLORS.accent1 : COLORS.cardBorder}`,
                  background: sex === g ? "rgba(0,245,255,0.1)" : "transparent",
                  color: sex === g ? COLORS.accent1 : COLORS.muted,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {g === "M" ? "Male" : "Female"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={predict}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 10,
          background: `linear-gradient(135deg, rgba(0,245,255,0.2), rgba(131,56,236,0.2))`,
          border: `1px solid ${COLORS.accent1}`,
          color: COLORS.accent1,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 13,
          letterSpacing: 2,
          cursor: loading ? "not-allowed" : "pointer",
          marginBottom: 20,
          transition: "all 0.2s",
          textTransform: "uppercase",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Computing..." : "Predict →"}
      </button>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 12,
            background: "rgba(255,0,110,0.1)",
            border: "1px solid rgba(255,0,110,0.4)",
            color: "#FF006E",
            fontFamily: "'Space Mono', monospace",
            fontSize: 11,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {result !== null && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 52,
              fontWeight: 900,
              background: `linear-gradient(135deg, rgb(${color}), rgba(${color},0.5))`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1,
            }}
          >
            {prob.toFixed(1)}%
          </div>
          <div
            style={{
              color: COLORS.muted,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              marginTop: 8,
            }}
          >
            probability of winning a medal
          </div>
          <div
            style={{
              marginTop: 16,
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${prob}%`,
                height: "100%",
                borderRadius: 4,
                background: `linear-gradient(90deg, rgb(${color}), rgba(${color},0.5))`,
                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export default function App() {
  const [modelInfo, setModelInfo] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axios
      .get(`${API}/train-model`)
      .then((res) => setModelInfo(res.data))
      .catch(() => setModelInfo(null));
  }, []);

  const tabs = ["overview", "predict"];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />

      {/* Background grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(5,10,20,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          padding: "0 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent3})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              ⚡
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: 3,
                  color: COLORS.text,
                }}
              >
                OLYMPIX
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: COLORS.muted,
                  letterSpacing: 4,
                  marginTop: -2,
                }}
              >
                INTELLIGENCE DASHBOARD
              </div>
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display: "flex", gap: 4 }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  background: activeTab === tab ? "rgba(0,245,255,0.1)" : "transparent",
                  border: `1px solid ${activeTab === tab ? COLORS.accent1 : "transparent"}`,
                  color: activeTab === tab ? COLORS.accent1 : COLORS.muted,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 10,
                  letterSpacing: 2,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </nav>

          {modelInfo?.accuracy && (
            <div
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: `1px solid rgba(0,245,255,0.3)`,
                background: "rgba(0,245,255,0.05)",
              }}
            >
              <span style={{ color: COLORS.muted, fontSize: 9, letterSpacing: 2 }}>
                MODEL ACC{" "}
              </span>
              <span
                style={{
                  color: COLORS.accent1,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {(modelInfo.accuracy * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "32px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 24 }}>
            <Card title="📊 System Status">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    padding: "20px",
                    borderRadius: 12,
                    background: "rgba(255,196,0,0.05)",
                    border: "1px solid rgba(255,196,0,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>⚠️</span>
                    <span
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 14,
                        color: "#FFC400",
                        letterSpacing: 1,
                      }}
                    >
                      ANALYTICS OFFLINE
                    </span>
                  </div>
                  <p
                    style={{
                      color: COLORS.muted,
                      fontSize: 12,
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    Analytics endpoints are currently disabled because the backend does
                    not load the dataset.
                  </p>
                </div>

                <div
                  style={{
                    padding: "20px",
                    borderRadius: 12,
                    background: "rgba(0,245,255,0.05)",
                    border: "1px solid rgba(0,245,255,0.2)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>✅</span>
                    <span
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 14,
                        color: COLORS.accent1,
                        letterSpacing: 1,
                      }}
                    >
                      ML ENDPOINTS ACTIVE
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {["/predict-medal", "/train-model"].map((endpoint) => (
                      <span
                        key={endpoint}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          background: "rgba(0,245,255,0.1)",
                          border: "1px solid rgba(0,245,255,0.3)",
                          color: COLORS.accent1,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 11,
                        }}
                      >
                        {endpoint}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="🚀 Quick Actions">
              <p style={{ color: COLORS.muted, fontSize: 12, marginBottom: 16 }}>
                Navigate to the <strong style={{ color: COLORS.accent1 }}>Predict</strong> tab to
                use the Medal Probability Predictor.
              </p>
              <button
                onClick={() => setActiveTab("predict")}
                style={{
                  padding: "12px 24px",
                  borderRadius: 10,
                  background: `linear-gradient(135deg, rgba(0,245,255,0.2), rgba(131,56,236,0.2))`,
                  border: `1px solid ${COLORS.accent1}`,
                  color: COLORS.accent1,
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 12,
                  letterSpacing: 2,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
              >
                Go to Predictor →
              </button>
            </Card>
          </div>
        )}

        {/* PREDICT TAB */}
        {activeTab === "predict" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <PredictorPanel />

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Card title="🤖 Model Info">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    ["Algorithm", modelInfo?.model || "Random Forest Classifier"],
                    ["Training Features", "Age, Sex, Height, Weight"],
                    [
                      "Model Accuracy",
                      modelInfo?.accuracy
                        ? `${(modelInfo.accuracy * 100).toFixed(2)}%`
                        : "Loading...",
                    ],
                    ["Dataset", "120+ Years of Olympic Data"],
                    ["Athletes", "271,116 entries"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: `1px solid ${COLORS.cardBorder}`,
                      }}
                    >
                      <span style={{ color: COLORS.muted, fontSize: 11 }}>{k}</span>
                      <span
                        style={{ color: COLORS.accent1, fontSize: 11, fontWeight: 700 }}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {modelInfo?.feature_importance && (
                <Card title="📊 Feature Importance">
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(modelInfo.feature_importance).map(([feature, importance]) => (
                      <div key={feature}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <span
                            style={{
                              color: COLORS.text,
                              fontSize: 11,
                              textTransform: "capitalize",
                            }}
                          >
                            {feature}
                          </span>
                          <span style={{ color: COLORS.accent1, fontSize: 11 }}>
                            {(importance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "rgba(255,255,255,0.05)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${importance * 100}%`,
                              height: "100%",
                              borderRadius: 3,
                              background: `linear-gradient(90deg, ${COLORS.accent1}, ${COLORS.accent3})`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card title="💡 Top Insights">
                <div style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 12, color: COLORS.text }}>
                    🏅 Key patterns from the data:
                  </p>
                  <p>
                    • Athletes aged{" "}
                    <span style={{ color: COLORS.accent1 }}>22–28</span> have the
                    highest medal probability.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    • <span style={{ color: COLORS.accent1 }}>Height & weight</span>{" "}
                    matter more in sports like Swimming and Rowing.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    • Female participation has grown{" "}
                    <span style={{ color: COLORS.accent2 }}>500%</span> since 1960.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    • The US, Russia, and Germany dominate total medal counts
                    historically.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "32px",
          borderTop: `1px solid ${COLORS.cardBorder}`,
          color: COLORS.muted,
          fontSize: 10,
          letterSpacing: 2,
          marginTop: 40,
        }}
      >
        OLYMPIX INTELLIGENCE · BUILT WITH FASTAPI + REACT · 120 YEARS OF OLYMPIC DATA
      </footer>
    </div>
  );
}
