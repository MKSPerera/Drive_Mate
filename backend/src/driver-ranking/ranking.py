import numpy as np

def calculate_ranking(work_rate, feedback_rate, cancellation_rate, current_average_rate, is_biannual=False, total_drivers=None, driver_rank=None):
    """
    Calculate the overall ranking score for a driver based on multiple parameters using NumPy.
    
    Parameters:
    - work_rate: Number of days worked in a month (0-31)
    - feedback_rate: Sum of feedback scores (+1 good, -1 bad, 0 none)
    - cancellation_rate: Number of cancellations (each counts as -1)
    - current_average_rate: Current average rating (can be negative or positive)
    - is_biannual: Boolean indicating if this is a 6-month normalization
    - total_drivers: Total number of drivers (required for biannual normalization)
    - driver_rank: Current rank of the driver (required for biannual normalization)
    
    Returns:
    - final_score: Updated average rating
    """
    if is_biannual and (total_drivers is None or driver_rank is None):
        raise ValueError("total_drivers and driver_rank required for biannual normalization")

    # Convert inputs to numpy arrays for vectorized operations
    weights = np.array([1.5, 1.0, 2.0])  # [WORK_RATE, FEEDBACK, CANCELLATION]
    metrics = np.array([
        work_rate,
        feedback_rate,
        abs(cancellation_rate)
    ])

    # Monthly calculation using dot product
    monthly_contribution = np.dot(weights[:2], metrics[:2]) - (weights[2] * metrics[2])
    monthly_score = current_average_rate + monthly_contribution

    # For biannual normalization
    if is_biannual and total_drivers > 1:
        # Create rank array and normalize it
        ranks = np.arange(1, total_drivers + 1)
        normalized_scores = (ranks - 1) * total_drivers / (total_drivers - 1)
        
        # Get the normalized score for this driver's rank
        normalized_score = normalized_scores[driver_rank - 1]
        return round(float(normalized_score), 2)
    
    return round(float(monthly_score), 2)

def calculate_batch_rankings(drivers_data):
    """
    Calculate rankings for multiple drivers at once.
    
    Parameters:
    - drivers_data: List of dictionaries containing driver metrics
    
    Returns:
    - numpy array of scores
    """
    # Convert driver data to numpy arrays
    metrics = np.array([[
        d['workRate'],
        d['feedbackRate'],
        abs(d['cancellationRate']),
        d['averageRate']
    ] for d in drivers_data])

    # Weights for different factors
    weights = np.array([1.5, 1.0, 2.0])

    # Calculate monthly contributions using matrix multiplication
    monthly_contributions = np.dot(metrics[:, :2], weights[:2]) - (weights[2] * metrics[:, 2])
    scores = metrics[:, 3] + monthly_contributions  # Add to current averageRate

    return np.round(scores, 2)

def normalize_rankings(scores):
    """
    Normalize rankings from 0 to N (where N is the number of drivers)
    
    Parameters:
    - scores: numpy array of current scores
    
    Returns:
    - numpy array of normalized scores
    """
    total_drivers = len(scores)
    if total_drivers <= 1:
        return scores

    # Get ranks (1-based, ascending)
    ranks = total_drivers - np.argsort(np.argsort(scores))
    
    # Normalize to 0 to total_drivers range
    normalized_scores = (ranks - 1) * total_drivers / (total_drivers - 1)
    return np.round(normalized_scores, 2)

# Handle input from Node.js
if __name__ == "__main__":
    import sys
    import json

    # Read input from stdin
    input_str = sys.stdin.read()
    input_data = json.loads(input_str)

    # Check if this is a batch calculation
    if isinstance(input_data, list):
        # Calculate scores for all drivers
        scores = calculate_batch_rankings(input_data)
        
        # If it's biannual, normalize the scores
        if input_data[0].get('isBiannual', False):
            scores = normalize_rankings(scores)
        
        # Return all scores
        print(json.dumps({'scores': scores.tolist()}))
    else:
        # Single driver calculation
        result = calculate_ranking(
            input_data.get('workRate', 0),
            input_data.get('feedbackRate', 0),
            input_data.get('cancellationRate', 0),
            input_data.get('averageRate', 0),
            input_data.get('isBiannual', False),
            input_data.get('totalDrivers'),
            input_data.get('driverRank')
        )
        
        # Return single score
        print(json.dumps({'score': result}))
