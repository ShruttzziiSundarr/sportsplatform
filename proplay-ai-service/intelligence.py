import numpy as np
from sklearn.linear_model import LinearRegression

def predict_growth(past_scores: list):
    """
    Predicts the next score based on a trend of past scores.
    """
    if len(past_scores) < 2:
        return None # Need at least two data points to see a trend
    
    # X = time steps (0, 1, 2...), Y = scores
    X = np.array(range(len(past_scores))).reshape(-1, 1)
    y = np.array(past_scores)
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict the next time step
    next_step = np.array([[len(past_scores)]])
    prediction = model.predict(next_step)
    
    # Calculate Velocity (the slope of the line)
    velocity = model.coef_[0]
    
    return {
        "predicted_next_score": round(float(prediction[0]), 2),
        "improvement_velocity": round(float(velocity), 2)
    }

def calculate_composite_score(metrics: dict, sport: str):
    # Defining weights for different sports
    weights = {
        "cricket": {"speed": 0.2, "strength": 0.3, "stamina": 0.2, "tactical": 0.3},
        "basketball": {"speed": 0.3, "strength": 0.2, "stamina": 0.3, "tactical": 0.2},
        "default": {"speed": 0.25, "strength": 0.25, "stamina": 0.25, "tactical": 0.25}
    }
    
    # Select weights based on sport, fallback to default
    w = weights.get(sport.lower(), weights["default"])
    
    score = (
        metrics['speed'] * w['speed'] +
        metrics['strength'] * w['strength'] +
        metrics['stamina'] * w['stamina'] +
        metrics['tactical'] * w['tactical']
    )
    
    return round(score, 2)