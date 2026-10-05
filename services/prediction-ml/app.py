"""Composition root: wire the ML output adapter to the HTTP input adapter."""
import logging
import os

from src.application.predict_risk import PredictRiskUseCase
from src.domain.risk import ModelsUnavailableError
from src.infrastructure.ensemble_predictor import EnsemblePredictor
from src.presentation.http import create_http_app


def create_app():
    try:
        predictor = EnsemblePredictor()
    except ModelsUnavailableError:
        logging.getLogger(__name__).exception("No se pudo iniciar el ensamble")
        return create_http_app(None, 0)
    return create_http_app(PredictRiskUseCase(predictor), predictor.models_loaded)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_app().run(host="0.0.0.0", port=int(os.environ.get("PORT", "5001")), debug=False)
