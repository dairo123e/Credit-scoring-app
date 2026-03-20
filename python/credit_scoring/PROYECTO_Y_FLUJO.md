# Credit Scoring — Proyecto y flujo completo

Documento que describe el proyecto de **Credit Scoring** (puntuación de riesgo crediticio), su arquitectura, componentes y flujo de datos de extremo a extremo.

---

## 1. Descripción del proyecto

El proyecto **Credit Scoring** es un microservicio de **Deep Learning** que predice el **riesgo crediticio** de un solicitante (clasificación binaria: **good** / **bad**) usando:

- **Dataset:** German Credit Risk (atributos demográficos y financieros).
- **Modelo:** MLP (Multi-Layer Perceptron) con PyTorch.
- **Preprocesamiento:** Pipeline con scikit-learn (escalado numérico + codificación categórica).
- **API:** FastAPI para inferencia en tiempo real.

Forma parte del curso de Deep Learning de [inGeniia.co](https://www.ingeniia.co) y está pensado para llevarse desde entrenamiento hasta producción (por ejemplo, en Google Cloud Run).

---

## 2. Estructura del proyecto

```
python/credit_scoring/
├── config/
│   └── training/
│       ├── credit_scoring-training_config-german_credit_risk_v100.yaml
│       ├── credit_scoring-training_config-german_credit_risk_v110.yaml
│       ├── credit_scoring-training_config-german_credit_risk_v120.yaml
│       └── credit_scoring-training_config-german_credit_risk_v130.yaml
├── models/                          # Artefactos (modelo .pt + preprocesador .joblib)
├── reports/                         # Reportes y gráficos de entrenamiento
├── src/
│   ├── processing/                  # Preprocesamiento de datos
│   │   └── main.py                  # CreditDataPreprocessor
│   ├── training/                    # Entrenamiento del modelo
│   │   ├── model.py                 # CreditScoringModel (MLP)
│   │   └── train.py                 # Pipeline de entrenamiento
│   ├── inference/                   # Inferencia
│   │   └── predictor.py             # CreditRiskPredictor
│   └── server/                      # API REST
│       ├── app.py                   # FastAPI app, endpoint /mlp_demo
│       └── schemas.py               # Pydantic: CreditRiskInput, CreditRiskOutput
├── tests/
│   └── test_model_creation.py       # Tests del modelo MLP
├── Dockerfile
├── requirements_training.txt
├── README.md
└── PROYECTO_Y_FLUJO.md              # Este documento
```

---

## 3. Flujo completo (de datos a predicción)

El flujo se divide en **dos grandes fases**: **entrenamiento** (offline) e **inferencia** (servicio en línea).

### 3.1. Fase 1: Entrenamiento (offline)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  CSV (dataset)  │────▶│  Preprocesador    │────▶│  Train/Val      │
│  German Credit  │     │  (fit + transform)│     │  split          │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Modelo .pt +   │◀────│  Entrenamiento   │◀────│  Tensores        │
│  Preprocessor   │     │  MLP + MLflow    │     │  (X_train, y_*)  │
│  .joblib        │     │  + reportes      │     └─────────────────┘
└─────────────────┘     └──────────────────┘
```

**Pasos concretos:**

1. **Carga de datos**  
   - Se lee el CSV del dataset German Credit Risk desde la ruta definida en el YAML de configuración.

2. **Split train/validation**  
   - `train_test_split` con `stratify=Risk` para mantener proporción de clases.

3. **Preprocesamiento**  
   - **CreditDataPreprocessor** (`src/processing/main.py`):
     - **Numéricas:** `Age`, `Job`, `Credit amount`, `Duration` → `StandardScaler`.
     - **Categóricas:** `Sex`, `Housing`, `Saving accounts`, `Checking account`, `Purpose` → `OneHotEncoder(handle_unknown="ignore")`.
   - Se hace `fit` solo con el conjunto de entrenamiento y se guarda el **ColumnTransformer** en `models/german_credit_risk_preprocessor.joblib`.

4. **Entrenamiento del modelo**  
   - **CreditScoringModel** (`src/training/model.py`): MLP con capas ocultas configurables, BatchNorm, Dropout y activación (ReLU, LeakyReLU, GELU).
   - **train.py**:
     - Optimizador (Adam/AdamW/SGD), `BCEWithLogitsLoss` (opcionalmente con `pos_weight` para desbalance).
     - ReduceLROnPlateau y early stopping.
     - Guardado del mejor modelo en `models/<model_name>.pt`.
   - Métricas: loss, accuracy, precision, recall, F1, ROC-AUC (train y val).

5. **Registro y reportes (MLflow)**  
   - Parámetros, métricas por época y finales.
   - Gráficos: loss/accuracy train vs val, ROC, precision-recall, matriz de confusión.
   - Reporte YAML de rendimiento y artefactos (modelo, preprocesador).

**Comando típico:**

```bash
cd python/credit_scoring
python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v110.yaml
```

(Se pueden usar los otros YAML v100, v120, v130 según la versión deseada.)

---

### 3.2. Fase 2: Inferencia (API)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cliente HTTP   │────▶│  FastAPI          │────▶│  CreditRisk     │
│  POST /mlp_demo │     │  (schemas valid.) │     │  Predictor      │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
              ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
              │                                           ▼                                           │
              │  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐              │
              │  │  Input → DataFrame│────▶│  Preprocessor   │────▶│  Tensor → MLP     │              │
              │  │  (Pydantic)       │     │  .transform()   │     │  sigmoid → prob   │              │
              │  └──────────────────┘     └──────────────────┘     └────────┬─────────┘              │
              │                                                             │                         │
              │                                                             ▼                         │
              │  ┌──────────────────┐     ┌──────────────────┐                                        │
              │  │  CreditRiskOutput │◀────│  prediction       │  {"prediction": "good", "probability": 0.78}
              │  │  (Pydantic)       │     │  good/bad + prob  │                                        │
              │  └──────────────────┘     └──────────────────┘                                        │
              │                                                                                         │
              └─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Pasos concretos:**

1. **Cliente** envía un `POST` a `/mlp_demo` con un JSON que cumple el esquema **CreditRiskInput** (edad, sexo, job, vivienda, cuentas, monto, duración, propósito).

2. **FastAPI** valida el cuerpo con Pydantic (`schemas.py`): tipos, enums (Sex, Housing, Purpose, etc.) y restricciones (p. ej. `Age > 0`, `Job` 0–3).

3. **CreditRiskPredictor** (`src/inference/predictor.py`):
   - Convierte el input a un `DataFrame` de una fila (nombres de columnas alineados con el entrenamiento).
   - Aplica `preprocessor.transform(input_df)` (mismo pipeline que en entrenamiento).
   - Convierte la salida a tensor y ejecuta el modelo en modo eval; aplica sigmoid para obtener probabilidad.
   - Umbral 0.5 → `"good"` o `"bad"`.
   - Devuelve `{"prediction": "...", "probability": ...}`.

4. **Respuesta** se serializa con **CreditRiskOutput** y se envía al cliente.

El predictor se instancia una vez al arrancar el servidor (singleton) y reutiliza el mismo modelo y preprocesador cargados desde `models/`.

---

## 4. Componentes principales

| Componente | Ubicación | Responsabilidad |
|------------|-----------|------------------|
| **CreditDataPreprocessor** | `src/processing/main.py` | Definir features numéricas/categóricas, armar `ColumnTransformer`, fit y transform. |
| **CreditScoringModel** | `src/training/model.py` | MLP configurable (capas, dropout, batch norm, activación); `forward`, `predict_proba`, `predict`. |
| **CreditScoringModelTraining** | `src/training/train.py` | Orquestar carga, preproceso, entrenamiento, early stopping, MLflow y guardado de artefactos. |
| **CreditRiskPredictor** | `src/inference/predictor.py` | Cargar modelo + preprocesador, transformar input y ejecutar inferencia. |
| **CreditRiskInput / CreditRiskOutput** | `src/server/schemas.py` | Esquemas Pydantic de entrada y salida de la API. |
| **FastAPI app** | `src/server/app.py` | Definir `/mlp_demo`, CORS, y delegar en el predictor. |

---

## 5. Configuración de entrenamiento (YAML)

Cada archivo bajo `config/training/` define:

- **data_source:** ruta del CSV, nombre del artefacto del modelo, nombre del preprocesador.
- **model_config:** nombre del modelo, arquitectura (hidden_layers, batch_norm, activation, dropout).
- **training_params:** test_size, random_state, epochs, batch_size, optimizer, learning_rate, weight_decay, loss (use_pos_weight), scheduler, early_stopping.
- **mlflow_config:** experiment name, run name prefix, tags.

Las versiones v100, v110, v120, v130 suelen variar en arquitectura o hiperparámetros para experimentación.

---

## 6. Modelo MLP (CreditScoringModel)

- **Entrada:** vector de tamaño `num_features` (tras preprocesamiento; p. ej. 26 con one-hot).
- **Oculta:** secuencia de capas `Linear → [BatchNorm1d] → Activation → Dropout` (configurable por YAML).
- **Salida:** una neurona lineal; se interpreta como logit y se aplica sigmoid para probabilidad de clase “good”.
- **Métodos:** `forward`, `predict_proba`, `predict` (umbral 0.5 por defecto).

El predictor en producción usa una configuración fija (p. ej. `BEST_MODEL_CONFIG` en `predictor.py`) que debe coincidir con el modelo guardado (mismo `num_features` y arquitectura).

---

## 7. Cómo ejecutar el proyecto con Docker

### Requisitos previos

- Tener el modelo (`.pt`) y el preprocesador (`.joblib`) en `python/credit_scoring/models/`.  
  Si aún no los tienes, entrena el modelo primero (ver sección **8. Cómo entrenar el modelo**).
- El `Dockerfile` espera un archivo `requirements.txt` en la misma carpeta. Si solo tienes `requirements_training.txt`, puedes copiarlo antes de construir:  
  `copy requirements_training.txt requirements.txt` (Windows) o `cp requirements_training.txt requirements.txt` (Linux/macOS).

### Construir la imagen

Desde la raíz del repo (o desde `python/credit_scoring/` si el Dockerfile está ahí):

```bash
# Opción A: Si el Dockerfile está en python/credit_scoring/
cd python/credit_scoring
docker build -t credit-scoring-api:1.0 -f Dockerfile .

# Opción B: Si construyes desde la raíz del repo con Dockerfile en otra ruta
docker build -t credit-scoring-api:1.0 -f python/credit_scoring/Dockerfile python/credit_scoring
```

### Ejecutar el contenedor

```bash
docker run -d -p 8000:8000 --name credit-scoring-service credit-scoring-api:1.0
```

- **-d:** en segundo plano.  
- **-p 8000:8000:** puerto 8000 del host → puerto 8000 del contenedor.  
- **--name:** nombre del contenedor.

### Comandos útiles

| Acción | Comando |
|--------|--------|
| Ver logs | `docker logs -f credit-scoring-service` |
| Detener | `docker stop credit-scoring-service` |
| Iniciar de nuevo | `docker start credit-scoring-service` |
| Eliminar contenedor | `docker stop credit-scoring-service && docker rm credit-scoring-service` |

### Probar que responde

- **Documentación Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)  
- **Health/raíz (redirige a docs):** [http://localhost:8000/](http://localhost:8000/)

---

## 8. Cómo entrenar el modelo

### Requisitos

- Python 3.11 (recomendado).
- Dataset en CSV: ruta configurada en el YAML (por defecto algo como `../../datasets/.../german_credit_risk.csv`).
- Dependencias de entrenamiento: `pip install -r requirements_training.txt` (desde `python/credit_scoring/`).

### Comando de entrenamiento

Desde `python/credit_scoring/`:

```bash
cd python/credit_scoring
pip install -r requirements_training.txt

python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v100.yaml
```

### Variantes de configuración

Puedes cambiar la arquitectura o hiperparámetros usando otro YAML:

```bash
# v1.0.0 — config base
python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v100.yaml

# v1.1.0
python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v110.yaml

# v1.2.0
python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v120.yaml

# v1.3.0
python src/training/train.py --config config/training/credit_scoring-training_config-german_credit_risk_v130.yaml
```

### Salidas del entrenamiento

- **Modelo:** `models/genia_services_mlp_credit_scoring_model_vX.X.X_20250824.pt` (nombre según el YAML).
- **Preprocesador:** `models/german_credit_risk_preprocessor.joblib`.
- **Reportes y gráficos:** carpeta `reports/` (curvas de loss/accuracy, ROC, matriz de confusión, etc.).
- **MLflow:** métricas y artefactos si tienes MLflow en marcha.

Asegúrate de que la ruta del dataset en el YAML (`data_source.data_path.dataset_path`) exista en tu máquina.

---

## 9. API en localhost — base URL y documentación

- **Base URL (local):** `http://localhost:8000`
- **Documentación interactiva (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Schema OpenAPI (JSON):** [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

### Ejecutar la API en local (sin Docker)

Desde `python/credit_scoring/`:

```bash
# Opción con uvicorn
uvicorn src.server.app:app --reload --host 0.0.0.0 --port 8000
```

La API quedará en `http://localhost:8000`. Con `--reload` se recargan los cambios al guardar.

---

## 10. API — Parámetros y prueba en Postman

### Endpoint de predicción

| Método | URL | Descripción |
|--------|-----|-------------|
| **POST** | `http://localhost:8000/mlp_demo` | Predicción de riesgo crediticio (good/bad) |

### Headers

| Header | Valor |
|--------|--------|
| **Content-Type** | `application/json` |
| **Accept** | `application/json` |

### Cuerpo de la petición (Body)

**Tipo:** raw → JSON.

Campos obligatorios y valores permitidos:

| Parámetro | Tipo | Restricciones | Descripción |
|-----------|------|----------------|-------------|
| **Age** | `int` | > 0 | Edad del solicitante (años). |
| **Sex** | `string` | `"male"` \| `"female"` | Sexo. |
| **Job** | `int` | 0 ≤ valor ≤ 3 | Nivel de habilidad laboral. |
| **Housing** | `string` | `"own"` \| `"rent"` \| `"free"` | Tipo de vivienda. |
| **Saving accounts** | `string` | `"NA"` \| `"little"` \| `"moderate"` \| `"quite rich"` \| `"rich"` | Estado cuenta de ahorros. |
| **Checking account** | `string` | `"NA"` \| `"little"` \| `"moderate"` \| `"rich"` | Estado cuenta corriente. |
| **Credit amount** | `number` | > 0 | Monto del crédito. |
| **Duration** | `int` | > 0 | Duración del crédito (meses). |
| **Purpose** | `string` | Ver tabla abajo | Propósito del crédito. |

**Valores permitidos para Purpose:**

- `"car"`
- `"furniture/equipment"`
- `"radio/TV"`
- `"domestic appliances"`
- `"repairs"`
- `"education"`
- `"business"`
- `"vacation/others"`

### Ejemplo de body para Postman

```json
{
  "Age": 35,
  "Sex": "male",
  "Job": 2,
  "Housing": "own",
  "Saving accounts": "little",
  "Checking account": "moderate",
  "Credit amount": 2500,
  "Duration": 24,
  "Purpose": "car"
}
```

### Configurar la petición en Postman

1. **Método:** POST.  
2. **URL:** `http://localhost:8000/mlp_demo`.  
3. **Headers:**  
   - `Content-Type`: `application/json`  
   - `Accept`: `application/json`  
4. **Body:**  
   - Pestaña **Body** → **raw** → tipo **JSON**.  
   - Pegar el JSON de ejemplo de arriba (o adaptar valores).  
5. Pulsar **Send**.

### Respuesta exitosa (200 OK)

```json
{
  "prediction": "good",
  "probability": 0.7852
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **prediction** | `string` | `"good"` o `"bad"` (riesgo crediticio). |
| **probability** | `float` | Probabilidad de clase "good" (entre 0 y 1). |

### Errores habituales

- **422 Unprocessable Entity:** Algún campo falta, tiene tipo incorrecto o un valor no permitido (p. ej. `Sex: "x"` o `Purpose` que no está en la lista). Revisa el body en Postman y que los nombres coincidan exactamente (incluido `"Saving accounts"` y `"Credit amount"` con espacio).
- **500 Internal Server Error:** Error interno (modelo no cargado, preprocesador, etc.). Revisa que existan `models/*.pt` y `models/german_credit_risk_preprocessor.joblib` y los logs del servidor.

---

## 11. API de inferencia (resumen)

- **Endpoint:** `POST /mlp_demo`
- **Request:** JSON con los campos de **CreditRiskInput** (alias para nombres con espacio, p. ej. "Saving accounts", "Credit amount").
- **Response:** **CreditRiskOutput** con `prediction` ("good" | "bad") y `probability` (float en [0, 1]).

---

## 12. Tests

- **tests/test_model_creation.py:**  
  - Instanciación del modelo con una config dada.  
  - Comprobación de la arquitectura (número y tipo de capas, dimensiones).  
  - Smoke test del forward pass (forma de salida).

Los tests asumen la estructura del proyecto (`src/training/model.py`) y una config de modelo coherente con el JSON de referencia si se usa.

---

## 13. Resumen del flujo de datos

1. **Entrenamiento:** CSV → split → preprocesador (fit en train) → tensores → entrenamiento MLP → guardado de `.pt` y `.joblib` + registro MLflow.
2. **Inferencia:** JSON (CreditRiskInput) → validación Pydantic → DataFrame → preprocessor.transform → tensor → MLP → sigmoid → prediction + probability → CreditRiskOutput.

Todo el flujo queda cerrado si el preprocesador y la arquitectura del modelo usados en inferencia coinciden con los del entrenamiento y la configuración (YAML / `BEST_MODEL_CONFIG`) está alineada con los artefactos guardados.

---

## 14. Despliegue en la nube (opcional)

- **Dockerfile:** multi-stage (builder + imagen final), Python 3.11, puerto 8000, comando `uvicorn src.server.app:app --host 0.0.0.0 --port 8000`.
- Los artefactos (`.pt` y `.joblib`) deben estar en `models/` dentro de la imagen (o montados/descargados en tiempo de arranque).
- **Google Cloud Run:** el README y el repo pueden incluir un flujo de CI/CD con Cloud Build (build → push a Artifact Registry → deploy a Cloud Run).
