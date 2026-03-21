# Proplay — Sports Talent Intelligence Platform

Proplay is a full-stack sports networking platform that uses a custom-built, decoder-only Transformer to generate professional scouting assessments from athlete performance metrics. It was designed and built for Shiv Nadar University Chennai as a demonstration of applied AI in the Indian sports ecosystem.

---

## Architecture Overview

The system is composed of three independent services that communicate over HTTP:

```
proplay-frontend  (Next.js)        Port 3000
        |
        v
proplay-api-gateway  (Node.js)     Port 8000
        |
        +-----> Supabase (PostgreSQL)
        |
        v
proplay-ai-service  (FastAPI)      Port 8080
```

**Request path for a new athlete profile:**

1. Frontend sends `POST /api/profiles` to the API Gateway.
2. Gateway validates the payload with Zod, calls the AI Service for a baseline composite score, and persists the profile to Supabase.
3. Gateway asynchronously calls `/generate-scout-report` on the AI Service.
4. The AI Service tokenizes the athlete metrics, runs them through the MiniGPT Transformer, and returns a structured narrative.
5. Gateway writes the narrative to `profiles.scout_summary` in Supabase.

---

## Repository Structure

```
spn_final/
├── players.csv                      Synthetic dataset of 20 Indian athletes
├── import_data.py                   Bulk import script (CSV -> API Gateway)
├── debug_metrics.py                 One-shot metrics endpoint debugger
│
├── proplay-api-gateway/             Node.js / TypeScript service
│   ├── src/
│   │   ├── index.ts                 Express application entry point
│   │   ├── config/
│   │   │   └── supabase.ts          Supabase client singleton
│   │   ├── controllers/
│   │   │   ├── profile.controller.ts
│   │   │   └── metrics.controller.ts
│   │   ├── middlewares/
│   │   │   └── validate.middleware.ts  Zod schema validation
│   │   ├── repositories/
│   │   │   ├── profile.repository.ts   Supabase CRUD for profiles
│   │   │   └── metrics.repository.ts   Supabase CRUD for metrics
│   │   ├── routes/
│   │   │   └── profile.routes.ts
│   │   ├── services/
│   │   │   ├── profile.service.ts      Profile creation orchestration
│   │   │   ├── metrics.service.ts      Metrics ingestion + scout refresh
│   │   │   └── ai.service.ts           HTTP client for AI Service
│   │   └── types/
│   │       └── profile/
│   │           └── schema.ts           Zod schemas and inferred types
│   ├── proplay-ai-service/          Python / FastAPI service
│   │   ├── main.py                  FastAPI application and endpoint handlers
│   │   ├── intelligence.py          Linear regression and sport-weighted scoring
│   │   ├── transformer.py           MiniGPT Transformer implementation
│   │   ├── tokenizer.py             Character-level athlete metrics tokenizer
│   │   └── requirements.txt
│   ├── package.json
│   └── tsconfig.json
│
└── proplay-frontend/                Next.js 14 application
    ├── src/
    │   ├── app/                     App Router pages
    │   ├── components/
    │   │   ├── cards/               BentoCard, ProfileCard
    │   │   ├── charts/              RadarChart, SparkLine (Recharts)
    │   │   ├── nav/                 Navbar
    │   │   └── shared/              GlassPanel, VisibilityBadge
    │   └── lib/
    │       ├── api.ts               Typed fetch client (gateway port 8000)
    │       └── utils.ts             cn(), formatters, color helpers
    ├── tailwind.config.ts
    └── .env.local
```

---

## Services

### 1. API Gateway — `proplay-api-gateway/`

**Runtime:** Node.js with TypeScript, compiled and run by `ts-node-dev`.
**Framework:** Express 5
**Port:** 8000

**Responsibilities:**
- Accepts all client requests from the frontend.
- Validates request payloads using Zod schemas before any business logic runs.
- Orchestrates communication between Supabase and the Python AI Service.
- Scout report generation runs asynchronously — the HTTP response is returned to the client immediately after profile creation, and the `scout_summary` column is updated in the background once the Transformer finishes.

**Middleware:**
- `helmet` — sets security-related HTTP response headers.
- `cors` — allows cross-origin requests from the frontend.
- `express.json()` — parses incoming JSON bodies.
- `validate(schema)` — Zod middleware that returns `400` with field-level errors on invalid input.

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/api/profiles` | Retrieve all profiles, ordered by `visibility_score` descending |
| POST | `/api/profiles` | Create a new athlete profile |
| GET | `/api/profiles/:id` | Retrieve a single profile by UUID |
| POST | `/api/profiles/:id/metrics` | Log a new performance session and trigger scout report refresh |

**Validation Schemas (`src/types/profile/schema.ts`):**

`createProfileSchema` — `full_name` (required, min 2 chars), `sport` (required), `primary_position` (optional string), `height_cm` (optional positive number), `weight_kg` (optional positive number).

`addMetricsSchema` — `speed`, `strength`, `stamina`, `tactical` — all required numbers in the range 0 to 100.

**Environment Variables (`proplay-api-gateway/.env`):**

```
PORT=8000
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

### 2. AI Service — `proplay-api-gateway/proplay-ai-service/`

**Runtime:** Python 3.11+
**Framework:** FastAPI with Uvicorn
**Port:** 8080

**Responsibilities:**
- Calculates sport-specific composite scores using hand-tuned weight matrices.
- Predicts improvement velocity using scikit-learn `LinearRegression` over historical score series.
- Runs the full MiniGPT transformer pipeline to generate professional scout narratives.

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service health check with transformer config |
| POST | `/calculate-score` | Returns `composite_score` and `rank_category` |
| POST | `/predict-growth` | Returns `predicted_next_score` and `improvement_velocity` |
| POST | `/generate-scout-report` | Full transformer pipeline — returns structured scout narrative |

**`/calculate-score` request body:**
```json
{
  "speed": 82,
  "strength": 74,
  "stamina": 88,
  "tactical": 91,
  "sport": "cricket"
}
```

**Sport-specific weight matrix (`intelligence.py`):**

| Sport | Speed | Strength | Stamina | Tactical |
|-------|-------|----------|---------|----------|
| Cricket | 0.20 | 0.30 | 0.20 | 0.30 |
| Basketball | 0.30 | 0.20 | 0.30 | 0.20 |
| Default | 0.25 | 0.25 | 0.25 | 0.25 |

**`/generate-scout-report` request body:**
```json
{
  "profile_id": "uuid",
  "sport": "cricket",
  "metrics_history": [
    {"speed": 75, "strength": 70, "stamina": 80, "tactical": 85},
    {"speed": 78, "strength": 72, "stamina": 83, "tactical": 87}
  ]
}
```

**Python dependencies (`requirements.txt`):**

```
fastapi==0.115.0
uvicorn[standard]==0.32.0
pydantic==2.9.2
torch==2.4.1
numpy==1.26.4
scikit-learn==1.5.2
```

---

### 3. MiniGPT Transformer — `transformer.py` and `tokenizer.py`

This is the core intelligence layer, implemented from scratch following the Raschka *LLMs-from-scratch* methodology.

**Architecture:**

| Component | Detail |
|-----------|--------|
| Architecture | Decoder-only causal Transformer |
| Layers (`n_layer`) | 4 |
| Attention heads (`n_head`) | 4 |
| Embedding dimension (`n_embd`) | 128 |
| Feed-forward expansion | 4x (512 hidden units) |
| Activation | GeLU |
| Normalisation | Pre-LayerNorm (applied before each sub-layer) |
| Sequence length (`block_size`) | 64 tokens |
| Dropout | 0.1 |
| Weight tying | Token embedding and LM head share weights |

**Causal Masking:**
`CausalSelfAttention` registers a lower-triangular buffer (`mask`) that prevents each position from attending to future positions. This enforces the temporal ordering of an athlete's performance history — the model cannot "see ahead" in time.

**Tokenizer (`tokenizer.py`):**
Character-level tokenizer over the following character set: digits 0–9, uppercase letters A–Z, and punctuation characters `: | .` (space included). Vocabulary size is approximately 50 tokens.

Special tokens: `[PAD]` (0), `[START]` (1), `[END]` (2), `[SEP]` (3).

Metric records are serialised into the following format before tokenisation:
```
SPEED:082 STRENGTH:074 STAMINA:088 TACTICAL:091 | SPEED:085 STRENGTH:077 ...
```

**Inference pipeline in `generate_scout_report`:**

1. Serialise metrics history to a formatted string.
2. Encode with `AthleteTokenizer.encode_and_pad()` to a fixed-length tensor of 64 tokens.
3. Forward pass through MiniGPT — returns logits and hidden states.
4. Mean-pool the final hidden states across the sequence dimension: `(1, 64, 128) -> (1, 128)`.
5. Segment the 128-dim vector into 4 blocks of 32. Take the mean of each block and pass through `tanh` scaling to produce 4 bias signals in the range `[-3, +3]`.
6. Add each bias signal to the corresponding metric average (speed, strength, stamina, tactical) to produce transformer-adjusted scores.
7. Select narrative templates based on adjusted score thresholds: Elite (>=85), Above-Average (>=70), Developing (>=55), Foundational (<55).
8. Append growth trajectory narrative from the `predict_growth` linear regression result.
9. Return the assembled multi-section report as a plain string.

---

### 4. Frontend — `proplay-frontend/`

**Framework:** Next.js 14 with App Router
**Language:** TypeScript
**Port:** 3000
**Styling:** Tailwind CSS v3 with custom `glass`, `dot-bg`, and `gradient-text` utility classes
**Animation:** Framer Motion
**Charts:** Recharts (`RadarChart`, `AreaChart`)
**Icons:** lucide-react

**Pages:**

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Bento grid hero with platform statistics |
| `/dashboard` | Athlete Dashboard | Radar chart, growth sparkline, scout summary excerpt |
| `/log` | Performance Log | Slider form (0–100 per metric), live composite preview |
| `/profile/[id]` | Public Profile Card | Glassmorphism layout, radar chart, shareable link |
| `/discover` | Talent Discovery Feed | Filterable, sortable grid of all athletes |
| `/spotlight` | Hidden Gem Spotlight | Athletes with mid-range scores and rising velocity |
| `/report/[id]` | Virtual Scout Report | Animated MiniGPT narrative, transformer metadata sidebar |
| `/leaderboard` | Campus Leaderboard | Podium top-3, medal ranks, sport filter tabs |
| `/onboarding` | Onboarding Wizard | 4-step animated wizard, calls `POST /api/profiles` on submit |
| `/ai-lab` | AI Lab | Live health checks, transformer config, live test form |
| `/settings` | Settings | Visibility toggle, API endpoint display, danger zone |

**API client (`src/lib/api.ts`):**
All requests go through a single typed `apiFetch` helper that sets `Content-Type: application/json`, unwraps the `{ data: ... }` envelope from the gateway, and throws on non-2xx responses. The base URL defaults to `http://localhost:8000` and can be overridden with `NEXT_PUBLIC_API_URL`.

**Environment Variables (`proplay-frontend/.env.local`):**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_URL=http://localhost:8080
```

---

## Database Schema (Supabase / PostgreSQL)

**`profiles` table:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `full_name` | text | Required |
| `sport` | text | Required, stored lowercase |
| `primary_position` | text | Optional |
| `height_cm` | numeric | Optional |
| `weight_kg` | numeric | Optional |
| `visibility_score` | numeric | Composite score from AI Service, default 0 |
| `scout_summary` | text | MiniGPT-generated narrative, written asynchronously |
| `created_at` | timestamptz | Auto-set by Supabase |

**`metrics` table:**

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key, auto-generated |
| `profile_id` | uuid | Foreign key to `profiles(id)`, cascades on delete |
| `speed` | numeric | 0–100 |
| `strength` | numeric | 0–100 |
| `stamina` | numeric | 0–100 |
| `tactical` | numeric | 0–100 |
| `recorded_at` | timestamptz | Auto-set by Supabase |

**Required SQL to create both tables:**

```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS scout_summary text,
  ADD COLUMN IF NOT EXISTS visibility_score numeric DEFAULT 0;

CREATE TABLE IF NOT EXISTS metrics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  speed       numeric NOT NULL CHECK (speed BETWEEN 0 AND 100),
  strength    numeric NOT NULL CHECK (strength BETWEEN 0 AND 100),
  stamina     numeric NOT NULL CHECK (stamina BETWEEN 0 AND 100),
  tactical    numeric NOT NULL CHECK (tactical BETWEEN 0 AND 100),
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metrics_profile_id ON metrics(profile_id);
```

---

## Running the Project

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project with the schema above applied

### Step 1 — Python AI Service

```bash
cd proplay-api-gateway/proplay-ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --port 8080 --reload
```

Verify: `curl http://localhost:8080/` should return the service status and transformer config.

### Step 2 — Node.js API Gateway

```bash
cd proplay-api-gateway
# Add SUPABASE_URL and SUPABASE_ANON_KEY to .env
npm install
npm run dev
```

Verify: `curl http://localhost:8000/health` should return `{ "status": "success" }`.

### Step 3 — Next.js Frontend

```bash
cd proplay-frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

### Step 4 — Seed Data (optional)

```bash
cd ..   # project root (spn_final/)
pip install pandas requests
python import_data.py
```

This reads `players.csv` and calls `POST /api/profiles` followed by `POST /api/profiles/:id/metrics` for each of the 20 athletes. All profiles are created first; metrics submission triggers the MiniGPT scout report pipeline asynchronously.

---

## Key Design Decisions

**Asynchronous scout report generation.**
Profile creation returns a `201` response immediately. The call to `/generate-scout-report` and the subsequent Supabase `UPDATE` happen in a detached `.then()` chain. This keeps the API response time fast (under 200ms) regardless of transformer inference time.

**Sport-specific composite scores.**
The `/calculate-score` endpoint accepts an optional `sport` parameter and dispatches to `calculate_composite_score()` in `intelligence.py`, which applies sport-specific weight matrices. This replaces the original hardcoded 40/20/20/20 split.

**Transformer hidden-state bias.**
The MiniGPT model is initialised with fixed random weights (seed 42) and is not trained. The hidden state is not used for language generation. Instead, it produces a 128-dim contextual representation of the metric sequence, which is segmented into 4 blocks and compressed into scalar bias signals. These signals nudge the template selection thresholds, meaning the same raw metric averages can yield slightly different narrative classifications depending on the temporal structure of the input sequence.

**Character-level tokenisation.**
Metric records are serialised into human-readable strings before tokenisation (e.g. `SPEED:082 STRENGTH:074`). This makes the token sequence interpretable and keeps the vocabulary small (~50 tokens), which is appropriate for the 128-dim embedding space.

**Layered gateway architecture.**
The API Gateway strictly follows the Controller -> Service -> Repository pattern. Controllers handle HTTP concerns only. Services contain orchestration logic. Repositories contain all Supabase calls. This separation means the AI integration, the database layer, and the HTTP layer can each be modified independently.

---

## Debugging

**Metrics endpoint returning non-201:**
Run `python debug_metrics.py` from the project root. This sends a single metrics request to a known profile ID and prints the raw server response. The most common cause is the `metrics` table not existing in Supabase — apply the SQL above to resolve it.

**Scout summary not appearing:**
The `scout_summary` column is written after the profile response is returned. If the AI Service is offline at the time of profile creation, the column will remain null. Restart the AI Service and submit a new metrics session via `POST /api/profiles/:id/metrics` to trigger a fresh report.

**Frontend showing stale data:**
The discover, leaderboard, and profile pages fetch live data on mount with no cache. A hard refresh (`Ctrl+Shift+R`) will re-fetch from the gateway.
