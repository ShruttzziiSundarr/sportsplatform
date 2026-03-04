from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from intelligence import predict_growth

app = FastAPI()

# Designing the data shape for our AI service
class AthleteMetrics(BaseModel):
    speed: float
    strength: float
    stamina: float
    tactical: float

@app.get("/")
def read_root():
    return {"status": "AI Service is Online", "model": "Talent Intelligence v1.0"}

@app.post("/calculate-score")
async def calculate_score(metrics: AthleteMetrics):
    # This is where our logic will live
    composite = (metrics.speed * 0.4) + (metrics.strength * 0.2) + (metrics.stamina * 0.2) + (metrics.tactical * 0.2)
    return {
        "composite_score": round(composite, 2),
        "rank_category": "Elite" if composite > 85 else "Developing"
    }

class GrowthRequest(BaseModel):
    scores: List[float]

@app.get("/")
def health_check():
    return {"status": "AI Intelligence Service Active"}

@app.post("/predict-growth")
async def get_growth_prediction(data: GrowthRequest):
    result = predict_growth(data.scores)
    if not result:
        return {"error": "Provide at least 2 past scores to calculate growth."}
    return result