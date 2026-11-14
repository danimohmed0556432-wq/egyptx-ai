"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  X, 
  ArrowLeft, 
  Check, 
  Copy, 
  BookOpen, 
  Layers, 
  ShieldCheck,
  ChevronRight,
  Globe,
  Scan
} from 'lucide-react';

interface HieroglyphScanResult {
  symbols: string | string[] | any;
  english_translation: string;
  arabic_translation: string;
  localized_translation?: string;
  confidence: string | number;
  context?: {
    personOrKing?: string;
    era?: string;
    temple?: string;
    meaning?: string;
  };
}

const SAMPLE_INSCRIPTIONS = [
  {
    title: "Tutankhamun Cartouche",
    imageUrl: "/1.jpg",
    verifiedData: {
      symbols: "twt-ꜥnḫ-jmn ḥqꜣ-jwnw-šmꜥ",
      english_translation: "Living image of Amun, ruler of Southern Heliopolis",
      arabic_translation: "الصورة الحية لآمون، حاكم هليوبوليس الجنوبية (طيبة)",
      confidence: "100%",
      context: { 
        personOrKing: "Tutankhamun", 
        era: "18th Dynasty, New Kingdom", 
        temple: "Valley of the Kings", 
        meaning: "Asserts the king divine connection to Amun after the Amarna period." 
      }
    }
  },
  {
    title: "Offering Formula",
    imageUrl: "/2.jpg",
    verifiedData: {
      symbols: "ḥtp-dj-nsw wsjr nb-ḏdw nṯr-ꜥꜣ nb-Ꜣbḏw",
      english_translation: "An offering that the king gives to Osiris, Lord of Busiris, the Great God, Lord of Abydos",
      arabic_translation: "قربان يقدمه الملك لأوزوريس، سيد بوسيريس، الإله العظيم، سيد أبيدوس",
      confidence: "100%",
      context: { 
        personOrKing: "Osiris", 
        era: "Middle Kingdom (Typical)", 
        temple: "Funerary Stela", 
        meaning: "Standard invocation to ensure the deceased receives offerings in the afterlife." 
      }
    }
  },
  {
    title: "Ramses II Cartouche",
    imageUrl: "/3.jpg",
    verifiedData: {
      symbols: "wsr-mꜣꜥt-rꜥ stp-n-rꜥ",
      english_translation: "The Justice of Ra is Powerful, Chosen of Ra",
      arabic_translation: "عدالة رع قوية، المختار من رع",
      confidence: "100%",
      context: { 
        personOrKing: "Ramses II (The Great)", 
        era: "19th Dynasty, New Kingdom", 
        temple: "Abu Simbel / Karnak", 
        meaning: "Proclamation of supreme military and divine power, linking the king to Ra." 
      }
    }
  }
];

export default function HieroglyphScannerPage() {
  const { t, locale } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | Blob | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<HieroglyphScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationLang, setTranslationLang] = useState<'en' | 'ar'>(locale === 'ar' ? 'ar' : 'en');
  useEffect(() => {
    setTranslationLang(locale === 'ar' ? 'ar' : 'en');
  }, [locale]);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setErrorMessage(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setErrorMessage("Unable to access camera. Please check camera permissions or upload an image file.");
      setIsCameraActive(false);
    }
  };

  // Toggle Camera Facing
  const toggleFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture current video frame and send to scanner
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setSelectedImage(dataUrl);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setImageFile(file);
        stopCamera();
        handleScanImage(file);
      }
    }, 'image/jpeg', 0.85);
  };

  // Connect to Gemini Backend API route
  const handleScanImage = async (file: File | Blob) => {
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    try {
      const optimizedBlob = await new Promise<Blob>((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          const maxDim = 1024;
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const targetW = Math.max(1, Math.round(img.width * scale));
          const targetH = Math.max(1, Math.round(img.height * scale));
          const offscreen = document.createElement('canvas');
          offscreen.width = targetW;
          offscreen.height = targetH;
          const ctx = offscreen.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, targetW, targetH);
          offscreen.toBlob(
            (blob) => resolve(blob || file),
            'image/jpeg',
            0.82
          );
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        };
        img.src = objectUrl;
      });

      const formData = new FormData();
      formData.append('image', optimizedBlob, 'hieroglyph.jpg');
      formData.append('language', locale || 'en');

      const response = await fetch('/api/translate-hieroglyph', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Epigraphic vision analysis failed. Please verify image clarity.');
      }

      const data = await response.json();

      if (data.error && !data.english_translation && !data.symbols) {
        throw new Error(data.error);
      }

      setScanResult(data);
    } catch (err: any) {
      console.error("Hieroglyph translation error:", err);
      setErrorMessage(err.message || "Failed to analyze image. Please ensure hieroglyphs are clearly illuminated.");
    } finally {
      setIsScanning(false);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        stopCamera();
        await handleScanImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Process sample preset
  const handleSelectPreset = async (preset: typeof SAMPLE_INSCRIPTIONS[0]) => {
    stopCamera();
    setSelectedImage(preset.imageUrl);
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch(preset.imageUrl);
      const blob = await res.blob();
      const file = new File([blob], `${preset.title.toLowerCase().replace(/\s+/g, '-')}.jpg`, { type: blob.type || 'image/jpeg' });
      setImageFile(file);
      await handleScanImage(file);
    } catch {
      setTimeout(() => {
        setScanResult(preset.verifiedData);
        setIsScanning(false);
      }, 1000);
    }
  };

  // Copy transliteration & translation to clipboard
  const handleCopy = () => {
    if (!scanResult) return;
    const symbolsText = typeof scanResult.symbols === 'string' 
      ? scanResult.symbols 
      : Array.isArray(scanResult.symbols) 
        ? scanResult.symbols.join(', ') 
        : JSON.stringify(scanResult.symbols);

    const textToCopy = `[EgyptX Hieroglyph Deciphering]\nSymbols: ${symbolsText}\nEnglish Translation: ${scanResult.english_translation}\nArabic Translation: ${scanResult.arabic_translation}\nConfidence: ${scanResult.confidence}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset scanner
  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setScanResult(null);
    setErrorMessage(null);
    stopCamera();
  };

  // Calculate percentage width for confidence rating
  const getConfidenceWidth = (confidenceInput?: string | number | null): string => {
    if (confidenceInput === undefined || confidenceInput === null) return '85%';
    const str = String(confidenceInput).trim();
    if (!str) return '85%';
    const match = str.match(/\d+/);
    if (match) return `${match[0]}%`;
    const lower = str.toLowerCase();
    if (lower.includes('high')) return '95%';
    if (lower.includes('mod') || lower.includes('med')) return '75%';
    if (lower.includes('low')) return '45%';
    return '85%';
  };

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-gray-900 dark:text-white font-sans selection:bg-amber-500 selection:text-black"
      style={{ backgroundImage: "url('/Golden Hieroglyphs at Sunset.png')" }}
    >
      {/* Adaptive overlay to maximize UI legibility */}
      <div className="absolute inset-0 bg-[#FDFBF7]/92 dark:bg-black/75 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Main content container with higher z-index */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload} 
          className="hidden" 
        />

        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-40 px-4 sm:px-8 py-4 bg-[#FDFBF7]/90 dark:bg-gray-950/80 backdrop-blur-xl border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10 transition-colors"
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-yellow-200 dark:via-amber-400 dark:to-amber-600 flex items-center gap-2">
                {t('hieroglyph.title')}
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                  {t('hieroglyph.badge')}
                </span>
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light hidden sm:block">
                Decipher ancient carvings, cartouches, and stelae with neural archaeology
              </p>
            </div>
          </div>

          {selectedImage && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('hieroglyph.reset')}</span>
            </button>
          )}
        </header>

        {/* MAIN CONTENT CONTAINER */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-center justify-between shadow-sm animate-fade-in">
              <span>{errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)} 
                className="p-1 hover:text-red-900 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STAGE 1: CAMERA & UPLOAD SELECTION */}
          {!selectedImage && !isCameraActive && (
            <div className="space-y-8 animate-fade-in">
              {/* Hero Banner */}
              <div className="text-center space-y-3 max-w-2xl mx-auto py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Deciphering Royal Inscriptions
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
                  Scan Egyptian Glyphs <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 dark:from-amber-300 dark:via-amber-400 dark:to-yellow-500">
                    Reveal Ancient Voices
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                  Point your camera at temple walls, museum artifacts, or papyri. Our vision AI maps phonetic signs and verified dictionary translations in real-time.
                </p>
              </div>

              {/* Main Action Cards (Camera vs Upload) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                {/* Option 1: Live Camera */}
                <button
                  onClick={() => startCamera('environment')}
                  className="group relative p-8 rounded-3xl bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/[0.08] border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/30 border border-amber-500/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('hieroglyph.openCamera')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
                    Capture carvings directly at historical sites or museum display cases.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    Launch Viewfinder →
                  </span>
                </button>

                {/* Option 2: Upload Image */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative p-8 rounded-3xl bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/[0.08] border border-amber-500/30 hover:border-amber-400/70 transition-all duration-300 flex flex-col items-center text-center shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/30 border border-amber-500/50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('hieroglyph.uploadPhoto')}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
                    Select an image of hieroglyphic text from your device gallery.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    Browse Files →
                  </span>
                </button>
              </div>

              {/* Sample Presets Quick-Test Section */}
              <div className="max-w-3xl mx-auto pt-6 border-t border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    {t('hieroglyph.sampleInscriptions')}
                  </span>
                  <span className="text-[11px] text-gray-600 dark:text-gray-400">Click to test instantly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_INSCRIPTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPreset(preset)}
                      className="p-3 rounded-2xl bg-[#F8F3E9]/90 dark:bg-white/[0.03] hover:bg-[#EFE6D5] dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/10 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
                    >
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-300 truncate">
                        {preset.title}
                      </p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 truncate mt-0.5 font-mono">
                        {preset.verifiedData.symbols}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: LIVE CAMERA VIEWFINDER */}
          {isCameraActive && (
            <div className="relative max-w-xl mx-auto rounded-3xl overflow-hidden border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.3)] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[420px] sm:h-[480px] object-cover"
              />

              {/* Viewfinder Target Reticle Frame */}
              <div className="absolute inset-8 border border-dashed border-amber-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-t-2 border-l-2 border-amber-400" />
                  <div className="w-5 h-5 border-t-2 border-r-2 border-amber-400" />
                </div>
                <p className="text-center text-[11px] text-amber-300/80 font-mono tracking-wider bg-black/50 py-1 rounded-full px-3 self-center">
                  ALIGN GLYPHS WITHIN RETICLE
                </p>
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-b-2 border-l-2 border-amber-400" />
                  <div className="w-5 h-5 border-b-2 border-r-2 border-amber-400" />
                </div>
              </div>

              {/* Shutter & Camera Controls */}
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-6 z-20">
                <button
                  type="button"
                  onClick={toggleFacing}
                  className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                  title="Flip Camera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  title="Capture Glyphs"
                >
                  <div className="w-full h-full rounded-full border-2 border-gray-950 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-gray-950" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                  title="Cancel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: SCANNING & TRANSLATION RESULTS DASHBOARD */}
          {selectedImage && (
            <div className="space-y-8 animate-fade-in">
              {/* Image Preview with Laser Scanning Animation */}
              <div className="relative max-w-xl mx-auto rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-64 md:h-80 bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden border border-amber-500/30 flex items-center justify-center p-2 relative">
                  {selectedImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={selectedImage} 
                      alt="Scanned Inscription" 
                      className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
                    />
                  ) : (
                    <div className="text-amber-500/50 flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                      <span>Loading Source...</span>
                    </div>
                  )}

                  {/* Glowing Amber Laser Scanning Line */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <motion.div
                        animate={{ y: ['0%', '300px', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-full h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#f59e0b,0_0_40px_#f59e0b]"
                      />
                      <div className="absolute inset-0 bg-amber-500/10 animate-pulse" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                      isScanning 
                        ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                      <span>{isScanning ? t('hieroglyph.scanning') : t('hieroglyph.detectedSigns')}</span>
                    </span>
                  </div>

                  {/* Retake / Rescan Button */}
                  {!isScanning && (
                    <button
                      onClick={handleReset}
                      className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer shadow-lg"
                      title="Rescan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Scan Button Trigger (If image chosen and not scanning) */}
                {!isScanning && imageFile && (
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() => handleScanImage(imageFile)}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <Scan className="w-4 h-4" />
                      <span>Re-Analyze Hieroglyphs</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TRANSLATION RESULT BOX & DASHBOARD */}
              {scanResult && !isScanning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6 max-w-4xl mx-auto"
                >
                  {/* 1. SYMBOLS & PHONETIC IDENTIFICATION CARD */}
                  <div className="bg-white/90 dark:bg-white/5 border border-amber-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_35px_rgba(245,158,11,0.15)] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-mono tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t('hieroglyph.detectedSigns')}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F3E9] dark:bg-white/10 hover:bg-amber-500/20 text-xs text-gray-700 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-300 border border-gray-200 dark:border-white/10 hover:border-amber-500/40 transition-all cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? t('hieroglyph.copied') : t('hieroglyph.copyResult')}</span>
                      </button>
                    </div>

                    {/* Dynamic Rendering of Symbols */}
                    {Array.isArray(scanResult.symbols) ? (
                      <div className="flex flex-wrap gap-2 my-2">
                        {scanResult.symbols.map((sym, idx) => (
                          <span 
                            key={idx}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm font-mono font-bold"
                          >
                            {typeof sym === 'object' && sym !== null ? JSON.stringify(sym) : String(sym)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-serif text-2xl sm:text-4xl text-amber-900 dark:text-amber-200 tracking-wider font-semibold leading-relaxed">
                        {typeof scanResult.symbols === 'string' ? scanResult.symbols : JSON.stringify(scanResult.symbols)}
                      </p>
                    )}

                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-2 font-mono">
                      Decoded exclusively using verified Egyptological dictionary records
                    </p>
                  </div>

                  {/* 2. TRANSLATION RESULT BOX WITH ENGLISH / ARABIC TOGGLE */}
                  <div className="bg-white/90 dark:bg-white/5 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-5">
                    
                    {/* Header with Language Toggle Switch */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                          {t('hieroglyph.localizedTranslation')}
                        </h3>
                      </div>

                      {/* Interactive Language Selector Toggle */}
                      <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-black/40 rounded-xl border border-gray-300 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => setTranslationLang('en')}
                          className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            translationLang === 'en'
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setTranslationLang('ar')}
                          className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            translationLang === 'ar'
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          العربية
                        </button>
                      </div>
                    </div>

                    {/* Active Selected Translation Display */}
                    <AnimatePresence mode="wait">
                      {translationLang === 'en' ? (
                        <motion.div
                          key="en-translation"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2"
                        >
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            {scanResult.localized_translation && locale !== 'en' && locale !== 'ar'
                              ? t('hieroglyph.localizedTranslation')
                              : t('hieroglyph.englishTranslation')}
                          </span>
                          <blockquote className="text-lg sm:text-xl text-gray-900 dark:text-white font-medium leading-relaxed italic border-l-3 border-amber-500 pl-4 py-1">
                            &ldquo;{scanResult.localized_translation && locale !== 'en' && locale !== 'ar'
                              ? scanResult.localized_translation
                              : scanResult.english_translation}&rdquo;
                          </blockquote>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="ar-translation"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-2 text-right"
                          dir="rtl"
                        >
                          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            الترجمة والتفسير العربي المعتمد
                          </span>
                          <p className="text-lg sm:text-2xl text-amber-950 dark:text-amber-100 font-bold leading-relaxed border-r-3 border-amber-500 pr-4 py-1">
                            {scanResult.arabic_translation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Secondary Quick Reference Peek */}
                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2">
                      <span>Alternate view available by toggling language switch above.</span>
                      <button
                        type="button"
                        onClick={() => setTranslationLang(translationLang === 'en' ? 'ar' : 'en')}
                        className="text-amber-700 dark:text-amber-400 font-semibold hover:underline"
                      >
                        Switch to {translationLang === 'en' ? 'Arabic' : 'English'}
                      </button>
                    </div>
                  </div>

                  {/* 3. HISTORICAL CONTEXT & PROVENANCE (If present) */}
                  {scanResult.context && (
                    <div className="bg-white/90 dark:bg-white/5 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                          Historical Context & Provenance
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {scanResult.context.personOrKing && (
                          <div className="p-4 rounded-2xl bg-[#F8F3E9] dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-600 dark:text-gray-400">
                              Figure / Deity
                            </span>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {scanResult.context.personOrKing}
                            </p>
                          </div>
                        )}

                        {scanResult.context.era && (
                          <div className="p-4 rounded-2xl bg-[#F8F3E9] dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-600 dark:text-gray-400">
                              Period & Dynasty
                            </span>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {scanResult.context.era}
                            </p>
                          </div>
                        )}

                        {scanResult.context.temple && (
                          <div className="p-4 rounded-2xl bg-[#F8F3E9] dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-600 dark:text-gray-400">
                              Likely Origin
                            </span>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                              {scanResult.context.temple}
                            </p>
                          </div>
                        )}

                        {scanResult.context.meaning && (
                          <div className="p-4 rounded-2xl bg-[#F8F3E9] dark:bg-black/40 border border-gray-200 dark:border-white/10 space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-600 dark:text-gray-400">
                              Epigraphic Purpose
                            </span>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-xs leading-relaxed">
                              {scanResult.context.meaning}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 4. CONFIDENCE SCORE RATING CARD */}
                  <div className="bg-white/90 dark:bg-white/5 border border-amber-500/30 rounded-3xl p-5 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Confidence Rating:
                          <span className="text-amber-700 dark:text-amber-400 font-mono font-extrabold">
                            {String(scanResult.confidence).includes('%') ? scanResult.confidence : `${scanResult.confidence}%`}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400">
                          Cross-referenced against verified reference dictionary
                        </p>
                      </div>
                    </div>

                    {/* Progress bar visual */}
                    <div className="w-full sm:w-48 space-y-1">
                      <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full transition-all duration-1000 shadow-[0_0_10px_#f59e0b]"
                          style={{ width: getConfidenceWidth(scanResult.confidence) }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono block text-right">
                        Dictionary Concordance
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-950 font-extrabold text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      Scan Another Inscription
                    </button>

                    <Link
                      href="/planner"
                      className="px-6 py-3 rounded-full bg-[#F8F3E9] dark:bg-white/10 hover:bg-[#EFE6D5] dark:hover:bg-white/15 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-semibold text-sm transition-all flex items-center gap-2"
                    >
                      <span>Add to AI Travel Plan</span>
                      <ChevronRight className="w-4 h-4 text-amber-400" />
                    </Link>
                  </div>

                </motion.div>
              )}

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
