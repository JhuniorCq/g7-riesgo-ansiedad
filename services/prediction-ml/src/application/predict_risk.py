from typing import Mapping

from src.domain.risk import RiskPredictor, categorize_risk


class PredictRiskUseCase:
    def __init__(self, predictor: RiskPredictor):
        self.predictor = predictor

    def execute(self, indicators: Mapping[str, float]) -> dict:
        probability = self.predictor.predict_probability(indicators)
        return {
            "nivel_riesgo": categorize_risk(probability),
            "probabilidad_ansiedad": probability,
        }
