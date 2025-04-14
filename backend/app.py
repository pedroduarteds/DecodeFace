from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import face_recognition
import numpy as np
import mysql.connector
import json
from datetime import datetime
import mediapipe as mp

# Inicializa o app Flask
app = Flask(__name__)
CORS(app)

# Criação da pasta de uploads
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# banco de dados
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '@EU_pedro12!',
    'database': 'decodeface'
}

# MediaPipe 
mp_face_detection = mp.solutions.face_detection
mp_drawing = mp.solutions.drawing_utils

# Salvar codificação no banco
def salvar_encoding_mysql(encoding, video_filename):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        encoding_str = json.dumps(encoding.tolist())
        created_at = datetime.now()
        cursor.execute("""
            INSERT INTO faces (encoding, video_filename, created_at)
            VALUES (%s, %s, %s)
        """, (encoding_str, video_filename, created_at))
        conn.commit()
        cursor.close()
        conn.close()
        print(" Rosto salvo no banco de dados.")
    except mysql.connector.Error as err:
        print("Erro ao salvar no MySQL:", err)

# Carregar codificações 
def carregar_encodings_mysql():
    encodings = []
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT encoding FROM faces")
        for (encoding_str,) in cursor.fetchall():
            encodings.append(np.array(json.loads(encoding_str)))
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print("Erro ao carregar do MySQL:", err)
    return encodings

# detectar MediaPipe
def detectar_faces_mediapipe(frame, detector):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = detector.process(rgb_frame)
    boxes = []

    if results.detections:
        for detection in results.detections:
            bbox = detection.location_data.relative_bounding_box
            h, w, _ = frame.shape
            top = int(bbox.ymin * h)
            left = int(bbox.xmin * w)
            width = int(bbox.width * w)
            height = int(bbox.height * h)
            boxes.append((top, left + width, top + height, left))  # top, right, bottom, left

    return boxes

# rota detecção 
@app.route('/api/detect', methods=['POST'])
def detectar_faces():
    file = request.files['video']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    print(f" Vídeo recebido: {file.filename}")
    print(f" Salvo em: {filepath}")

    video = cv2.VideoCapture(filepath)
    encodings_detectadas = []
    total_frames = 0
    frame_interval = 30

    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.6) as detector:
        while True:
            ret, frame = video.read()
            if not ret:
                break
            total_frames += 1

            if total_frames % frame_interval != 0:
                continue

            boxes = detectar_faces_mediapipe(frame, detector)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            encodings = face_recognition.face_encodings(rgb_frame, boxes)

            print(f" Frame {total_frames}: {len(boxes)} face(s) detectada(s)")

            for encoding in encodings:
                if not encodings_detectadas:
                    encodings_detectadas.append(encoding)
                    salvar_encoding_mysql(encoding, file.filename)
                    continue

                distances = face_recognition.face_distance(encodings_detectadas, encoding)
                if all(dist > 0.45 for dist in distances):
                    encodings_detectadas.append(encoding)
                    salvar_encoding_mysql(encoding, file.filename)

    video.release()

    print(f"✅ Detecção finalizada. Total de rostos únicos: {len(encodings_detectadas)}")

    return jsonify({
        'mensagem': 'Detecção concluída',
        'quantidade_faces': len(encodings_detectadas)
    })

# Rota de comparação 
@app.route('/api/compare', methods=['POST'])
def comparar_faces():
    file = request.files['video']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    print(f" Comparando rostos do vídeo: {file.filename}")

    video = cv2.VideoCapture(filepath)
    encodings_existentes = carregar_encodings_mysql()
    encontrados = 0
    total_frames = 0
    frame_interval = 30
    encodings_ja_encontrados = []

    with mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.6) as detector:
        while True:
            ret, frame = video.read()
            if not ret:
                break
            total_frames += 1

            if total_frames % frame_interval != 0:
                continue

            boxes = detectar_faces_mediapipe(frame, detector)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            encodings_novas = face_recognition.face_encodings(rgb_frame, boxes)

            for encoding in encodings_novas:
                distances = face_recognition.face_distance(encodings_existentes, encoding)
                if any(dist <= 0.5 for dist in distances):
                    if not any(face_recognition.compare_faces(encodings_ja_encontrados, encoding, tolerance=0.5)):
                        encontrados += 1
                        encodings_ja_encontrados.append(encoding)

    video.release()

    print(f"✅ Comparação finalizada. Rostos reconhecidos: {encontrados}")

    return jsonify({
        'mensagem': 'Comparação concluída',
        'rostos_reconhecidos': encontrados
    })


if __name__ == '__main__':
    app.run(debug=True)
