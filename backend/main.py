from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import pickle


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://olympicsdashboard-1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===============================
# Load Pre-Trained Models (NO TRAINING)
# ===============================
print("Loading pre-trained models...")
_lr = pickle.load(open("lr_model.pkl", "rb"))
_rf = pickle.load(open("rf_model.pkl", "rb"))
print("Models loaded successfully.")


# === Filters ===

@app.get("/")
def home():
    return {"message": "Olympics ML Backend Running"}

@app.get("/filters/countries")
def get_countries():
    return {"countries": sorted(df["region"].dropna().unique().tolist())}

@app.get("/filters/sports")
def get_sports():
    return {"sports": sorted(df["Sport"].dropna().unique().tolist())}

@app.get("/filters/years")
def get_years():
    return {"years": sorted(df["Year"].dropna().unique().astype(int).tolist())}


# === Charts ===

@app.get("/medals-by-country")
def medals_by_country(top: int = Query(10), year: int = Query(None), season: str = Query(None)):
    medal_df = df[df["Medal"].notna()].copy()
    if year:
        medal_df = medal_df[medal_df["Year"] == year]
    if season:
        medal_df = medal_df[medal_df["Season"] == season]
    result = medal_df.groupby("region")["Medal"].count().sort_values(ascending=False).head(top)
    return result.to_dict()

@app.get("/medals-by-type")
def medals_by_type(country: str = Query(None), year: int = Query(None)):
    medal_df = df[df["Medal"].notna()].copy()
    if country:
        medal_df = medal_df[medal_df["region"] == country]
    if year:
        medal_df = medal_df[medal_df["Year"] == year]
    top_countries = medal_df.groupby("region")["Medal"].count().sort_values(ascending=False).head(10).index
    medal_df = medal_df[medal_df["region"].isin(top_countries)]
    pivot = medal_df.groupby(["region", "Medal"]).size().unstack(fill_value=0)
    return pivot.to_dict()

@app.get("/gender-distribution")
def gender_distribution(country: str = Query(None), year: int = Query(None), sport: str = Query(None)):
    fdf = df.copy()
    if country:
        fdf = fdf[fdf["region"] == country]
    if year:
        fdf = fdf[fdf["Year"] == year]
    if sport:
        fdf = fdf[fdf["Sport"] == sport]
    return fdf["Sex"].value_counts().to_dict()

@app.get("/age-distribution")
def age_distribution(country: str = Query(None), sport: str = Query(None)):
    fdf = df.dropna(subset=["Age"]).copy()
    if country:
        fdf = fdf[fdf["region"] == country]
    if sport:
        fdf = fdf[fdf["Sport"] == sport]
    bins = list(range(10, 80, 5))
    labels = [f"{b}-{b+4}" for b in bins[:-1]]
    fdf["AgeGroup"] = pd.cut(fdf["Age"], bins=bins, labels=labels)
    return fdf["AgeGroup"].value_counts().sort_index().to_dict()

@app.get("/medals-over-time")
def medals_over_time(country: str = Query(None), season: str = Query(None)):
    medal_df = df[df["Medal"].notna()].copy()
    if country:
        medal_df = medal_df[medal_df["region"] == country]
    if season:
        medal_df = medal_df[medal_df["Season"] == season]
    return medal_df.groupby("Year")["Medal"].count().sort_index().to_dict()

@app.get("/top-sports-by-medals")
def top_sports_by_medals(country: str = Query(None), top: int = Query(10)):
    medal_df = df[df["Medal"].notna()].copy()
    if country:
        medal_df = medal_df[medal_df["region"] == country]
    return medal_df.groupby("Sport")["Medal"].count().sort_values(ascending=False).head(top).to_dict()

@app.get("/avg-age-by-sport")
def avg_age_by_sport(country: str = Query(None), top: int = Query(10)):
    fdf = df.dropna(subset=["Age"]).copy()
    if country:
        fdf = fdf[fdf["region"] == country]
    result = fdf.groupby("Sport")["Age"].mean().sort_values(ascending=False).head(top)
    return {k: round(v, 1) for k, v in result.to_dict().items()}

@app.get("/gender-over-time")
def gender_over_time(season: str = Query("Summer")):
    fdf = df[df["Season"] == season].copy() if season else df.copy()
    pivot = fdf.drop_duplicates(subset=["ID","Year"]).groupby(["Year","Sex"]).size().unstack(fill_value=0)
    return pivot.to_dict()

@app.get("/athlete-count-over-time")
def athlete_count_over_time(season: str = Query("Summer")):
    fdf = df[df["Season"] == season].copy() if season else df.copy()
    return fdf.drop_duplicates(subset=["ID","Year"]).groupby("Year").size().sort_index().to_dict()


# === ML Endpoints — uses loaded PKL models ===

@app.get("/train-model")
def train_model():
    coef = dict(zip(["Age", "Sex", "Height", "Weight"], _lr.coef_[0].tolist()))
    importance = dict(zip(["Age", "Sex", "Height", "Weight"], _rf.feature_importances_.tolist()))
    return {
        "features": coef,
        "feature_importance": importance,
        "model": "Pre-trained Logistic Regression + Random Forest"
    }

@app.get("/predict-medal")
def predict_medal(
    age: float = Query(...),
    sex: str = Query(...),
    height: float = Query(170),
    weight: float = Query(70)
):
    sex_enc = 1 if sex.strip().upper() == "M" else 0
    inp = np.array([[age, sex_enc, height, weight]])
    prob = _rf.predict_proba(inp)[0][1]
    return {
        "medal_probability": round(float(prob) * 100, 2),
        "model": "Random Forest",
        "inputs": {"age": age, "sex": sex, "height": height, "weight": weight}
    }

@app.get("/country-stats")
def country_stats(country: str = Query(...)):
    cdf = df[df["region"] == country]
    medal_df = cdf[cdf["Medal"].notna()]
    return {
        "total_athletes": int(cdf["ID"].nunique()),
        "total_medals": int(len(medal_df)),
        "gold": int(len(medal_df[medal_df["Medal"] == "Gold"])),
        "silver": int(len(medal_df[medal_df["Medal"] == "Silver"])),
        "bronze": int(len(medal_df[medal_df["Medal"] == "Bronze"])),
        "avg_age": round(float(cdf["Age"].mean()), 1) if cdf["Age"].notna().any() else None,
        "best_sport": medal_df.groupby("Sport")["Medal"].count().idxmax() if len(medal_df) > 0 else None
    }