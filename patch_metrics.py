"""
Proplay Metrics Patch Script
-----------------------------
For profiles already in Supabase that were imported without metrics
(because the metrics table didn't exist yet), this script:

  1. Fetches all profiles from the API gateway.
  2. Reads players.csv to look up the metric values by full_name.
  3. For each profile that matches a CSV row, sends a metrics POST.
  4. Skips profiles that already have a visibility_score > 0
     (those already received metrics successfully).

Usage:
  python patch_metrics.py
  python patch_metrics.py --file players.csv --url http://localhost:8000/api
"""

import argparse
import sys
import time

try:
    import pandas as pd
    import requests
except ImportError:
    print("Missing dependencies. Run:  pip install pandas requests")
    sys.exit(1)

DEFAULT_GATEWAY = "http://localhost:8000/api"
DELAY_SECONDS = 0.5


def fetch_profiles(gateway: str) -> list[dict]:
    """GET /api/profiles — returns list of profile dicts."""
    res = requests.get(f"{gateway}/profiles", timeout=10)
    if res.status_code != 200:
        print(f"Failed to fetch profiles ({res.status_code}): {res.text[:200]}")
        sys.exit(1)
    return res.json().get("data", [])


def patch_metrics(gateway: str, profile_id: str, row: dict) -> bool:
    """POST /api/profiles/:id/metrics for a single athlete."""
    payload = {
        "speed":    float(row["speed"]),
        "strength": float(row["strength"]),
        "stamina":  float(row["stamina"]),
        "tactical": float(row["tactical"]),
    }
    res = requests.post(
        f"{gateway}/profiles/{profile_id}/metrics",
        json=payload,
        timeout=10,
    )
    if res.status_code == 201:
        return True
    print(f"   Metrics error ({res.status_code}): {res.text[:400]}")
    return False


def run_patch(file_path: str, gateway: str) -> None:
    # Load CSV
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        sys.exit(1)

    # Index CSV rows by lower-cased full_name for fast lookup
    csv_by_name: dict[str, dict] = {
        str(row["full_name"]).strip().lower(): row.to_dict()
        for _, row in df.iterrows()
    }

    # Fetch profiles from gateway
    profiles = fetch_profiles(gateway)
    print(f"\nProplay Metrics Patch — {len(profiles)} profiles in database")
    print(f"Gateway : {gateway}")
    print("-" * 55)

    patched = 0
    skipped = 0
    no_match = 0
    failed = 0

    for profile in profiles:
        name = profile.get("full_name", "")
        profile_id = profile.get("id", "")
        visibility = float(profile.get("visibility_score") or 0)

        # Skip athletes that already have metrics (visibility_score written by AI)
        if visibility > 0:
            print(f"  SKIP  {name} — already has visibility_score {visibility:.1f}")
            skipped += 1
            continue

        # Match against CSV by name
        csv_row = csv_by_name.get(name.strip().lower())
        if csv_row is None:
            print(f"  NO CSV MATCH  {name}")
            no_match += 1
            continue

        print(f"  PATCHING  {name} (ID: {profile_id})", end=" ... ", flush=True)
        if patch_metrics(gateway, profile_id, csv_row):
            print("OK — scout report generating")
            patched += 1
        else:
            print("FAILED")
            failed += 1

        time.sleep(DELAY_SECONDS)

    # Summary
    print("\n" + "=" * 55)
    print(f"  Patched  : {patched}")
    print(f"  Skipped  : {skipped}  (already had metrics)")
    print(f"  No match : {no_match}  (not in CSV)")
    print(f"  Failed   : {failed}")
    print("=" * 55)
    if patched > 0:
        print("\n  Scout reports are generating in the background.")
        print("  Wait ~10 seconds then refresh /discover or /leaderboard.\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Patch existing profiles with missing metrics")
    parser.add_argument("--file", default="players.csv", help="Path to CSV file")
    parser.add_argument("--url",  default=DEFAULT_GATEWAY, help="API Gateway base URL")
    args = parser.parse_args()

    run_patch(args.file, args.url)
