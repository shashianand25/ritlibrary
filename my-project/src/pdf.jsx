import React, { useState } from 'react';
import { Download, X, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is set up for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DrivePreview = ({ fileId, onClose, fileName = 'Document.pdf', originalFileName = '', mimeType }) => {
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
  
  const [extractState, setExtractState] = useState('idle'); // 'idle', 'extracting', 'success', 'error'
  const [extractError, setExtractError] = useState('');
  
  const isPdf = mimeType === 'application/pdf';
  // Check originalFileName for .pptx extension, or mimeType for presentation types
  const isPptx = originalFileName.toLowerCase().endsWith('.pptx') || 
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
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }
        
        if (!fullText.trim()) {
          throw new Error('No text found. This might be a scanned PDF containing only images.');
        }
      } else if (isPptx) {
        const response = await fetch(backendUrl);
        if (!response.ok) throw new Error('Failed to fetch presentation file');
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Check if this is an old .ppt file vs modern .pptx
        const isOldPpt = originalFileName.toLowerCase().endsWith('.ppt') && !originalFileName.toLowerCase().endsWith('.pptx');
        
        if (isOldPpt) {
          // Process legacy .ppt files (Office 97-2003 binary format)
          
          // ppt-to-text requires Node.js Buffer, CFB, and cptable in the global scope when running in browser
          const BufferModule = await import('buffer');
          window.Buffer = window.Buffer || BufferModule.Buffer;
          
          const CFBModule = await import('cfb');
          window.CFB = CFBModule.default || CFBModule;
          
          const cptableModule = await import('codepage');
          window.cptable = cptableModule.default || cptableModule;
          
          const PPTModule = await import('ppt-to-text');
          const PPT = PPTModule.default || PPTModule;
          
          // Use the polyfilled Node.js Buffer
          const buffer = window.Buffer.from(arrayBuffer);
          
          fullText = PPT.extractText(buffer);
          
        } else {
          // Process modern .pptx files (OOXML Zip format)
          const JSZipModule = await import('jszip');
          const JSZip = JSZipModule.default || JSZipModule;
          
          let zip;
          try {
            zip = await JSZip.loadAsync(arrayBuffer);
          } catch (zipErr) {
            throw new Error('Failed to unzip file. It may be an unsupported format or corrupted.');
          }
          
          let slideFiles = Object.keys(zip.files)
          .filter(filename => /ppt\/slides\/slide\d+\.xml/i.test(filename))
          .sort((a, b) => {
            const matchA = a.match(/slide(\d+)\.xml/i);
            const matchB = b.match(/slide(\d+)\.xml/i);
            const numA = matchA ? parseInt(matchA[1], 10) : 0;
            const numB = matchB ? parseInt(matchB[1], 10) : 0;
            return numA - numB;
          });
          
        let isFallback = false;
        if (slideFiles.length === 0) {
          // Fallback: scan all XML files
          slideFiles = Object.keys(zip.files).filter(f => f.endsWith('.xml') && !f.includes('_rels'));
          isFallback = true;
          if (slideFiles.length === 0) {
            const sampleFiles = Object.keys(zip.files).slice(0, 10).join(', ');
            throw new Error(`Unsupported PPT format. (Found in zip: ${sampleFiles || 'empty'})`);
          }
        }

        for (const filename of slideFiles) {
          const match = filename.match(/slide(\d+)\.xml/i);
          const slideNumber = match ? match[1] : (isFallback ? filename.split('/').pop() : '?');
          const xmlText = await zip.files[filename].async('text');
          
          // Use the browser's native DOMParser to safely extract text
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "text/xml");
          
          // In OOXML, text is usually in <a:t> (PPT) or <w:t> (Word)
          const textNodes = Array.from(xmlDoc.getElementsByTagName('*'))
            .filter(node => node.tagName === 'a:t' || node.tagName === 'w:t' || node.localName === 't')
            .map(node => node.textContent);
            
          if (textNodes.length > 0) {
            const slideText = textNodes.join('\n');
            if (slideText.trim()) {
              fullText += `--- ${isFallback ? 'File' : 'Slide'} ${slideNumber} ---\n${slideText}\n\n`;
            }
          }
        }
        
        // --- OCR FALLBACK ---
        // If we extracted nothing, or ONLY underscores/blanks (fewer than 5 real alphanumeric chars)
        if (!fullText.trim() || fullText.replace(/[\s\-_]/g, '').length < 5) {
          const imageFiles = Object.keys(zip.files).filter(f => /\.(png|jpe?g)$/i.test(f));
          
          if (imageFiles.length > 0) {
            // Dynamically import Tesseract to avoid bloating the main app bundle
            const TesseractModule = await import('tesseract.js');
            const Tesseract = TesseractModule.default || TesseractModule;
            
            fullText = ''; // Clear the useless underscores
            
            for (const imgPath of imageFiles) {
              const imgBuffer = await zip.files[imgPath].async('arraybuffer');
              const blob = new Blob([imgBuffer]);
              const imageUrl = URL.createObjectURL(blob);
              
              // Run OCR on the image
              const result = await Tesseract.recognize(imageUrl, 'eng');
              
              if (result.data.text.trim()) {
                fullText += `--- Image: ${imgPath.split('/').pop()} ---\n${result.data.text}\n\n`;
              }
              
              URL.revokeObjectURL(imageUrl); // Clean up memory
            }
          }
        }
        
        if (!fullText.trim()) {
          throw new Error('No text found in the presentation slides or images.');
        }
        } // close the else block for JSZip
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
      console.error("Text extraction failed:", err);
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
        <div className="text-white font-medium truncate flex-1 min-w-0 flex items-center gap-3" title={fileName}>
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

export default DrivePreview;
