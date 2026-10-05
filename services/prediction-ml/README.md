# prediction-ml

Servicio Flask independiente y sin persistencia. Estima riesgo; no produce diagnósticos.
Python 3.12. Dependencias fijadas a las versiones verificadas localmente.

## Inicio desde Git Bash (raíz del repositorio)

```bash
cd services/prediction-ml
python -m venv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
python app.py
```

Puerto predeterminado 5001; se puede ejecutar `PORT=5002 python app.py`.
El servidor de Flask se utiliza para pruebas locales, con debug desactivado.

## HTTP

- `GET http://localhost:5001/health`: 200 con `service`, `status`, `models_loaded`; 503 si no se cargaron los cinco modelos.
- `POST http://localhost:5001/predict`: Content-Type `application/json`; usar `example.json`.
- Las 15 variables son obligatorias, numéricas, finitas y dentro de los rangos de `src/presentation/validation.py`. Booleanos y cadenas numéricas se rechazan. Campos adicionales se ignoran.
- Entrada inválida: 400 con `error`. Modelos no disponibles: 503. Error de inferencia: 500. Los detalles técnicos solo aparecen en logs.

```bash
python -m unittest discover -s tests -v
python tests/verify_real_http.py
curl http://localhost:5001/health
curl -H 'Content-Type: application/json' --data-binary @example.json http://localhost:5001/predict
```

## Arquitectura

`app.py` es la raíz de composición. Conecta el adaptador de salida `EnsemblePredictor` con `PredictRiskUseCase` y el adaptador de entrada Flask.

- Domain: puerto `RiskPredictor`, errores y reglas de categorización; solo biblioteca estándar.
- Application: caso de uso dependiente del puerto, sin bibliotecas ML.
- Infrastructure: carga de cinco artefactos confiables del repositorio, verificación de metadatos y soft voting.
- Presentation: validación del contrato JSON y traducción HTTP.

SRP separa estas responsabilidades. DIP hace depender el caso de uso de una abstracción. OCP permite reemplazar el predictor al componer la aplicación sin cambiar el caso de uso.

Se construye un DataFrame en orden PHQ9, GAD7, OnlineStress, FinancialStress, ExerciseFreq, SocialActivity, SleepHours. Para KNN, entrenado sin nombres, se convierte a ndarray preservando ese orden. Cada modelo localiza clase 0 en `classes_`; se promedian sus cinco probabilidades con igual peso. BAJO < 0.35; MEDIO entre 0.35 y 0.70 inclusive; ALTO > 0.70. No hay entrenamiento ni fallback ni integración con usuarios.

## Metadatos y compatibilidad

Los cinco modelos contienen clases 0 y 1. CatBoost, LightGBM, Random Forest y XGBoost conservan los siete nombres en el orden requerido. KNN indica siete features pero no sus nombres, por lo que no es posible corroborar su orden original mediante metadatos; se aplica el contrato indicado. CatBoost reporta `n_features_in_=0` tras deserializar; sus siete nombres verifican la dimensión.

Se utiliza scikit-learn 1.6.1. XGBoost 3.3.0 emite un warning al cargar el pickle generado por una versión anterior: la compatibilidad entre versiones de snapshots pickle no está garantizada. No se oculta el warning y no se modifican los artefactos. Las versiones originales de las otras bibliotecas no fueron suministradas. Cualquier incompatibilidad detectada impide utilizar un ensamble parcial.

En Windows, joblib también puede advertir que no pudo detectar núcleos físicos y utilizar núcleos lógicos. La inferencia verificada finaliza correctamente. `verify_real_http.py` inicia temporalmente el servicio en el puerto 5001, verifica las tres solicitudes con modelos reales y detiene su proceso; ejecutar con ese puerto libre.
