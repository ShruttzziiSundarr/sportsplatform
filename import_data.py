"""
Proplay Bulk Import Script
--------------------------
Reads players.csv and seeds the Proplay database via the Node.js API Gateway.

Flow per athlete:
  1. POST /api/profiles         → creates profile, triggers baseline AI score
  2. POST /api/profiles/:id/metrics → logs real metrics, triggers MiniGPT scout report

Usage:
  pip install pandas requests
  python import_data.py
  python import_data.py --file custom.csv --url http://localhost:8000
"""

import argparse
import time
import sys

try:
    import pandas as pd
    import requests
except ImportError:
    print("Missing dependencies. Run:  pip install pandas requests")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_GATEWAY = "http://localhost:8000/api"
DELAY_SECONDS   = 0.6   # pause between athletes to avoid flooding the event loop

# ── Helpers ───────────────────────────────────────────────────────────────────

def create_profile(gateway: str, row: dict) -> str | None:
    """POST /api/profiles → returns the new profile ID or None on failure."""
    payload = {
        "full_name":         row["full_name"],
        "sport":             row["sport"].lower(),
        "primary_position":  row.get("primary_position") or None,
        "height_cm":         int(row["height_cm"]) if pd.notna(row.get("height_cm")) else None,
        "weight_kg":         int(row["weight_kg"]) if pd.notna(row.get("weight_kg")) else None,
    }
    # Remove None values so Zod optional fields aren't sent as null
    payload = {k: v for k, v in payload.items() if v is not None}

    res = requests.post(f"{gateway}/profiles", json=payload, timeout=10)

    if res.status_code == 201:
        # API response shape: { status, message, data: { id, ... } }
        profile_id = res.json()["data"]["id"]
        return profile_id
    else:
        print(f"   ❌ Profile creation failed ({res.status_code}): {res.text[:200]}")
        return None


def log_metrics(gateway: str, profile_id: str, row: dict) -> bool:
    """POST /api/profiles/:id/metrics → triggers MiniGPT scout report refresh."""
    metrics_keys = ["speed", "strength", "stamina", "tactical"]
    if not all(k in row and pd.notna(row[k]) for k in metrics_keys):
        print("   ⚠️  Metrics columns missing or empty — skipping metrics step.")
        return False

    payload = {k: float(row[k]) for k in metrics_keys}
    res = requests.post(f"{gateway}/profiles/{profile_id}/metrics", json=payload, timeout=10)

    if res.status_code == 201:
        return True
    else:
        # Print actual server error so we can diagnose the problem
        print(f"   ❌ Metrics error ({res.status_code}): {res.text[:400]}")
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def import_proplay_data(file_path: str, gateway: str) -> None:
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"❌ File not found: {file_path}")
        sys.exit(1)

    total    = len(df)
    success  = 0
    failures = []

    print(f"\n🚀 Proplay Import — {total} athletes from '{file_path}'")
    print(f"   Gateway : {gateway}")
    print("─" * 55)

    for idx, row in df.iterrows():
        name = row.get("full_name", f"Row {idx + 1}")
        print(f"\n[{idx + 1}/{total}] {name} ({row.get('sport', '?')})")

        # Step 1: Create profile
        profile_id = create_profile(gateway, row)
        if not profile_id:
            failures.append(name)
            continue
        print(f"   ✅ Profile created  → ID: {profile_id}")

        # Step 2: Log metrics (triggers MiniGPT)
        if log_metrics(gateway, profile_id, row):
            print(f"   🧠 Metrics logged   → Scout report generating...")
        else:
            print(f"   ⚠️  Metrics step failed (profile still created)")

        success += 1
        time.sleep(DELAY_SECONDS)

    # ── Summary ───────────────────────────────────────────────────────────────
    print("\n" + "═" * 55)
    print(f"  Import complete — {success}/{total} athletes seeded")
    if failures:
        print(f"  Failed ({len(failures)}): {', '.join(failures)}")
    print("═" * 55)
    print("\n  ✓ Check your Supabase dashboard for profiles + scout_summary")
    print("  ✓ Open http://localhost:3000/leaderboard to see the rankings\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Proplay bulk athlete importer")
    parser.add_argument("--file", default="players.csv",          help="Path to CSV file")
    parser.add_argument("--url",  default=DEFAULT_GATEWAY,        help="API Gateway base URL")
    args = parser.parse_args()

    import_proplay_data(args.file, args.url)
