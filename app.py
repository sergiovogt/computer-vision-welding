from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO
import io
import base64
from PIL import Image
import time
import os

app = FastAPI(title="Detector de Defectos de Soldadura API")

# Configurar CORS para permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Agregar headers de seguridad para la cámara
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    # Headers para CORS
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    # Headers para la cámara
    response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    return response

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Cargar el modelo
model = YOLO('working/yolov9n.pt')

@app.get("/")
async def root():
    return FileResponse("static/index.html")

@app.post("/detect")
async def detect_defects(file: UploadFile = File(...)):
    try:
        # Leer el archivo
        contents = await file.read()
        print(f"Archivo recibido: {len(contents)} bytes")
        
        # Convertir a imagen
        image = Image.open(io.BytesIO(contents))
        print(f"Imagen cargada: {image.size}")
        
        # Convertir a formato numpy para OpenCV
        image_np = np.array(image)
        print(f"Imagen convertida a numpy: {image_np.shape}")
        
        # Realizar la detección
        start_time = time.time()
        results = model(image_np)
        inference_time = time.time() - start_time
        print(f"Tiempo de inferencia: {inference_time:.2f} segundos")
        
        # Procesar resultados
        detections = []
        total_defects = 0
        total_welds = 0
        total_bad_welds = 0
        
        # Definir colores para diferentes tipos de detecciones
        colors = {
            'defecto': (0, 0, 255),    # Rojo (BGR)
            'soldadura': (0, 255, 0),  # Verde (BGR)
            'mala_soldadura': (0, 165, 255)  # Naranjo (BGR)
        }
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Obtener coordenadas
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                # Obtener clase y confianza
                cls = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = model.names[cls]
                
                # Determinar el color basado en la clase
                color = colors.get(class_name.lower(), (0, 255, 0))  # Verde por defecto
                
                # Dibujar el rectángulo
                cv2.rectangle(image_np, 
                            (int(x1), int(y1)), 
                            (int(x2), int(y2)), 
                            color, 2)
                
                # Agregar etiqueta
                label = f"{class_name} {conf:.2f}"
                cv2.putText(image_np, label, 
                          (int(x1), int(y1)-10), 
                          cv2.FONT_HERSHEY_SIMPLEX, 
                          0.5, color, 2)
                
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "bbox": [float(x1), float(y1), float(x2), float(y2)]
                })
                
                # Contar por tipo de detección
                if class_name.lower() == 'defecto':
                    total_defects += 1
                elif class_name.lower() == 'soldadura':
                    total_welds += 1
                elif class_name.lower() == 'mala_soldadura':
                    total_bad_welds += 1
        
        print(f"Detecciones encontradas: {len(detections)}")
        print(f"Defectos: {total_defects}, Soldaduras: {total_welds}, Malas soldaduras: {total_bad_welds}")
        
        # Convertir la imagen procesada a base64
        _, buffer = cv2.imencode('.jpg', image_np)
        img_str = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "success": True,
            "image": img_str,
            "detections": detections,
            "total_defects": total_defects,
            "total_welds": total_welds,
            "total_bad_welds": total_bad_welds,
            "inference_time": inference_time
        }
        
    except Exception as e:
        print(f"Error en la detección: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-info")
async def model_info():
    return {
        "model_name": "YOLOv8",
        "classes": model.names,
        "num_classes": len(model.names)
    }

if __name__ == "__main__":
    # Asegurarse de que la carpeta static existe
    os.makedirs("static", exist_ok=True)
    
    # Iniciar el servidor
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True) 