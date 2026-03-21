"""Quick debug: test the metrics endpoint with a known profile ID."""
import requests

GATEWAY = "http://localhost:8000/api"

# Use the first ID from the import run
PROFILE_ID = "32b3a50e-97bc-49e9-adce-5f639f6604e1"

payload = {"speed": 82.0, "strength": 74.0, "stamina": 88.0, "tactical": 91.0}

res = requests.post(f"{GATEWAY}/profiles/{PROFILE_ID}/metrics", json=payload, timeout=10)
print(f"Status : {res.status_code}")
print(f"Response: {res.text}")
