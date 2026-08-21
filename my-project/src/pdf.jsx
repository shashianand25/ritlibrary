import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Download, X, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import logger from './utils/logger.js';

// Ensure worker is set up for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DrivePreview = ({
  fileId,
  onClose,
  fileName = 'Document.pdf',
  originalFileName = '',
  mimeType,
}) => {
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;

  const [extractState, setExtractState] = useState('idle'); // 'idle', 'extracting', 'success', 'error'
  const [extractError, setExtractError] = useState('');

  const isPdf = mimeType === 'application/pdf';
  // Check originalFileName for .pptx extension, or mimeType for presentation types
  const isPptx =
    originalFileName.toLowerCase().endsWith('.pptx') ||
    (mimeType && mimeType.includes('presentation')) ||
    (mimeType && mimeType.includes('powerpoint'));

  // Show button for either
  const canExtract = isPdf || isPptx;

  const extractAndCopyText = async () => {
    try {
      setExtractState('extracting');
      setExtractError('');

      // The backend proxy endpoint for fetching the file
      const backendUrl = `https://pyq-backend-xs9d.onrender.com/api/pdf/${fileId}`;
      let fullText = '';

      if (isPdf) {
        const response = await fetch(backendUrl);
        if (!response.ok) throw new Error('Failed to fetch PDF file');

        const arrayBuffer = await response.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        if (!fullText.trim()) {
          throw new Error('No text found. This might be a scanned PDF containing only images.');
        }
      } else if (isPptx) {
        throw new Error('Presentation files (.ppt/.pptx) can be downloaded directly from Drive.');
      }

      const aiPrompt = `You are an expert tutor and exam coach.

Analyze the following content and do the following:

1. Identify the subject and main topics automatically
2. Break the content into clear sections with headings
3. Explain key concepts in simple, student-friendly language
4. Highlight important definitions, formulas, and keywords
5. Generate exam-focused questions:

   * Short answer (2–3 marks)
   * Medium answer (5 marks)
   * Long answer (10 marks)
6. Provide concise answers for each question
7. Create a quick revision summary (bullet points only)

Guidelines:

* Keep explanations clear and not overly verbose
* Avoid unnecessary repetition
* If content is incomplete, fill gaps using standard academic knowledge
* Maintain structured formatting throughout

---

Content:

`;

      await navigator.clipboard.writeText(aiPrompt + fullText);
      setExtractState('success');
      setTimeout(() => setExtractState('idle'), 3000);
    } catch (err) {
      logger.error('Text extraction failed:', err);
      setExtractError(err.message || 'Extraction failed');
      setExtractState('error');
      setTimeout(() => setExtractState('idle'), 4000);
    }
  };

  return (
    <div className="pdf-preview-overlay fixed inset-0 bg-neutral-800 bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-700 shadow-md gap-4">
        {/* Added truncate, flex-1, and min-w-0 to prevent overflow while keeping single line */}
        <div
          className="text-white font-medium truncate flex-1 min-w-0 flex items-center gap-3"
          title={fileName}
        >
          {fileName}
          {extractState === 'error' && (
            <span className="text-red-400 text-xs truncate max-w-xs">{extractError}</span>
          )}
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {canExtract && (
            <button
              onClick={extractAndCopyText}
              disabled={extractState === 'extracting'}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                extractState === 'success'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : extractState === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-indigo-500 sm:bg-indigo-600 hover:bg-indigo-600 sm:hover:bg-indigo-700 text-white shadow-sm'
              }`}
              title="Copy text with AI Tutor Prompt"
            >
              {extractState === 'idle' && (
                <>
                  <Sparkles size={14} className="opacity-90 sm:w-4 sm:h-4" />
                  <span className="tracking-wide hidden sm:inline">Copy Prompt</span>
                </>
              )}
              {extractState === 'extracting' && (
                <>
                  <Loader2 size={14} className="animate-spin sm:w-4 sm:h-4" />
                  <span className="tracking-wide hidden sm:inline">Extracting...</span>
                </>
              )}
              {extractState === 'success' && (
                <>
                  <Check size={14} className="sm:w-4 sm:h-4" />
                  <span className="tracking-wide hidden sm:inline">Copied!</span>
                </>
              )}
              {extractState === 'error' && (
                <>
                  <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                  <span className="tracking-wide hidden sm:inline">Failed</span>
                </>
              )}
            </button>
          )}
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:bg-neutral-700 hover:text-white p-2 rounded-full transition-colors"
            title="Download"
          >
            <Download size={20} />
          </a>
          <button
            onClick={onClose}
            className="text-white hover:bg-neutral-700 hover:text-white p-2 rounded-full transition-colors"
            title="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="min-h-0 flex-1 flex justify-center items-center overflow-auto bg-neutral-900">
        <iframe
          src={previewUrl}
          className="block w-full h-full min-h-0 border-0"
          allow="autoplay"
          title="Drive PDF Preview"
        ></iframe>
      </div>
    </div>
  );
};

DrivePreview.propTypes = {
  fileId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  fileName: PropTypes.string,
  originalFileName: PropTypes.string,
  mimeType: PropTypes.string,
};

export default DrivePreview;
