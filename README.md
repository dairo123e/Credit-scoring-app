#  Credit Scoring App

Aplicacion web para prediccion de riesgo crediticio mediante un modelo de Deep Learning (MLP).  
El sistema permite capturar datos financieros desde un formulario, enviar la informacion a una API REST y mostrar una prediccion de riesgo (`good` o `bad`) junto con su probabilidad.

---

##  Descripcion del proyecto

**Credit Scoring App** es una solucion academica orientada a evaluacion de riesgo crediticio.  
La aplicacion integra:

- Un **frontend** para captura de datos y visualizacion de resultados.
- Un **backend en Python** desplegable con Docker.
- Un **modelo MLP** para inferencia de clasificacion binaria.

---

##  Tecnologias utilizadas

### Frontend
- React (Vite)
- Tailwind CSS

### Backend
- Python
- Docker
- MLP (Perceptron Multicapa)

### Herramientas
- Git
- GitHub
- Postman

---

##  Instalacion y ejecucion

## 1) Clonar repositorio

```bash
git clone <https://github.com/dairo123e/Credit-scoring-app.git>
cd deep_learning_services
```

## 2) Ejecutar backend con Docker

Desde la raiz del proyecto:

```bash
docker build -t credit-scoring-api:1.0 -f python/credit_scoring/Dockerfile python/credit_scoring
docker run -d -p 8000:8000 --name credit-scoring-service credit-scoring-api:1.0
```

Verificar que este activo:

```bash
docker logs -f credit-scoring-service
```

## 3) Ejecutar frontend

```bash
cd frontend
npm install
npm run dev
```

Abrir en navegador:

```text
http://localhost:5173
```

> Nota: si el puerto 5173 esta ocupado, Vite usara otro puerto disponible (por ejemplo 5174, 5175, 5176).

---

##  Uso de la aplicacion

1. Abrir la interfaz web del frontend.
2. Completar los campos del formulario financiero.
3. Hacer clic en **Predict risk**.
4. Visualizar el resultado:
   - `good`  o `bad` 
   - Probabilidad del resultado (%)

---

##  API utilizada

### Endpoint
```text
http://localhost:8000/mlp_demo
```

### Metodo
```text
POST
```

### Ejemplo de request

```json
{
  "Age": 42,
  "Sex": "male",
  "Job": 3,
  "Housing": "own",
  "Saving accounts": "rich",
  "Checking account": "rich",
  "Credit amount": 5000,
  "Duration": 12,
  "Purpose": "car"
}
```

### Ejemplo de response

```json
{
  "prediction": "good",
  "probability": 0.57
}
```

---

##  Estructura del proyecto

```bash
deep_learning_services/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Formulario.jsx
│   │   │   └── Resultado.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── python/
│   └── credit_scoring/
│       ├── src/
│       │   ├── inference/
│       │   ├── processing/
│       │   ├── server/
│       │   └── training/
│       ├── models/
│       ├── reports/
│       ├── config/
│       └── Dockerfile
└── datasets/
```

---

##  Integrantes del grupo

- Stiven David Alvares Olmos 1 - Codigo: 1076647769
- Dairo Enrique Contreras Quintana 2 - Codigo: 1071608120


---

##  Objetivo academico

Desarrollar una aplicacion integral de Machine Learning aplicada a un problema real de riesgo crediticio, abarcando:

- Diseno de modelo de Deep Learning (MLP).
- Exposicion de inferencia mediante API.
- Integracion frontend-backend.
- Despliegue y ejecucion con Docker.
- Buenas practicas de documentacion y versionamiento.

---

##  Estado del proyecto

**Estado:**  Funcional / Terminado   
**Frontend:** operativo  
**Backend:** operativo  
**API de prediccion:** operativa  
**Integracion completa:** realizada
