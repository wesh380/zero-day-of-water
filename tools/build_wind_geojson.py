#!/usr/bin/env python3
# tools/build_wind_geojson.py
import os, sys, json, math
import pandas as pd

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IN_COUNTIES_CSV = os.path.join(ROOT, "data", "table8_counties.csv")
IN_SITES_CSV    = os.path.join(ROOT, "data", "wind_sites_raw.csv")
OUT_DIR         = os.path.join(ROOT, "docs", "data")
OUT_DIR_ALT     = os.path.join(ROOT, "docs", "amaayesh", "data")
OUT_SITES_GEO   = os.path.join(OUT_DIR, "wind_sites.geojson")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(OUT_DIR_ALT, exist_ok=True)

def class_norm(c):
    try: c = int(c)
    except: return 0.4
    return {3:1.0, 2:0.7, 1:0.4}.get(c, 0.4)

def coord_quality(source_str):
    s = (str(source_str) or "").lower()
    if any(k in s for k in ["osm","openstreetmap","wikipedia","wikimapia","wiki"]): return "high"
    if any(k in s for k in ["user","کاربر","hand","manual"]): return "med"
    return "low"

def norm_minmax(series):
    mn, mx = float(series.min()), float(series.max())
    if mx - mn < 1e-12: return series*0 + 0.0
    return (series - mn) / (mx - mn)

# 0) Ensure inputs exist; if not, create templates
os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
missing = False
if not os.path.exists(IN_COUNTIES_CSV):
    with open(IN_COUNTIES_CSV, "w", encoding="utf-8") as f:
        f.write("county,wind_class,capacity_mw,sites_count,area_ha\n")
        f.write("خواف,3,450,6,946000\n")
    print(f"[hint] created template: {IN_COUNTIES_CSV}")
    missing = True
if not os.path.exists(IN_SITES_CSV):
    with open(IN_SITES_CSV, "w", encoding="utf-8") as f:
        f.write("name_fa,county,lon,lat,source\n")
        f.write("سایت-۱ خواف,خواف,60.14404,34.57232,OSM\n")
    print(f"[hint] created template: {IN_SITES_CSV}")
    missing = True
if missing:
    print("[error] input CSVs were missing; templates created. Please fill them and rerun.")
    sys.exit(1)

# 1) CSVها
counties = pd.read_csv(IN_COUNTIES_CSV)
sites    = pd.read_csv(IN_SITES_CSV)
for col in ["capacity_mw","sites_count","area_ha","wind_class"]:
    if col in counties.columns:
        counties[col] = pd.to_numeric(counties[col], errors="coerce")
counties["sites_count"] = counties["sites_count"].replace({0: None})

# 2) محاسبات شهرستان
counties["capacity_mw_est"] = (counties["capacity_mw"] / counties["sites_count"]).fillna(0)
counties["MW_per_site"]     = counties["capacity_mw_est"]
counties["MW_per_ha"]       = (counties["capacity_mw"] / counties["area_ha"]).fillna(0)
counties["ClassNorm"]       = counties["wind_class"].apply(class_norm)
counties["__n_MW_per_ha"]   = norm_minmax(counties["MW_per_ha"])
counties["__n_capacity_mw"] = norm_minmax(counties["capacity_mw"])
counties["P0"] = 0.45*counties["ClassNorm"] + 0.35*counties["__n_MW_per_ha"] + 0.20*counties["__n_capacity_mw"]
counties_indexed = counties.set_index("county", drop=False)

# 3) خروجی نقاط (سایت‌های بادی)
features_sites = []
for _, r in sites.iterrows():
    county_key = str(r.get("county","")).strip()
    meta = counties_indexed.loc[county_key] if county_key in counties_indexed.index else None
    lon = pd.to_numeric(r.get("lon"), errors="coerce")
    lat = pd.to_numeric(r.get("lat"), errors="coerce")
    if pd.isna(lon) or pd.isna(lat): continue

    props = {
        "name_fa": r.get("name_fa"),
        "county": county_key,
        "source": r.get("source"),
        "quality": coord_quality(r.get("source")),
    }
    if meta is not None:
        props.update({
            "wind_class":     int(meta.get("wind_class")) if not pd.isna(meta.get("wind_class")) else None,
            "capacity_mw":    float(meta.get("capacity_mw")) if not pd.isna(meta.get("capacity_mw")) else None,
            "sites_count":    int(meta.get("sites_count")) if not pd.isna(meta.get("sites_count")) else None,
            "area_ha":        float(meta.get("area_ha")) if not pd.isna(meta.get("area_ha")) else None,
            "capacity_mw_est":float(meta.get("capacity_mw_est")) if not pd.isna(meta.get("capacity_mw_est")) else None,
            "MW_per_ha":      float(meta.get("MW_per_ha")) if not pd.isna(meta.get("MW_per_ha")) else None,
            "ClassNorm":      float(meta.get("ClassNorm")) if not pd.isna(meta.get("ClassNorm")) else None,
            "P0":             float(meta.get("P0")) if not pd.isna(meta.get("P0")) else None,
        })

    features_sites.append({
        "type":"Feature",
        "geometry":{"type":"Point","coordinates":[float(lon), float(lat)]},
        "properties": props
    })

with open(OUT_SITES_GEO, "w", encoding="utf-8") as f:
    json.dump({"type":"FeatureCollection","features":features_sites}, f, ensure_ascii=False)
# write alt copy
with open(os.path.join(OUT_DIR_ALT, "wind_sites.geojson"), "w", encoding="utf-8") as f:
    json.dump({"type":"FeatureCollection","features":features_sites}, f, ensure_ascii=False)
print("[ok] wrote:", OUT_SITES_GEO, "and", os.path.join(OUT_DIR_ALT, "wind_sites.geojson"))
