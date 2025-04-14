import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";

const Spinner = () => (
  <div className="flex justify-center mt-6">
    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center p-10 shadow-2xl rounded-3xl bg-gray-900/80 backdrop-blur">
        <CardContent>
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="DecodeFace Logo" className="w-24 h-24 mb-4" />
            <h1 className="text-6xl font-extrabold mb-4 text-white drop-shadow-lg">DecodeFace</h1>
            <p className="text-xl text-gray-300 max-w-lg">
              Envie um vídeo para detectar rostos ou compare com rostos já cadastrados. Nosso sistema utiliza
              inteligência artificial para reconhecimento facial eficiente e seguro.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button onClick={() => navigate("/upload")} className="text-lg px-8 py-4 bg-indigo-600 hover:bg-indigo-500 shadow-lg">
              Enviar vídeo
            </Button>
            <Button onClick={() => navigate("/compare")} className="text-lg px-8 py-4 bg-pink-600 hover:bg-pink-500 shadow-lg">
              Comparar rostos
            </Button>
          </div>
          <footer className="mt-10 text-sm text-gray-400">© 2025 DecodeFace. Todos os direitos reservados.</footer>
        </CardContent>
      </Card>
    </div>
  );
};

const Upload = () => {
  const [video, setVideo] = useState(null);
  const [detectionCompleted, setDetectionCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDetect = async () => {
    if (!video) return alert("Selecione um vídeo primeiro!");
    setLoading(true);
    setDetectionCompleted(false);

    const formData = new FormData();
    formData.append("video", video);

    try {
      const res = await fetch("http://localhost:5000/api/detect", {
        method: "POST",
        body: formData,
      });
      await res.json();
      setDetectionCompleted(true);
    } catch (err) {
      console.error("Erro ao detectar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center p-10 shadow-2xl rounded-3xl bg-gray-900/80 backdrop-blur">
        <CardContent>
          <h2 className="text-5xl font-extrabold mb-6">Upload de Vídeo</h2>
          <p className="text-gray-300 mb-6">Selecione um vídeo para detectar rostos automaticamente.</p>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="mb-6 w-full bg-gray-700 text-white p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
          />
          <Button onClick={handleDetect} className="px-6 py-3 text-lg bg-indigo-600 hover:bg-indigo-500 mb-6">
            {loading ? "Detectando..." : "Iniciar Detecção"}
          </Button>

          {loading && <Spinner />}
          {detectionCompleted && (
            <div className="mb-6 text-green-400 text-xl font-bold">✅ Detecção concluída</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Compare = () => {
  const [video, setVideo] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (!video) return alert("Selecione um vídeo primeiro!");
    setLoading(true);
    setMatchResult(null);

    const formData = new FormData();
    formData.append("video", video);

    try {
      const res = await fetch("http://localhost:5000/api/compare", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMatchResult(data.rostos_reconhecidos > 0);
    } catch (err) {
      console.error("Erro ao comparar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full text-center p-10 shadow-2xl rounded-3xl bg-gray-900/80 backdrop-blur">
        <CardContent>
          <h2 className="text-5xl font-extrabold mb-6">Comparar Rostos</h2>
          <p className="text-gray-300 mb-6">Envie um vídeo para verificar se há rostos correspondentes no sistema.</p>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="mb-6 w-full bg-gray-700 text-white p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-600 file:text-white hover:file:bg-pink-500"
          />
          <Button onClick={handleCompare} className="px-6 py-3 text-lg bg-pink-600 hover:bg-pink-500">
            {loading ? "Comparando..." : "Comparar"}
          </Button>

          {loading && <Spinner />}
          {matchResult !== null && (
            <p className={`mt-6 text-xl font-semibold ${matchResult ? "text-green-400" : "text-red-400"}`}>
              {matchResult ? "✅ Rosto correspondente encontrado!" : "❌ Nenhuma correspondência encontrada."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </Router>
  );
}

export default App;
