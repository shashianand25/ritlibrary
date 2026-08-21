import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Mozillapdf = ({ fileId, fileName }) => {
  const [iframeReady, setIframeReady] = useState(false);
  const iframeRef = useRef(null);
  const loadStartTime = useRef(null);

  const viewerUrl = `https://drive.google.com/file/d/${fileId}/preview`;

  useEffect(() => {
    loadStartTime.current = Date.now();
    setIframeReady(false);
  }, [fileId]);

  const handleIframeLoad = () => {
    setIframeReady(true);
  };

  return (
    <div className="pdf-preview-overlay fixed inset-0 bg-neutral-900 z-50 flex flex-col">
      {/* Loading Overlay */}
      {!iframeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-20">
          <div className="text-white text-center max-w-md mx-4 p-6 rounded-2xl bg-neutral-800 shadow-2xl border border-neutral-700">
            <div className="flex justify-center mb-6">
              <Loader2 className="animate-spin text-lime-400" size={48} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-bold mb-2">Initializing viewer...</h3>
            <p className="text-gray-400 text-sm mb-2 truncate">{fileName}</p>
          </div>
        </div>
      )}

      {/* PDF Viewer */}
      <div className="min-h-0 flex-1 w-full relative bg-neutral-900 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={viewerUrl}
          className="block w-full h-full min-h-0 border-0"
          allow="autoplay"
          title="PDF Viewer"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

Mozillapdf.propTypes = {
  fileId: PropTypes.string.isRequired,
  fileName: PropTypes.string,
};

export default Mozillapdf;
