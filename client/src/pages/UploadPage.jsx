import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Camera, Upload, Image as ImageIcon, X, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadPage = () => {
  const [image, setImage] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [mode, setMode] = useState('upload'); // 'upload' or 'camera'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const webcamRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileObj(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
      setResult(null);
      setError('');
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    
    // Convert base64 to file
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
        setFileObj(file);
      });
      
    setResult(null);
    setError('');
  }, [webcamRef]);

  const clearImage = () => {
    setImage(null);
    setFileObj(null);
    setResult(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!fileObj) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', fileObj);

    try {
      const res = await axios.post('http://127.0.0.1:5001/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Make sure both backend and AI service are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Scan Your Waste</h1>
        <p className="text-emerald-200/70 text-lg">Upload an image or take a photo to classify it and earn Eco Points.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <motion.div 
          whileHover={{ boxShadow: "0 10px 40px -10px rgba(16,185,129,0.2)" }}
          className="glass-card p-8 rounded-3xl flex flex-col items-center transition-all"
        >
          
          {!image && (
            <div className="w-full flex justify-center mb-6 space-x-4">
              <button 
                onClick={() => setMode('upload')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${mode === 'upload' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <Upload className="h-4 w-4 mr-2" /> Upload
              </button>
              <button 
                onClick={() => setMode('camera')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${mode === 'camera' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                <Camera className="h-4 w-4 mr-2" /> Camera
              </button>
            </div>
          )}

          {!image ? (
            <div className="w-full">
              {mode === 'upload' ? (
                <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer relative">
                  <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4 pointer-events-none" />
                  <p className="text-slate-300 font-medium pointer-events-none">Click or drag image here</p>
                  <p className="text-sm text-slate-500 mt-1 pointer-events-none">Supports JPG, PNG</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title=""
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-600">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "environment" }}
                    className="w-full"
                  />
                  <button 
                    onClick={capture}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 font-medium flex items-center justify-center transition-colors"
                  >
                    <Camera className="h-5 w-5 mr-2" /> Take Photo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full relative rounded-xl overflow-hidden border border-slate-600 group">
              <img src={image} alt="Preview" className="w-full h-auto object-cover" />
              <button 
                onClick={clearImage}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {image && !result && (
            <button 
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Analyzing Image...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" /> Classify Waste
                </>
              )}
            </button>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center w-full">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
        </motion.div>

        {/* Right Column: Result */}
        <div>
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="glass-card p-8 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-emerald-500/20 rounded-full blur-[40px] pointer-events-none"></div>
              <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Scan Results</h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Detected Material</p>
                  <p className="text-3xl font-bold text-emerald-400">{result.wasteType}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Confidence</p>
                  <p className="text-xl font-bold text-white">{result.confidence}%</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-slate-400 text-sm">Eco Score</p>
                  <p className="text-2xl font-bold text-white">{result.ecoScore}/100</p>
                </div>
                <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      result.ecoScore >= 80 ? 'bg-emerald-500' :
                      result.ecoScore >= 60 ? 'bg-amber-400' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${result.ecoScore}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-700/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-sm">Level</p>
                  <p className="text-lg font-bold text-white flex items-center">
                    {result.levelEmoji} {result.level}
                  </p>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-xl">
                  <p className="text-slate-400 text-sm">Points Earned</p>
                  <p className="text-lg font-bold text-amber-400">+{result.points} pts</p>
                </div>
              </div>

              <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-xl mb-4">
                <p className="text-emerald-400 text-sm font-medium mb-1">Smart Suggestion</p>
                <p className="text-white">{result.suggestion}</p>
              </div>

              <div className="text-center italic text-slate-400 text-sm mt-4 pt-4 border-t border-slate-700">
                "{result.message}"
              </div>

            </motion.div>
          ) : (
            <div className="h-full glass border border-dashed border-slate-600/50 rounded-3xl flex flex-col justify-center items-center p-10 text-center relative overflow-hidden">
              <div className="bg-slate-700 p-4 rounded-full mb-4">
                <ImageIcon className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-300">Awaiting Image</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs">
                Upload or capture an image of waste to see the AI analysis, eco score, and actionable tips.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UploadPage;
