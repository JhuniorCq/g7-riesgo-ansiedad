"""Manual integration check with real models over HTTP; run from service root."""
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def request_json(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    request = Request(f"http://127.0.0.1:5001{path}", data=data,
                      headers={"Content-Type": "application/json"})
    try:
        response = urlopen(request, timeout=20)
    except HTTPError as error:
        response = error
    with response:
        return response.status, json.load(response)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    process = subprocess.Popen([sys.executable, "app.py"], cwd=root,
                               env={**os.environ, "PORT": "5001"})
    try:
        for attempt in range(60):
            if process.poll() is not None:
                raise RuntimeError("El servicio terminó antes de estar disponible")
            try:
                health = request_json("/health")
                break
            except URLError:
                time.sleep(.5)
        else:
            raise RuntimeError("El servicio no inició a tiempo")
        assert health == (200, {"service": "prediction-ml", "status": "OK", "models_loaded": 5}), health
        payload = json.loads((root / "example.json").read_text())
        valid = request_json("/predict", payload)
        assert valid[0] == 200 and valid[1]["nivel_riesgo"] == "ALTO", valid
        assert 0 <= valid[1]["probabilidad_ansiedad"] <= 1
        del payload["gad7_score"]
        invalid = request_json("/predict", payload)
        assert invalid[0] == 400 and "gad7_score" in invalid[1]["error"], invalid
        print("HEALTH:", health)
        print("PREDICT:", valid)
        print("INVALID:", invalid)
    finally:
        process.terminate()
        process.wait(timeout=10)
