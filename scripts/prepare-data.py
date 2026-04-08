"""
Convert the 70k perfume catalog from HuggingFace into static JSON for the Next.js app.

Outputs:
  public/data/perfumes.json      — full catalog with sparse accord weights
  public/data/accord-lookup.json — accord → perfume IDs for fast candidate search
  public/data/accord-labels.json — ordered list of accord names (index → name)
"""

import ast
import json
import os
import re
import sys

import joblib
import numpy as np
import pandas as pd
from huggingface_hub import hf_hub_download

HF_REPO = "anvo2/perfume-rec-assets"

def download_assets():
    csv_path = hf_hub_download(HF_REPO, "data/catalog_70k.csv", repo_type="dataset")
    matrix_path = hf_hub_download(HF_REPO, "models/accord_matrix_within_pos.npy", repo_type="dataset")
    lookup_path = hf_hub_download(HF_REPO, "models/accord_candidate_lookup.pkl", repo_type="dataset")
    return csv_path, matrix_path, lookup_path


def parse_accords(val):
    if isinstance(val, list):
        return val
    if isinstance(val, str):
        try:
            return ast.literal_eval(val)
        except Exception:
            return []
    return []


def extract_brand_from_url(url):
    """Extract brand name from Fragrantica URL like .../perfume/Brand/Name-123.html"""
    if not isinstance(url, str):
        return ""
    match = re.search(r'/perfume/([^/]+)/', url)
    if match:
        return match.group(1).replace('-', ' ')
    return ""


def clean_name(name, gender):
    """Remove gender suffix from name"""
    if isinstance(gender, str) and gender in name:
        return name.replace(gender, '').strip()
    return name.strip()


def main():
    print("Downloading assets from HuggingFace...")
    csv_path, matrix_path, lookup_path = download_assets()

    print("Loading data...")
    df = pd.read_csv(csv_path)
    matrix = np.load(matrix_path)
    lookup = joblib.load(lookup_path)

    # Get ordered accord labels from lookup keys
    accord_labels = sorted(lookup.keys())

    # Build output directory
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    os.makedirs(out_dir, exist_ok=True)

    # Build perfumes JSON — only store non-zero accord weights (sparse)
    print(f"Processing {len(df)} perfumes...")
    perfumes = []
    for idx, row in df.iterrows():
        name = clean_name(str(row['Name']), row.get('Gender', ''))
        brand = extract_brand_from_url(row.get('url', ''))
        gender = row['Gender'] if pd.notna(row.get('Gender')) else ''
        rating = float(row['Rating Value']) if pd.notna(row.get('Rating Value')) else 0
        rating_count_raw = row.get('Rating Count', '0')
        if isinstance(rating_count_raw, str):
            rating_count = int(rating_count_raw.replace(',', ''))
        else:
            rating_count = int(rating_count_raw) if pd.notna(rating_count_raw) else 0

        # Get non-zero accord weights from matrix (store as int 0-100 to save space)
        vec = matrix[idx]
        accord_weights = {}
        for i, val in enumerate(vec):
            if val > 0 and i < len(accord_labels):
                accord_weights[accord_labels[i]] = int(round(float(val) * 100))

        perfume = {
            "id": int(idx),
            "n": name,
            "b": brand,
            "g": gender,
            "r": round(rating, 2),
            "rc": rating_count,
            "aw": accord_weights,
        }
        perfumes.append(perfume)

    # Build candidate lookup — accord → list of perfume IDs
    print("Building candidate lookup...")
    candidate_lookup = {}
    for accord_name, indices in lookup.items():
        candidate_lookup[accord_name] = [int(i) for i in indices]

    # Write outputs
    print("Writing perfumes.json...")
    perfumes_path = os.path.join(out_dir, 'perfumes.json')
    with open(perfumes_path, 'w') as f:
        json.dump(perfumes, f, separators=(',', ':'))
    size_mb = os.path.getsize(perfumes_path) / 1024 / 1024
    print(f"  → {size_mb:.1f} MB")

    print("Writing accord-lookup.json...")
    lookup_path_out = os.path.join(out_dir, 'accord-lookup.json')
    with open(lookup_path_out, 'w') as f:
        json.dump(candidate_lookup, f, separators=(',', ':'))
    size_mb = os.path.getsize(lookup_path_out) / 1024 / 1024
    print(f"  → {size_mb:.1f} MB")

    print("Writing accord-labels.json...")
    labels_path = os.path.join(out_dir, 'accord-labels.json')
    with open(labels_path, 'w') as f:
        json.dump(accord_labels, f, separators=(',', ':'))

    print("Done!")


if __name__ == "__main__":
    main()
