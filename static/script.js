document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const cameraBtn = document.getElementById('cameraBtn');
    const statusText = document.getElementById('statusText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const imagePlaceholder = document.getElementById('imagePlaceholder');
    const resultImage = document.getElementById('resultImage');
    const cameraFeed = document.getElementById('cameraFeed');
    const resultsContainer = document.getElementById('resultsContainer');
    const modelInfo = document.getElementById('modelInfo');

    // Variables de estado
    let isCameraActive = false;
    let stream = null;
    let cameraInterval = null;

    // URL de la API (usar la URL actual)
    const API_URL = window.location.origin;

    // Cargar información del modelo
    fetchModelInfo();

    // Event listeners
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    cameraBtn.addEventListener('click', toggleCamera);

    // Funciones
    async function fetchModelInfo() {
        try {
            const response = await fetch(`${API_URL}/model-info`);
            const data = await response.json();
            
            modelInfo.textContent = `Modelo: ${data.model_name} | Clases: ${data.num_classes}`;
        } catch (error) {
            console.error('Error al obtener información del modelo:', error);
            modelInfo.textContent = 'Error al cargar información del modelo';
        }
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Mostrar la imagen seleccionada
        const reader = new FileReader();
        reader.onload = (e) => {
            resultImage.src = e.target.result;
            resultImage.style.display = 'block';
            imagePlaceholder.style.display = 'none';
            cameraFeed.style.display = 'none';
        };
        reader.readAsDataURL(file);

        // Enviar la imagen al servidor
        sendImageToServer(file);
    }

    async function sendImageToServer(file) {
        setLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Enviando imagen al servidor...');
            const response = await fetch(`${API_URL}/detect`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                displayResults(data);
            } else {
                showError('Error al procesar la imagen: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    }

    function toggleCamera() {
        if (isCameraActive) {
            stopCamera();
        } else {
            startCamera();
        }
    }

    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraFeed.srcObject = stream;
            cameraFeed.style.display = 'block';
            imagePlaceholder.style.display = 'none';
            resultImage.style.display = 'none';
            
            isCameraActive = true;
            cameraBtn.textContent = 'Detener Cámara';
            cameraBtn.classList.remove('secondary');
            cameraBtn.classList.add('danger');
            
            // Iniciar captura periódica
            cameraInterval = setInterval(captureAndProcessFrame, 1000); // Captura cada segundo
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            showError('No se pudo acceder a la cámara');
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        if (cameraInterval) {
            clearInterval(cameraInterval);
        }
        
        cameraFeed.style.display = 'none';
        imagePlaceholder.style.display = 'block';
        
        isCameraActive = false;
        cameraBtn.textContent = 'Activar Cámara';
        cameraBtn.classList.remove('danger');
        cameraBtn.classList.add('secondary');
    }

    async function captureAndProcessFrame() {
        // Crear un canvas para capturar el frame actual
        const canvas = document.createElement('canvas');
        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraFeed, 0, 0);
        
        console.log('Frame capturado:', canvas.width, 'x', canvas.height);
        
        // Convertir a blob
        canvas.toBlob(async (blob) => {
            // Crear un archivo a partir del blob
            const file = new File([blob], 'camera_frame.jpg', { type: 'image/jpeg' });
            console.log('Archivo creado:', file.size, 'bytes');
            
            // Enviar al servidor
            await sendImageToServer(file);
        }, 'image/jpeg');
    }

    function displayResults(data) {
        // Mostrar la imagen procesada siempre, incluso cuando la cámara está activa
        resultImage.src = `data:image/jpeg;base64,${data.image}`;
        resultImage.style.display = 'block';
        
        // Si la cámara está activa, ocultar el feed de la cámara
        if (isCameraActive) {
            cameraFeed.style.display = 'none';
        }
        
        // Mostrar resultados
        if (data.detections.length > 0) {
            let html = `<p>Se detectaron ${data.detections.length} elementos en ${data.inference_time.toFixed(2)} segundos</p>`;
            
            // Agregar resumen de detecciones
            html += `
                <div class="detection-summary">
                    <p>Defectos: ${data.total_defects}</p>
                    <p>Soldaduras: ${data.total_welds}</p>
                    <p>Malas soldaduras: ${data.total_bad_welds}</p>
                </div>
            `;
            
            // Agrupar detecciones por tipo
            const groupedDetections = {};
            data.detections.forEach(detection => {
                if (!groupedDetections[detection.class]) {
                    groupedDetections[detection.class] = [];
                }
                groupedDetections[detection.class].push(detection);
            });
            
            // Mostrar detecciones agrupadas por tipo
            for (const [className, detections] of Object.entries(groupedDetections)) {
                html += `<h4>${className} (${detections.length})</h4>`;
                
                detections.forEach((detection, index) => {
                    html += `
                        <div class="detection-item">
                            <h4>${className} ${index + 1}</h4>
                            <div class="confidence-bar">
                                <div class="confidence-level" style="width: ${detection.confidence * 100}%"></div>
                            </div>
                            <p>Confianza: ${(detection.confidence * 100).toFixed(2)}%</p>
                        </div>
                    `;
                });
            }
            
            resultsContainer.innerHTML = html;
        } else {
            resultsContainer.innerHTML = '<p class="no-results">No se detectaron elementos</p>';
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            statusText.textContent = 'Procesando imagen...';
            loadingIndicator.style.display = 'block';
        } else {
            statusText.textContent = 'Listo para detectar';
            loadingIndicator.style.display = 'none';
        }
    }

    function showError(message) {
        statusText.textContent = message;
        statusText.style.color = 'red';
        setTimeout(() => {
            statusText.textContent = 'Listo para detectar';
            statusText.style.color = '';
        }, 5000);
    }
}); 