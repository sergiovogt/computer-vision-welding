# Detector de Defectos de Soldadura

Este proyecto implementa un sistema de detección de defectos en soldaduras utilizando YOLOv8. Permite realizar inferencias tanto con imágenes estáticas como en tiempo real usando la cámara web.

## Requisitos Previos

### Requisitos Mínimos
- Python 3.8 o superior
- 4GB de RAM
- Procesador Intel/AMD de doble núcleo o superior
- Cámara web (para detección en tiempo real)

### Requisitos Recomendados
- CUDA compatible GPU (para mejor rendimiento)
- 8GB de RAM o superior
- Procesador Intel/AMD de cuatro núcleos o superior

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/sergiovogt/computer-vision-welding
cd ocr-soldaduras
```

2. Crea y activa un entorno virtual:
```bash
python -m venv venv
# En Windows:
venv\Scripts\activate
# En Linux/Mac:
source venv/bin/activate
```

3. Instala las dependencias:
```bash
# Para CPU:
pip install -r requirements.txt

# Para GPU (si tienes CUDA):
pip install -r requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

## Modelo

El modelo entrenado se encuentra en la carpeta `working/` del repositorio. Este modelo ha sido entrenado específicamente para detectar defectos en soldaduras.

### Base de Datos
La base de datos utilizada para entrenar este modelo fue obtenida de: [Welding Defect Object Detection](https://www.kaggle.com/datasets/sukmaadhiwijaya/welding-defect-object-detection/data) en Kaggle.

### Estructura del Modelo
```
working/
└── yolov9n.pt  # Modelo principal para detección de defectos
```

### Especificaciones del Modelo
- Arquitectura: YOLOv8
- Tamaño del modelo: [Especificar tamaño]
- Precisión: [Especificar precisión]
- Clases detectadas: [Especificar clases]

## Uso del Programa

### Aplicación Web

Para usar la aplicación web:

1. Inicia el servidor:
```bash
python app.py
```

2. Abre tu navegador y visita:
```
http://localhost:8000
```

La aplicación web ofrece las siguientes funcionalidades:
- Subir imágenes para detección
- Usar la cámara web para detección en tiempo real
- Ver resultados detallados de las detecciones
- Interfaz responsive que funciona en dispositivos móviles

### Interfaz de Usuario

El programa proporciona una interfaz gráfica con dos opciones principales:

1. **Abrir Imagen**
   - Haz clic en el botón "Abrir Imagen"
   - Selecciona una imagen de tu computadora
   - El programa mostrará la imagen con los defectos detectados
   - Se mostrará el número total de defectos encontrados

2. **Usar Cámara**
   - Haz clic en el botón "Usar Cámara"
   - La cámara web se activará y comenzará la detección en tiempo real
   - Los defectos se detectarán y mostrarán en tiempo real
   - Para detener la cámara, haz clic nuevamente en el botón

### Formatos de Imagen Soportados

- JPG/JPEG
- PNG
- BMP
- GIF

## Interpretación de Resultados

- Los defectos detectados se marcan con cajas delimitadoras
- El número total de defectos se muestra en la parte inferior de la ventana
- Cada defecto detectado se muestra con su confianza (score)

## Uso sin CUDA

El programa funcionará en una PC sin GPU CUDA, pero con algunas consideraciones:

1. **Rendimiento**:
   - La detección será más lenta que con GPU
   - El procesamiento de imágenes en tiempo real puede tener un FPS más bajo
   - Se recomienda usar imágenes de menor resolución para mejor rendimiento

2. **Optimizaciones para CPU**:
   - Reduce el tamaño de la ventana de la cámara
   - Considera procesar cada 2-3 frames en lugar de cada frame
   - Usa imágenes más pequeñas para el análisis

3. **Limitaciones**:
   - La detección en tiempo real puede tener latencia
   - El procesamiento de imágenes grandes puede tomar más tiempo
   - Puede haber retrasos en la interfaz de usuario durante el procesamiento

## Solución de Problemas

1. **La cámara no se inicia**
   - Verifica que tu cámara web esté conectada y funcionando
   - Asegúrate de que no haya otro programa usando la cámara

2. **El modelo no carga**
   - Verifica que el modelo existe en la carpeta `working/`
   - Asegúrate de que el archivo del modelo no está corrupto
   - Verifica que tienes permisos de lectura en la carpeta del modelo

3. **Rendimiento lento**
   - Si tienes GPU: Verifica que CUDA esté instalado correctamente
   - Si usas CPU: Reduce el tamaño de las imágenes o la frecuencia de procesamiento
   - Cierra otras aplicaciones que consuman recursos

4. **Uso alto de CPU**
   - Reduce la resolución de la cámara
   - Aumenta el intervalo entre frames procesados
   - Considera usar un modelo más ligero

5. **Problemas con la aplicación web**
   - Verifica que el servidor esté ejecutándose en el puerto 8000
   - Asegúrate de que no haya otro servicio usando el mismo puerto
   - Si usas un firewall, permite el tráfico en el puerto 8000

## Despliegue en Producción

Para desplegar la aplicación web en un entorno de producción:

1. Configura un servidor web como Nginx o Apache
2. Usa un servidor WSGI como Gunicorn
3. Configura HTTPS para seguridad
4. Ajusta la configuración CORS para permitir solo los orígenes necesarios
5. Considera usar un servicio de carga para manejar múltiples solicitudes

## Contribuir

Si deseas contribuir al proyecto:
1. Haz un Fork del repositorio
2. Crea una rama para tu característica
3. Envía un Pull Request

## Licencia

MIT License

Copyright (c) 2024

Se concede permiso, de forma gratuita, a cualquier persona que obtenga una copia de este software y archivos de documentación asociados (el "Software"), para utilizar el Software sin restricciones, incluyendo, sin limitación, los derechos de usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del Software, y permitir a las personas a quienes se les proporcione el Software hacer lo mismo, sujeto a las siguientes condiciones:

El aviso de copyright anterior y este aviso de permiso se incluirán en todas las copias o partes sustanciales del Software.

EL SOFTWARE SE PROPORCIONA "TAL CUAL", SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUYENDO PERO NO LIMITADO A LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR Y NO INFRACCIÓN. EN NINGÚN CASO LOS AUTORES O TITULARES DE DERECHOS DE AUTOR SERÁN RESPONSABLES POR CUALQUIER RECLAMACIÓN, DAÑOS U OTRAS RESPONSABILIDADES, YA SEA EN UNA ACCIÓN DE CONTRATO, AGRAVIO O DE OTRO MODO, QUE SURJA DE, FUERA DE O EN CONEXIÓN CON EL SOFTWARE O EL USO U OTROS NEGOCIOS EN EL SOFTWARE. 