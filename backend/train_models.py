import pandas as pd
import numpy as np
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

athletes = pd.read_csv("athlete_events.csv")
regions = pd.read_csv("noc_regions.csv")
df = athletes.merge(regions, on="NOC", how="left")

mdf = df[["Age", "Sex", "Height", "Weight", "Medal"]].copy()
mdf = mdf.dropna(subset=["Age", "Sex"])
mdf["Height"] = mdf["Height"].fillna(mdf["Height"].median())
mdf["Weight"] = mdf["Weight"].fillna(mdf["Weight"].median())
mdf["Sex"] = mdf["Sex"].map({"F": 0, "M": 1})
mdf["Medal"] = mdf["Medal"].notna().astype(int)

X = mdf[["Age", "Sex", "Height", "Weight"]]
y = mdf["Medal"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

lr = LogisticRegression(max_iter=1000)
lr.fit(X_train, y_train)

rf = RandomForestClassifier(n_estimators=50, random_state=42)
rf.fit(X_train, y_train)

print("LR Accuracy:", accuracy_score(y_test, lr.predict(X_test)))
print("RF Accuracy:", accuracy_score(y_test, rf.predict(X_test)))

pickle.dump(lr, open("lr_model.pkl", "wb"))
pickle.dump(rf, open("rf_model.pkl", "wb"))