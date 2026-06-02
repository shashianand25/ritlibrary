import React, { useState, useRef, useEffect } from "react";
import { DownloadCloud, Loader2 } from "lucide-react";

const Mozillapdf = ({ fileId, fileName }) => {
  // --- STATE MANAGEMENT ---
  // Tracks the complex download logic (Real progress)
  const [loadStage, setLoadStage] = useState('viewer'); // 'viewer' | 'downloading' | 'complete'
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [fileSizeMB, setFileSizeMB] = useState(0);
  
  // Tracks the Iframe's visual readiness (The "Lines in Circle" persistence)
  const [iframeReady, setIframeReady] = useState(false);
  
  // Stats
  const [loadTime, setLoadTime] = useState(0);
  const [showLoadTime, setShowLoadTime] = useState(false);
  
  const iframeRef = useRef(null);
  const loadStartTime = useRef(null);
  
  // --- CONFIGURATION ---
  const workerUrl = 'https://pdf.shashianand2005.workers.dev'; 
  const filePath = `${workerUrl}/${fileId}`;
  
  // Viewer URL
  const viewerUrl = `/web/viewer.html?file=${encodeURIComponent(filePath)}` + 
    `#page=1&zoom=page-width&pagemode=none&scroll=vertical`;

  // --- LOGIC: Real Progress Tracking ---
  useEffect(() => {
    loadStartTime.current = Date.now();
    
    const trackDownloadProgress = async () => {
      try {
        const response = await fetch(filePath);
        const size = response.headers.get('content-length');
        const sizeInMB = size ? (size / 1024 / 1024) : 0;
        setFileSizeMB(sizeInMB);

        // Optimization: If file is small (<5MB), we skip the "downloading" bar 
        // and just show the spinner until iframe is ready.
        if (sizeInMB < 5) {
          setLoadStage('complete'); 
          // We don't show timing toast yet, we wait for iframe
          return;
        }

        const reader = response.body.getReader();
        const total = parseInt(size, 10);
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          received += value.length;
          const progress = (received / total) * 100;
          setDownloadProgress(progress);
          
          // Only switch to "Downloading" bar if we are not already done
          if (progress > 0 && loadStage !== 'complete') {
            setLoadStage('downloading');
          }
        }
        
        setLoadStage('complete');
        
      } catch (err) {
        console.log('Progress tracking failed', err);
        // Fallback: If tracking fails, assume it's downloading
        setLoadStage('complete'); 
      }
    };

    // Trigger logic
    trackDownloadProgress();

  }, [filePath]);

  // --- HANDLERS ---
  const handleIframeLoad = () => {
    // This fires when PDF.js is actually ready
    setIframeReady(true);
    
    // Calculate final load time
    const finalLoadTime = Date.now() - loadStartTime.current;
    setLoadTime(finalLoadTime);
    setShowLoadTime(true);
    setTimeout(() => setShowLoadTime(false), 3000);
  };

  const getStageMessage = () => {
    if (loadStage === 'viewer' || !iframeReady) return "Initializing viewer...";
    if (loadStage === 'downloading') return `Loading PDF... ${Math.round(downloadProgress)}%`;
    return "PDF Ready!";
  };

  // Logic to determine if we show the overlay
  // We show it if: 1. Download isn't done OR 2. Iframe isn't ready
  const showOverlay = (loadStage !== 'complete') || (!iframeReady);

  return (
    <div className="pdf-preview-overlay fixed inset-0 bg-neutral-900 z-50 flex flex-col">
      
      {/* --- LOADING OVERLAY --- */}
      {showOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-20">
          <div className="text-white text-center max-w-md mx-4 p-6 rounded-2xl bg-neutral-800 shadow-2xl border border-neutral-700">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Visual Logic: Show Lines Spinner UNLESS we are in the middle of a big download */}
                {loadStage === 'downloading' && fileSizeMB >= 5 ? (
                   <DownloadCloud className="animate-bounce text-blue-400" size={56} />
                ) : (
                   // This acts as the default "waiting for iframe" loader
                   <Loader2 
                     className="animate-spin text-white opacity-80" 
                     size={48} 
                     strokeWidth={2.5} 
                   />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">
              {getStageMessage()}
            </h3>
            <p className="text-gray-400 text-sm mb-6 truncate">
              {fileName}
            </p>
            
            {/* Progress Bar (Only for big downloads) */}
            {loadStage === 'downloading' && fileSizeMB >= 5 && (
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            )}
            
            {fileSizeMB > 0 && loadStage === 'downloading' && (
               <p className="text-xs text-gray-500 mt-2">
                 {fileSizeMB.toFixed(1)} MB • {((Date.now() - loadStartTime.current) / 1000).toFixed(0)}s
               </p>
            )}
          </div>
        </div>
      )}



      {/* --- PDF VIEWER --- */}
      <div className="min-h-0 flex-1 w-full relative bg-neutral-900 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="block w-full h-full min-h-0 border-0"
          allow="autoplay"
          title="PDF Viewer"
          // This is the key: The loader won't vanish until this fires
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

export default Mozillapdf;
