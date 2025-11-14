
import React, { useState, useCallback, useRef } from 'react';
import { editImage, generateImage } from './services/geminiService';
import { fileToBase64 } from './utils/fileUtils';
import { ImageIcon, SparklesIcon, UploadIcon, WandIcon, BlueprintIcon } from './components/icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<'editor' | 'generator'>('editor');
  
  // Shared state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Generator state
  const [blueprintPrompt, setBlueprintPrompt] = useState<string>('');
  const [generatedBlueprint, setGeneratedBlueprint] = useState<string | null>(null);


  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setEditedImage(null);
      setError(null);
      setOriginalImageFile(file);
      try {
        const base64 = await fileToBase64(file);
        setOriginalImage(base64);
      } catch (err) {
        setError('Failed to read the image file.');
        console.error(err);
      }
    }
  }, []);
  
  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleGenerateEdit = async () => {
    if (!originalImage || !prompt || !originalImageFile) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const result = await editImage(base64Data, originalImageFile.type, prompt);
      if (result) {
        setEditedImage(`data:${originalImageFile.type};base64,${result}`);
      } else {
         setError('The model did not return an image. Please try a different prompt.');
      }
    } catch (err) {
      setError('An error occurred while generating the image. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateBlueprint = async () => {
    if (!blueprintPrompt) {
      setError('Please enter a description for your blueprint.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedBlueprint(null);

    try {
        const result = await generateImage(blueprintPrompt);
        if (result) {
            setGeneratedBlueprint(`data:image/png;base64,${result}`);
        } else {
            setError('The model did not return an image. Please try a different prompt.');
        }
    } catch (err) {
        setError('An error occurred while generating the blueprint. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'editor' | 'generator') => {
    setMode(newMode);
    setIsLoading(false);
    setError(null);
  }

  const ImagePlaceholder: React.FC<{ title: string, isLoading?: boolean }> = ({ title, isLoading }) => (
    <div className="w-full h-full min-h-[400px] bg-gray-800/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600 text-gray-400">
      {isLoading ? (
        <>
            <SparklesIcon className="w-12 h-12 animate-pulse text-banana" />
            <p className="mt-4 text-lg font-semibold">Conjuring your image...</p>
            <p className="text-sm text-gray-500">This can take a moment.</p>
        </>
      ) : (
        <>
          <ImageIcon className="w-16 h-16" />
          <p className="mt-2 font-semibold">{title}</p>
        </>
      )}
    </div>
  );
  
  const TabButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
    icon: React.ReactNode;
  }> = ({ isActive, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 sm:px-6 text-base sm:text-lg font-semibold border-b-2 transition-all duration-300 ${
            isActive
            ? 'border-banana text-white'
            : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
        }`}
        aria-current={isActive ? 'page' : undefined}
    >
        {icon}
        {children}
    </button>
  );


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
             <WandIcon className="w-10 h-10 text-banana" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-banana-light to-banana-dark text-transparent bg-clip-text">
              Nano Banana
            </h1>
          </div>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Use text prompts to magically edit images or generate technical blueprints with Gemini.
          </p>
        </header>
        
        <div className="flex justify-center border-b border-gray-700 mb-8">
            <TabButton isActive={mode === 'editor'} onClick={() => switchMode('editor')} icon={<WandIcon className="w-6 h-6" />}>
                Image Editor
            </TabButton>
            <TabButton isActive={mode === 'generator'} onClick={() => switchMode('generator')} icon={<BlueprintIcon className="w-6 h-6" />}>
                Blueprint Generator
            </TabButton>
        </div>
        
        {error && <p className="mb-4 text-red-400 text-center bg-red-900/20 p-3 rounded-lg">{error}</p>}

        {mode === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-gray-800/30 p-6 rounded-xl border border-gray-700 h-fit">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Upload Image</h2>
              <div
                className="w-full aspect-video bg-gray-800/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 cursor-pointer hover:border-banana hover:bg-gray-800 transition-colors"
                onClick={triggerFileSelect}
                role="button"
                aria-label="Upload an image"
                tabIndex={0}
              >
                {originalImage ? (
                  <img src={originalImage} alt="Original preview" className="max-h-full max-w-full object-contain rounded-md" />
                ) : (
                  <div className="text-center text-gray-400">
                    <UploadIcon className="w-10 h-10 mx-auto" />
                    <p className="mt-2 font-medium">Click to upload</p>
                    <p className="text-xs">PNG, JPG, WEBP, etc.</p>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-white">2. Describe Your Edit</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, make the sky look like a galaxy, remove the person in the background..."
                className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-banana-dark focus:border-banana-dark transition-colors placeholder-gray-500"
                disabled={!originalImage}
                aria-label="Image edit prompt"
              />

              <button
                onClick={handleGenerateEdit}
                disabled={!originalImage || !prompt || isLoading}
                className="w-full mt-6 py-3 px-6 bg-banana hover:bg-banana-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg shadow-lg shadow-banana/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Generating...' : 'Generate'}
                <SparklesIcon className="w-5 h-5"/>
              </button>
            </div>

            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-400">Original</h3>
                  {originalImage ? (
                    <img src={originalImage} alt="Original" className="w-full aspect-square object-contain rounded-lg bg-gray-800/50" />
                  ) : (
                    <ImagePlaceholder title="Upload an image to start" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-center text-gray-400">Edited</h3>
                  {editedImage ? (
                    <img src={editedImage} alt="Edited" className="w-full aspect-square object-contain rounded-lg bg-gray-800/50" />
                  ) : (
                    <ImagePlaceholder title="Your edited image will appear here" isLoading={isLoading} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-gray-800/30 p-6 rounded-xl border border-gray-700 h-fit">
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Describe Blueprint</h2>
              <textarea
                value={blueprintPrompt}
                onChange={(e) => setBlueprintPrompt(e.target.value)}
                placeholder="e.g., A hunter-gatherer permaculture village in the Amazon rainforest..."
                className="w-full h-36 p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-banana-dark focus:border-banana-dark transition-colors placeholder-gray-500"
                aria-label="Blueprint description prompt"
              />

              <button
                onClick={handleGenerateBlueprint}
                disabled={!blueprintPrompt || isLoading}
                className="w-full mt-6 py-3 px-6 bg-banana hover:bg-banana-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-bold rounded-lg shadow-lg shadow-banana/20 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? 'Generating...' : 'Generate Blueprint'}
                <SparklesIcon className="w-5 h-5"/>
              </button>
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-xl font-semibold mb-3 text-center text-gray-400">Generated Blueprint</h3>
              <div className="w-full aspect-square object-contain rounded-lg bg-gray-800/50">
                {generatedBlueprint ? (
                  <img src={generatedBlueprint} alt="Generated blueprint" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <ImagePlaceholder title="Your generated blueprint will appear here" isLoading={isLoading} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
