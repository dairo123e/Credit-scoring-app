import requests
import base64
import os
import json
import base64
from io import BytesIO

# config
API_URL = "http://localhost:8080/cnn_xray_demo"

# image path
IMAGE_PATH = "examples/images/anomaly_rx_test.jpeg"

# save
OUTPUT_DIR = "tests/results"


def decode_and_save_image(base64_string, output_path):
    try:
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)
        with open(output_path, "wb") as f:
            f.write(image_data)
        print(f"🖼️  Imagen guardada en: {output_path}")
    except Exception as e:
        print(f"❌ Error guardando imagen {output_path}: {e}")


def main():
    # 1. check image
    if not os.path.exists(IMAGE_PATH):
        print(f"❌ Error: No se encontró la imagen de prueba en: {IMAGE_PATH}")
        print("   Por favor, edita la variable 'IMAGE_PATH' en este script.")
        return

    # 2. create folder
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    print(f"🚀 Iniciando prueba de solicitud a: {API_URL}")
    print(f"📂 Imagen a procesar: {IMAGE_PATH}")

    # 3. code image
    with open(IMAGE_PATH, "rb") as image_file:
        base64_utf8_str = base64.b64encode(image_file.read()).decode('utf-8')

    # 4. prepare
    payload = {
        "image_base64": base64_utf8_str
    }

    # 5. send request POST
    try:
        print("⏳ Enviando petición al servidor (esto puede tardar unos segundos la primera vez)...")
        response = requests.post(API_URL, json=payload)

        # 6. process response
        if response.status_code == 200:
            data = response.json()

            print("\n✅ ¡ÉXITO! Respuesta recibida del servidor:")
            print("-" * 40)

            # show predict
            pred = data["prediction"]
            print(f"🧠 PREDICCIÓN: {pred['label']} (Confianza: {pred['confidence']:.4f})")

            # times
            perf = data["performance"]
            print(f"⏱️  TIEMPOS:")
            print(f"   - Pre-procesamiento: {perf['preprocess_time_ms']} ms")
            print(f"   - Inferencia (Modelo): {perf['inference_time_ms']} ms")
            print(f"   - GradCAM (Mapa de calor): {perf['explainability_time_ms']} ms")
            print(f"   - Latencia Total: {perf['total_latency_ms']} ms")

            # save images
            expl = data["explainability"]
            decode_and_save_image(expl["heatmap_base64"], os.path.join(OUTPUT_DIR, "resultado_heatmap.png"))
            decode_and_save_image(expl["overlay_base64"], os.path.join(OUTPUT_DIR, "resultado_overlay.png"))

            print("-" * 40)
            print(f"✨ Revisa la carpeta '{OUTPUT_DIR}' para ver las imágenes generadas.")

        else:
            print(f"❌ Error en la petición. Código: {response.status_code}")
            print(f"Detalle: {response.text}")

    except requests.exceptions.ConnectionError:
        print(f"❌ Error de Conexión: No se pudo conectar a {API_URL}")
        print("   ¿Está corriendo tu contenedor Docker? (docker ps)")
        print("   ¿Estás usando el puerto correcto (8080)?")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")


if __name__ == "__main__":
    main()

    