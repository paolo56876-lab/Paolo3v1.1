
import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, RefreshCw } from 'lucide-react';

interface ImageGeneratorProps {
  onGenerate: (prompt: string) => Promise<string>;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const base64 = await onGenerate(prompt);
      setGeneratedImage(base64);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-6 w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 mb-2">
          Generador de Imágenes Paolo3
        </h2>
        <p className="text-slate-400">Transforma tus palabras en arte visual con la potencia de Paolo3.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl shadow-2xl mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe tu imagen... ej: Un paisaje futurista de una ciudad flotante en Marte, estilo cyberpunk."
          className="w-full bg-slate-900/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none h-32"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              isGenerating 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:shadow-lg hover:shadow-amber-400/20 transform hover:-translate-y-0.5'
            }`}
          >
            {isGenerating ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Sparkles size={20} />
            )}
            {isGenerating ? 'Imaginando...' : 'Generar Arte'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-slate-900/30 border-2 border-dashed border-slate-700 rounded-2xl overflow-hidden relative min-h-[400px]">
        {generatedImage ? (
          <div className="relative w-full h-full flex items-center justify-center group">
            <img src={generatedImage} alt="Generada" className="max-w-full max-h-[500px] object-contain shadow-2xl" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={generatedImage} 
                download={`paolo3-art-${Date.now()}.png`}
                className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-amber-400 transition-colors"
              >
                <Download size={20} /> Descargar Imagen
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500">
            <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
            <p>Tu creación aparecerá aquí</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
