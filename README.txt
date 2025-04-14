#  DecodeFace

DecodeFace é uma aplicação web que permite o **upload e comparação de vídeos com reconhecimento facial**. Utiliza tecnologias de **Visão Computacional e Inteligência Artificial**, combinando **MediaPipe**, **face_recognition**, **Flask** e **React** com interface moderna e responsiva.

---

##  Funcionalidades

-  Upload de vídeo para detecção facial
-  Armazenamento de codificações faciais em banco de dados MySQL
-  Comparação de rostos em novos vídeos com os já cadastrados
-  Processamento otimizado com MediaPipe + face_recognition
-  Interface web moderna com React + Tailwind CSS

---

##  Tecnologias utilizadas

### Backend
- Python 3
- Flask
- MediaPipe
- face_recognition
- OpenCV
- MySQL
- Flask-CORS

### Frontend
- React
- Tailwind CSS
- React Router DOM
- Componentes personalizados com Shadcn/UI

---


##  Como rodar o projeto localmente

### Pré-requisitos
- Python 3.10+
- Node.js e npm
- MySQL Server

###  Instalação do Backend

```bash
# Crie e ative um ambiente virtual (opcional)
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Instale as dependências
pip install flask flask-cors opencv-python mediapipe face_recognition numpy mysql-connector-python

##MYsql

CREATE DATABASE decodeface;

USE decodeface;

CREATE TABLE faces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    encoding LONGTEXT NOT NULL,
    video_filename VARCHAR(255),
    created_at DATETIME
);


Depois, rode o servidor:

python app.py 

💻 Instalação do Frontend

cd frontend
npm install
npm start
