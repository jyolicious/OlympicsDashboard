import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Bar, Pie, Line, Radar, Doughnut
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, RadialLinearScale,
  Tooltip, Legend, Filler
} from "chart.js";

ChartJS.register(
  ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, RadialLinearScale,
  Tooltip, Legend, Filler
);

const API = "http://127.0.0.1:8000";

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

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: COLORS.text, font: { family: "'Space Mono', monospace", size: 11 } }
    },
    tooltip: {
      backgroundColor: "#0D1B2A",
      borderColor: COLORS.accent1,
      borderWidth: 1,
      titleColor: COLORS.accent1,
      bodyColor: COLORS.text,
    }
  },
  scales: {
    x: {
      ticks: { color: COLORS.muted, font: { family: "'Space Mono', monospace", size: 10 } },
      grid: { color: "rgba(0,245,255,0.05)" }
    },
    y: {
      ticks: { color: COLORS.muted, font: { family: "'Space Mono', monospace", size: 10 } },
      grid: { color: "rgba(0,245,255,0.05)" }
    }
  }
};

function Card({ title, children, glow, style }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.card} 0%, #0A1628 100%)`,
      border: `1px solid ${glow ? COLORS.accent1 : COLORS.cardBorder}`,
      borderRadius: 16,
      padding: "24px",
      boxShadow: glow
        ? `0 0 30px rgba(0,245,255,0.15), inset 0 0 60px rgba(0,245,255,0.02)`
        : `0 4px 24px rgba(0,0,0,0.4)`,
      ...style
    }}>
      {title && (
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 13,
          letterSpacing: 3,
          color: COLORS.accent1,
          textTransform: "uppercase",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          <span style={{ width: 4, height: 16, background: COLORS.accent1, borderRadius: 2, display: "inline-block" }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(${color},0.1) 0%, rgba(${color},0.05) 100%)`,
      border: `1px solid rgba(${color},0.3)`,
      borderRadius: 12,
      padding: "14px 20px",
      textAlign: "center",
      flex: 1
    }}>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 22, fontWeight: 700, color: `rgb(${color})` }}>
        {value ?? "—"}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.muted, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 2, textTransform: "uppercase" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: "#0A1628",
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: 8,
          color: COLORS.text,
          padding: "8px 12px",
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          cursor: "pointer",
          outline: "none",
          minWidth: 140,
        }}
      >
        <option value="">{placeholder || "All"}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function PredictorPanel() {
  const [age, setAge] = useState(25);
  const [sex, setSex] = useState("M");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const predict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/predict-medal`, {
        params: { age, sex, height, weight },
        timeout: 10000
      });
      if (res.data && res.data.medal_probability !== undefined) {
        setResult(res.data.medal_probability);
      } else {
        setError("Unexpected response from server");
      }
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Could not connect to backend");
      setResult(null);
    }
    setLoading(false);
  };

  const prob = result ?? 0;
  const color = prob > 50 ? "0,245,255" : prob > 25 ? "255,196,0" : "255,0,110";

  return (
    <Card title="🎯 Medal Probability Predictor" glow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Age", value: age, setter: setAge, min: 14, max: 70, step: 1 },
          { label: "Height (cm)", value: height, setter: setHeight, min: 140, max: 220, step: 1 },
          { label: "Weight (kg)", value: weight, setter: setWeight, min: 40, max: 150, step: 1 },
        ].map(({ label, value, setter, min, max, step }) => (
          <div key={label}>
            <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              {label}: <span style={{ color: COLORS.accent1 }}>{value}</span>
            </label>
            <input
              type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(Number(e.target.value))}
              style={{ width: "100%", accentColor: COLORS.accent1 }}
            />
          </div>
        ))}
        <div>
          <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Gender</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["M", "F"].map(g => (
              <button key={g} onClick={() => setSex(g)} style={{
                flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${sex === g ? COLORS.accent1 : COLORS.cardBorder}`,
                background: sex === g ? "rgba(0,245,255,0.1)" : "transparent",
                color: sex === g ? COLORS.accent1 : COLORS.muted,
                fontFamily: "'Orbitron', sans-serif", fontSize: 12, cursor: "pointer"
              }}>{g === "M" ? "Male" : "Female"}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={predict} disabled={loading} style={{
        width: "100%", padding: "14px", borderRadius: 10,
        background: `linear-gradient(135deg, rgba(0,245,255,0.2), rgba(131,56,236,0.2))`,
        border: `1px solid ${COLORS.accent1}`,
        color: COLORS.accent1, fontFamily: "'Orbitron', sans-serif", fontSize: 13,
        letterSpacing: 2, cursor: "pointer", marginBottom: 20,
        transition: "all 0.2s", textTransform: "uppercase"
      }}>
        {loading ? "Computing..." : "Predict →"}
      </button>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 12,
          background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.4)',
          color: '#FF006E', fontFamily: "'Space Mono', monospace", fontSize: 11
        }}>
          ⚠ {error}
        </div>
      )}

      {result !== null && (
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 52, fontWeight: 900,
            background: `linear-gradient(135deg, rgb(${color}), rgba(${color},0.5))`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1
          }}>
            {prob.toFixed(1)}%
          </div>
          <div style={{ color: COLORS.muted, fontFamily: "'Space Mono', monospace", fontSize: 11, marginTop: 8 }}>
            probability of winning a medal
          </div>
          <div style={{
            marginTop: 16, height: 8, borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${prob}%`, height: "100%", borderRadius: 4,
              background: `linear-gradient(90deg, rgb(${color}), rgba(${color},0.5))`,
              transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            }} />
          </div>
        </div>
      )}
    </Card>
  );
}

export default function App() {
  const [countries, setCountries] = useState([]);
  const [sports, setSports] = useState([]);
  const [years, setYears] = useState([]);

  // Filters
  const [filterCountry, setFilterCountry] = useState("");
  const [filterSeason, setFilterSeason] = useState("Summer");
  const [filterSport, setFilterSport] = useState("");

  // Data
  const [medals, setMedals] = useState({});
  const [medalTypes, setMedalTypes] = useState({});
  const [gender, setGender] = useState({});
  const [ageDistrib, setAgeDistrib] = useState({});
  const [medalsTime, setMedalsTime] = useState({});
  const [topSports, setTopSports] = useState({});
  const [avgAge, setAvgAge] = useState({});
  const [genderTime, setGenderTime] = useState({});
  const [modelAcc, setModelAcc] = useState(null);
  const [countryStats, setCountryStats] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    axios.get(`${API}/filters/countries`).then(r => setCountries(r.data.countries));
    axios.get(`${API}/filters/sports`).then(r => setSports(r.data.sports));
    axios.get(`${API}/filters/years`).then(r => setYears(r.data.years));
    axios.get(`${API}/train-model`).then(r => setModelAcc(r.data.accuracy));
    axios.get(`${API}/gender-over-time`, { params: { season: "Summer" } }).then(r => setGenderTime(r.data));
  }, []);

  useEffect(() => {
    const params = {
      ...(filterCountry && { country: filterCountry }),
      ...(filterSeason && { season: filterSeason }),
    };
    axios.get(`${API}/medals-by-country`, { params }).then(r => setMedals(r.data));
    axios.get(`${API}/medals-by-type`).then(r => setMedalTypes(r.data));
    axios.get(`${API}/gender-distribution`, { params: { ...params, ...(filterSport && { sport: filterSport }) } }).then(r => setGender(r.data));
    axios.get(`${API}/age-distribution`, { params: { ...(filterCountry && { country: filterCountry }), ...(filterSport && { sport: filterSport }) } }).then(r => setAgeDistrib(r.data));
    axios.get(`${API}/medals-over-time`, { params }).then(r => setMedalsTime(r.data));
    axios.get(`${API}/top-sports-by-medals`, { params: { ...(filterCountry && { country: filterCountry }) } }).then(r => setTopSports(r.data));
    axios.get(`${API}/avg-age-by-sport`, { params: { ...(filterCountry && { country: filterCountry }) } }).then(r => setAvgAge(r.data));
    if (filterCountry) {
      axios.get(`${API}/country-stats`, { params: { country: filterCountry } }).then(r => setCountryStats(r.data));
    } else {
      setCountryStats(null);
    }
  }, [filterCountry, filterSeason, filterSport]);

  const goldData = medalTypes["Gold"] || {};
  const silverData = medalTypes["Silver"] || {};
  const bronzeData = medalTypes["Bronze"] || {};
  const medalTypeCountries = Object.keys(goldData);

  // ── Chart datasets ──────────────────────────────────────────────────────────

  const barMedals = {
    labels: Object.keys(medals),
    datasets: [{
      label: "Medals",
      data: Object.values(medals),
      backgroundColor: Object.keys(medals).map((_, i) =>
        `hsla(${180 + i * 15}, 80%, 60%, 0.8)`
      ),
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const stackedMedals = {
    labels: medalTypeCountries,
    datasets: [
      { label: "Gold", data: medalTypeCountries.map(c => goldData[c] || 0), backgroundColor: "rgba(255,215,0,0.8)", borderRadius: 4 },
      { label: "Silver", data: medalTypeCountries.map(c => silverData[c] || 0), backgroundColor: "rgba(192,192,192,0.8)", borderRadius: 4 },
      { label: "Bronze", data: medalTypeCountries.map(c => bronzeData[c] || 0), backgroundColor: "rgba(205,127,50,0.8)", borderRadius: 4 },
    ]
  };

  const pieGender = {
    labels: ["Male", "Female"],
    datasets: [{
      data: [gender["M"] || 0, gender["F"] || 0],
      backgroundColor: ["rgba(0,245,255,0.8)", "rgba(255,0,110,0.8)"],
      borderColor: [COLORS.accent1, COLORS.accent2],
      borderWidth: 2
    }]
  };

  const lineAge = {
    labels: Object.keys(ageDistrib),
    datasets: [{
      label: "Athletes",
      data: Object.values(ageDistrib),
      borderColor: COLORS.accent3,
      backgroundColor: "rgba(131,56,236,0.2)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: COLORS.accent3,
      pointRadius: 4
    }]
  };

  const lineMedalsTime = {
    labels: Object.keys(medalsTime),
    datasets: [{
      label: "Total Medals",
      data: Object.values(medalsTime),
      borderColor: COLORS.gold,
      backgroundColor: "rgba(255,215,0,0.1)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: COLORS.gold,
      pointRadius: 3
    }]
  };

  const barSports = {
    labels: Object.keys(topSports),
    datasets: [{
      label: "Medals",
      data: Object.values(topSports),
      backgroundColor: "rgba(255,0,110,0.7)",
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const barAvgAge = {
    labels: Object.keys(avgAge),
    datasets: [{
      label: "Avg Age",
      data: Object.values(avgAge),
      backgroundColor: "rgba(131,56,236,0.7)",
      borderRadius: 6,
      borderSkipped: false,
    }]
  };

  const genderYears = Object.keys(genderTime["M"] || {}).map(Number).sort();
  const lineGenderTime = {
    labels: genderYears,
    datasets: [
      {
        label: "Male",
        data: genderYears.map(y => (genderTime["M"] || {})[y] || 0),
        borderColor: COLORS.accent1,
        backgroundColor: "rgba(0,245,255,0.05)",
        fill: true, tension: 0.3, pointRadius: 2
      },
      {
        label: "Female",
        data: genderYears.map(y => (genderTime["F"] || {})[y] || 0),
        borderColor: COLORS.accent2,
        backgroundColor: "rgba(255,0,110,0.05)",
        fill: true, tension: 0.3, pointRadius: 2
      }
    ]
  };

  const tabs = ["overview", "medals", "athletes", "predict"];

  return (
    <div style={{
      minHeight: "100vh",
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Space Mono', monospace",
    }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />

      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        pointerEvents: "none"
      }} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(5,10,20,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        padding: "0 40px",
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent3})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20
            }}>⚡</div>
            <div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: 3, color: COLORS.text }}>
                OLYMPIX
              </div>
              <div style={{ fontSize: 9, color: COLORS.muted, letterSpacing: 4, marginTop: -2 }}>INTELLIGENCE DASHBOARD</div>
            </div>
          </div>

          {/* Tabs */}
          <nav style={{ display: "flex", gap: 4 }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "8px 20px", borderRadius: 8,
                background: activeTab === tab ? "rgba(0,245,255,0.1)" : "transparent",
                border: `1px solid ${activeTab === tab ? COLORS.accent1 : "transparent"}`,
                color: activeTab === tab ? COLORS.accent1 : COLORS.muted,
                fontFamily: "'Orbitron', sans-serif", fontSize: 10, letterSpacing: 2,
                cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s"
              }}>{tab}</button>
            ))}
          </nav>

          {modelAcc && (
            <div style={{
              padding: "6px 16px", borderRadius: 20,
              border: `1px solid rgba(0,245,255,0.3)`,
              background: "rgba(0,245,255,0.05)"
            }}>
              <span style={{ color: COLORS.muted, fontSize: 9, letterSpacing: 2 }}>MODEL ACC </span>
              <span style={{ color: COLORS.accent1, fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700 }}>
                {(modelAcc * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Filters Bar */}
      <div style={{
        background: "rgba(13,27,42,0.8)",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        padding: "16px 40px",
        position: "sticky", top: 70, zIndex: 90,
        backdropFilter: "blur(10px)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: COLORS.muted, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginRight: 8 }}>⚙ Filters</span>
          <Select label="Country" value={filterCountry} onChange={setFilterCountry} options={countries} placeholder="All Countries" />
          <Select label="Season" value={filterSeason} onChange={setFilterSeason} options={["Summer", "Winter"]} placeholder="All Seasons" />
          <Select label="Sport" value={filterSport} onChange={setFilterSport} options={sports} placeholder="All Sports" />
          {(filterCountry || filterSport) && (
            <button onClick={() => { setFilterCountry(""); setFilterSport(""); setFilterSeason("Summer"); }} style={{
              marginTop: 16, padding: "6px 14px", borderRadius: 6,
              border: `1px solid ${COLORS.cardBorder}`,
              background: "transparent", color: COLORS.muted,
              fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: "pointer"
            }}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 40px", position: "relative", zIndex: 1 }}>

        {/* Country Stats Strip */}
        {countryStats && (
          <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
            <StatBadge label="Total Athletes" value={countryStats.total_athletes?.toLocaleString()} color="0,245,255" />
            <StatBadge label="Gold Medals" value={countryStats.gold?.toLocaleString()} color="255,215,0" />
            <StatBadge label="Silver Medals" value={countryStats.silver?.toLocaleString()} color="192,192,192" />
            <StatBadge label="Bronze Medals" value={countryStats.bronze?.toLocaleString()} color="205,127,50" />
            <StatBadge label="Avg Athlete Age" value={countryStats.avg_age} color="131,56,236" />
            <StatBadge label="Best Sport" value={countryStats.best_sport} color="255,0,110" />
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gap: 24 }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
              <Card title="Top Countries by Total Medals">
                <div style={{ height: 300 }}>
                  <Bar data={barMedals} options={{ ...chartDefaults }} />
                </div>
              </Card>
              <Card title="Gender Distribution">
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Doughnut
                    data={pieGender}
                    options={{
                      ...chartDefaults,
                      cutout: "65%",
                      scales: undefined,
                      plugins: {
                        ...chartDefaults.plugins,
                        legend: { ...chartDefaults.plugins.legend, position: "bottom" }
                      }
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Card title="Medals Won Over Time">
                <div style={{ height: 260 }}>
                  <Line data={lineMedalsTime} options={chartDefaults} />
                </div>
              </Card>
              <Card title="👫 Gender Participation Over Time">
                <div style={{ height: 260 }}>
                  <Line data={lineGenderTime} options={chartDefaults} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MEDALS TAB */}
        {activeTab === "medals" && (
          <div style={{ display: "grid", gap: 24 }}>
            <Card title="🥇🥈🥉 Medal Types by Country">
              <div style={{ height: 340 }}>
                <Bar data={stackedMedals} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins }, scales: { ...chartDefaults.scales, x: { ...chartDefaults.scales.x, stacked: true }, y: { ...chartDefaults.scales.y, stacked: true } } }} />
              </div>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Card title="Top Sports by Medals">
                <div style={{ height: 300 }}>
                  <Bar
                    data={barSports}
                    options={{ ...chartDefaults, indexAxis: "y" }}
                  />
                </div>
              </Card>
              <Card title="Medal Trend Over Years">
                <div style={{ height: 300 }}>
                  <Line data={lineMedalsTime} options={chartDefaults} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ATHLETES TAB */}
        {activeTab === "athletes" && (
          <div style={{ display: "grid", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Card title="Age Distribution of Athletes">
                <div style={{ height: 300 }}>
                  <Line data={lineAge} options={chartDefaults} />
                </div>
              </Card>
              <Card title="⚥ Gender Split">
                <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Pie data={pieGender} options={{ ...chartDefaults, scales: undefined, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend, position: "bottom" } } }} />
                </div>
              </Card>
            </div>
            <Card title="Average Athlete Age by Sport">
              <div style={{ height: 300 }}>
                <Bar
                  data={barAvgAge}
                  options={{ ...chartDefaults, indexAxis: "y" }}
                />
              </div>
            </Card>
            <Card title="Gender Representation Over Decades">
              <div style={{ height: 280 }}>
                <Line data={lineGenderTime} options={chartDefaults} />
              </div>
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
                    ["Algorithm", "Random Forest Classifier"],
                    ["Training Features", "Age, Gender, Height, Weight"],
                    ["LR Model Accuracy", modelAcc ? `${(modelAcc * 100).toFixed(2)}%` : "Loading..."],
                    ["Dataset", "120+ Years of Olympic Data"],
                    ["Athletes", "271,116 entries"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                      <span style={{ color: COLORS.muted, fontSize: 11 }}>{k}</span>
                      <span style={{ color: COLORS.accent1, fontSize: 11, fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card title="Top Insight">
                <div style={{ color: COLORS.muted, fontSize: 12, lineHeight: 1.8 }}>
                  <p style={{ marginBottom: 12, color: COLORS.text }}>🏅 Key patterns from the data:</p>
                  <p>• Athletes aged <span style={{ color: COLORS.accent1 }}>22–28</span> have the highest medal probability.</p>
                  <p style={{ marginTop: 8 }}>• <span style={{ color: COLORS.accent1 }}>Height & weight</span> matter more in some sports like Swimming and Rowing.</p>
                  <p style={{ marginTop: 8 }}>• Female participation has grown <span style={{ color: COLORS.accent2 }}>500%</span> since 1960.</p>
                  <p style={{ marginTop: 8 }}>• The US, Russia, and Germany dominate total medal counts historically.</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "32px",
        borderTop: `1px solid ${COLORS.cardBorder}`,
        color: COLORS.muted, fontSize: 10, letterSpacing: 2,
        marginTop: 40
      }}>
        OLYMPIX INTELLIGENCE · BUILT WITH FASTAPI + REACT · 120 YEARS OF OLYMPIC DATA
      </footer>
    </div>
  );
}