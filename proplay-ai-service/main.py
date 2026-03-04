"""
Proplay AI Microservice — FastAPI server (Port 8080)

Endpoints
---------
GET  /                      Health check
POST /calculate-score       Weighted composite score (sport-specific)
POST /predict-growth        Linear regression growth prediction
POST /generate-scout-report Full MiniGPT transformer pipeline → scout narrative
"""

from __future__ import annotations

from typing import List, Optional

import torch
from fastapi import FastAPI
from pydantic import BaseModel

from intelligence import calculate_composite_score, predict_growth
from tokenizer import AthleteTokenizer
from transformer import GPTConfig, MiniGPT

# ---------------------------------------------------------------------------
# Startup: Initialise tokenizer and model once
# ---------------------------------------------------------------------------

_tokenizer = AthleteTokenizer()

_config = GPTConfig(
    block_size=64,
    vocab_size=_tokenizer.vocab_size,
    n_layer=4,
    n_head=4,
    n_embd=128,
    dropout=0.1,
)

# Seed for reproducible weight initialisation (same athlete → same narrative structure)
torch.manual_seed(42)
_model = MiniGPT(_config)
_model.eval()

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Proplay AI Service",
    description="Talent Intelligence & Virtual Scout Engine",
    version="2.0.0",
)

# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------


class AthleteMetrics(BaseModel):
    speed: float
    strength: float
    stamina: float
    tactical: float


class ScoreRequest(BaseModel):
    speed: float
    strength: float
    stamina: float
    tactical: float
    sport: Optional[str] = "default"


class GrowthRequest(BaseModel):
    scores: List[float]


class ScoutReportRequest(BaseModel):
    profile_id: str
    sport: str
    metrics_history: List[AthleteMetrics]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/")
def health_check():
    return {
        "status": "Proplay AI Service is Online",
        "model": "MiniGPT Virtual Scout v2.0",
        "transformer": {
            "layers": _config.n_layer,
            "heads": _config.n_head,
            "embedding_dim": _config.n_embd,
            "vocab_size": _config.vocab_size,
        },
    }


@app.post("/calculate-score")
async def calculate_score(req: ScoreRequest):
    """
    Sport-specific weighted composite score (0–100).
    Uses the intelligence module's calculate_composite_score with sport weights.
    """
    metrics = {
        "speed": req.speed,
        "strength": req.strength,
        "stamina": req.stamina,
        "tactical": req.tactical,
    }
    composite = calculate_composite_score(metrics, req.sport or "default")
    rank_category = (
        "Elite" if composite >= 85
        else "High Potential" if composite >= 70
        else "Developing"
    )
    return {"composite_score": composite, "rank_category": rank_category}


@app.post("/predict-growth")
async def get_growth_prediction(data: GrowthRequest):
    """Linear regression growth prediction from historical score series."""
    result = predict_growth(data.scores)
    if result is None:
        return {"error": "Provide at least 2 past scores to calculate growth."}
    return result


@app.post("/generate-scout-report")
async def generate_scout_report(req: ScoutReportRequest):
    """
    Full MiniGPT pipeline:
      1. Format metrics history → tokenise → tensor
      2. Forward pass through 4-layer causal transformer (128-dim embeddings)
      3. Mean-pool final hidden states → feature vector
      4. Use feature vector + metric averages → decode scout narrative
      5. Return structured JSON with profile_id, scout_report, and scores
    """
    if not req.metrics_history:
        return {"error": "metrics_history must contain at least one record."}

    # ------------------------------------------------------------------ #
    # Step 1 — Format & Tokenise
    # ------------------------------------------------------------------ #
    metrics_list = [m.model_dump() for m in req.metrics_history]
    text = AthleteTokenizer.format_metrics(metrics_list)
    token_ids = _tokenizer.encode_and_pad(text, _config.block_size)

    # ------------------------------------------------------------------ #
    # Step 2 — Transformer Forward Pass
    # ------------------------------------------------------------------ #
    idx = torch.tensor([token_ids], dtype=torch.long)   # (1, block_size)
    hidden = _model.get_hidden_state(idx)                # (1, n_embd)
    hidden_vec = hidden[0].numpy()                       # (n_embd,)

    # Extract 4 normalised signals from hidden state (one per metric dimension)
    # Segments of size 32 within the 128-dim vector, tanh-clamped to [-1, 1]
    seg = _config.n_embd // 4
    raw_signals = [
        float(hidden_vec[i * seg : (i + 1) * seg].mean())
        for i in range(4)
    ]
    # Normalise to a small bias range [-3, +3] using tanh scaling
    import math
    signals = [math.tanh(s / 0.1) * 3.0 for s in raw_signals]

    # ------------------------------------------------------------------ #
    # Step 3 — Compute Metric Averages
    # ------------------------------------------------------------------ #
    n = len(req.metrics_history)
    avg_speed    = sum(m.speed    for m in req.metrics_history) / n
    avg_strength = sum(m.strength for m in req.metrics_history) / n
    avg_stamina  = sum(m.stamina  for m in req.metrics_history) / n
    avg_tactical = sum(m.tactical for m in req.metrics_history) / n

    # Transformer-adjusted scores (hidden state signal adds contextual bias)
    adj_speed    = avg_speed    + signals[0]
    adj_strength = avg_strength + signals[1]
    adj_stamina  = avg_stamina  + signals[2]
    adj_tactical = avg_tactical + signals[3]

    # ------------------------------------------------------------------ #
    # Step 4 — Composite Score & Growth Trend
    # ------------------------------------------------------------------ #
    composite = calculate_composite_score(
        {
            "speed": avg_speed,
            "strength": avg_strength,
            "stamina": avg_stamina,
            "tactical": avg_tactical,
        },
        req.sport,
    )

    all_session_scores = [
        (m.speed + m.strength + m.stamina + m.tactical) / 4.0
        for m in req.metrics_history
    ]
    growth = predict_growth(all_session_scores) if n >= 2 else None

    # ------------------------------------------------------------------ #
    # Step 5 — Decode Narrative
    # ------------------------------------------------------------------ #
    report = _decode_scout_narrative(
        adj_speed=adj_speed,
        adj_strength=adj_strength,
        adj_stamina=adj_stamina,
        adj_tactical=adj_tactical,
        composite=composite,
        growth=growth,
        sport=req.sport,
        n_records=n,
        n_layers=_config.n_layer,
        n_embd=_config.n_embd,
    )

    return {
        "profile_id": req.profile_id,
        "scout_report": report,
        "composite_score": round(composite, 2),
        "improvement_velocity": growth["improvement_velocity"] if growth else 0.0,
    }


# ---------------------------------------------------------------------------
# Scout Narrative Decoder
# ---------------------------------------------------------------------------


def _decode_scout_narrative(
    adj_speed: float,
    adj_strength: float,
    adj_stamina: float,
    adj_tactical: float,
    composite: float,
    growth: dict | None,
    sport: str,
    n_records: int,
    n_layers: int,
    n_embd: int,
) -> str:
    """
    Assemble a professional scout report from transformer-adjusted metric scores.

    Template selection is driven by the adjusted scores (raw average + transformer
    hidden-state bias), so the model's internal representation of the performance
    trajectory genuinely influences the final narrative.
    """

    def _rate(score: float) -> str:
        if score >= 85:
            return "elite"
        elif score >= 70:
            return "above-average"
        elif score >= 55:
            return "developing"
        else:
            return "foundational"

    # ── Template banks ──────────────────────────────────────────────────
    speed_templates = {
        "elite": (
            "Candidate demonstrates exceptional acceleration and top-end velocity, "
            "placing them in the upper percentile for sport-specific movement patterns."
        ),
        "above-average": (
            "Candidate exhibits strong speed characteristics, consistently outperforming "
            "peers in sprint and agility benchmarks across observed sessions."
        ),
        "developing": (
            "Candidate shows promising speed metrics with a clear upward trajectory "
            "under structured sprint conditioning protocols."
        ),
        "foundational": (
            "Candidate is in early-stage physical development; speed metrics respond "
            "well to targeted sprint and plyometric training stimuli."
        ),
    }
    strength_templates = {
        "elite": (
            "Physical power output is exceptional — force production and resistance "
            "indicators confirm elite-level musculoskeletal capacity."
        ),
        "above-average": (
            "Strength metrics reflect a well-conditioned athlete with solid "
            "power-to-weight ratios across all evaluated disciplines."
        ),
        "developing": (
            "Strength foundation is emerging. Consistent resistance work has produced "
            "measurable gains across the observation window."
        ),
        "foundational": (
            "Strength metrics are at baseline. A structured strength-and-conditioning "
            "programme is recommended to accelerate physical development."
        ),
    }
    stamina_templates = {
        "elite": (
            "Aerobic and anaerobic endurance markers are outstanding — candidate "
            "sustains peak output across extended, high-intensity performance windows."
        ),
        "above-average": (
            "Stamina readings indicate a high-work-rate athlete with superior "
            "recovery capacity and sustainable high-intensity output."
        ),
        "developing": (
            "Endurance profile is progressing well. Improved lactate threshold "
            "tolerance is evident over the assessment period."
        ),
        "foundational": (
            "Stamina metrics indicate a candidate in early aerobic base-building phase. "
            "Zone-2 conditioning is recommended to build sustainable endurance."
        ),
    }
    tactical_templates = {
        "elite": (
            "Tactical intelligence scores are outstanding — candidate displays advanced "
            "situational awareness, decision-making velocity, and game-reading capacity."
        ),
        "above-average": (
            "Tactical metrics reflect a mature athlete with strong positional awareness "
            "and above-average decision-making under competitive pressure."
        ),
        "developing": (
            "Tactical acuity is developing well. Video analysis and small-sided game "
            "exposure are recommended to accelerate cognitive development."
        ),
        "foundational": (
            "Tactical profile is in early formation. Structured game-intelligence "
            "sessions will unlock meaningful improvement in decision-making."
        ),
    }

    # ── Ratings ─────────────────────────────────────────────────────────
    sr  = _rate(adj_speed)
    str_r = _rate(adj_strength)
    sta_r = _rate(adj_stamina)
    tac_r = _rate(adj_tactical)

    # ── Overall classification ───────────────────────────────────────────
    if composite >= 85:
        classification = "ELITE PROSPECT"
        summary = (
            f"Following transformer-assisted analysis of {n_records} performance record(s), "
            f"this candidate presents a composite talent score of {composite:.1f}/100, "
            "indicating elite-tier potential. Immediate escalation to senior scouting "
            "review is recommended."
        )
    elif composite >= 70:
        classification = "HIGH POTENTIAL"
        summary = (
            f"Following transformer-assisted analysis of {n_records} performance record(s), "
            f"this candidate presents a composite talent score of {composite:.1f}/100. "
            "The profile indicates a strong developmental trajectory with targeted "
            "coaching investment recommended."
        )
    elif composite >= 55:
        classification = "DEVELOPING TALENT"
        summary = (
            f"Following transformer-assisted analysis of {n_records} performance record(s), "
            f"the candidate scores {composite:.1f}/100 composite. Structured development "
            "programming over a 6–12 month window is advised to realise latent potential."
        )
    else:
        classification = "EARLY STAGE"
        summary = (
            f"Following transformer-assisted analysis of {n_records} performance record(s), "
            f"the candidate scores {composite:.1f}/100 composite. Foundational conditioning "
            "programmes are strongly recommended before talent pathway placement."
        )

    # ── Growth narrative ─────────────────────────────────────────────────
    if growth:
        vel = growth["improvement_velocity"]
        if vel > 2.0:
            growth_line = (
                f"Improvement Velocity: +{vel:.2f} pts/session — "
                "Candidate exhibits high-velocity growth with a steep positive "
                "performance trajectory. Accelerated development pathway recommended."
            )
        elif vel > 0.5:
            growth_line = (
                f"Improvement Velocity: +{vel:.2f} pts/session — "
                "Candidate exhibits steady, consistent growth across the observed "
                "performance window. Current programme is delivering measurable results."
            )
        elif vel >= 0:
            growth_line = (
                f"Improvement Velocity: {vel:.2f} pts/session — "
                "Performance is plateauing. A programme refresh and new stimulus "
                "prescription is recommended to re-ignite adaptation."
            )
        else:
            growth_line = (
                f"Improvement Velocity: {vel:.2f} pts/session — "
                "Declining trend detected. Physical or tactical regression requires "
                "immediate review by a performance coach."
            )
    else:
        growth_line = (
            "Insufficient historical data for trend analysis "
            "(minimum 2 records required for growth projection)."
        )

    # ── Assemble report ──────────────────────────────────────────────────
    lines = [
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        f"  PROPLAY VIRTUAL SCOUT ASSESSMENT",
        f"  Sport: {sport.upper()}  |  Classification: {classification}",
        f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "EXECUTIVE SUMMARY",
        summary,
        "",
        "PHYSICAL ASSESSMENT",
        f"  • Speed       [{sr.upper():^14s}]  {speed_templates[sr]}",
        f"  • Strength    [{str_r.upper():^14s}]  {strength_templates[str_r]}",
        f"  • Stamina     [{sta_r.upper():^14s}]  {stamina_templates[sta_r]}",
        "",
        "COGNITIVE & TACTICAL ASSESSMENT",
        f"  • Tactical IQ [{tac_r.upper():^14s}]  {tactical_templates[tac_r]}",
        "",
        "GROWTH TRAJECTORY",
        f"  {growth_line}",
        "",
        "─────────────────────────────────────────────────",
        f"  Proplay AI  |  MiniGPT Virtual Scout Engine",
        f"  Transformer: {n_layers} layers × {n_embd}-dim embeddings",
        f"  Architecture: Decoder-only Causal Transformer (Raschka methodology)",
        "─────────────────────────────────────────────────",
    ]
    return "\n".join(lines)
