import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext.jsx';
import { COLORS, sectionCountsByBranch } from '../../constants/searchData.js';
import logger from '../../utils/logger.js';

const WORKER = import.meta.env.VITE_WORKER_URL || 'https://library-backend.ritlibrary.workers.dev';
const C = COLORS;

const glass = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

function getSectionOptions(branch) {
  const count = sectionCountsByBranch[branch?.toLowerCase()] || 0;
  return [
    { label: 'All Sections (Gen)', value: 'Gen' },
    ...Array.from({ length: count }, (_, i) => {
      const sec = String.fromCharCode(65 + i);
      return { label: `Section ${sec}`, value: sec };
    }),
  ];
}

export default function UploadModal({
  folder,
  subjectCode,
  category,
  year,
  sem,
  branch,
  allSubjects = false,
  onClose,
  onSuccess,
}) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [err, setErr] = useState('');
  const [drag, setDrag] = useState(false);
  const [section, setSection] = useState('Gen');
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);
  const sectionOptions = getSectionOptions(branch);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const upload = async () => {
    if (!file || status === 'uploading') return;
    setStatus('uploading');
    setErr('');
    try {
      const idToken = user ? await user.getIdToken() : '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('year', year);
      formData.append('sem', sem);
      formData.append('branch', branch);
      formData.append('subjectCode', subjectCode);
      formData.append('folderName', folder);
      formData.append('section', section);
      formData.append('allSubjects', allSubjects ? 'true' : 'false');
      formData.append('uploaderName', user?.displayName || user?.email || 'Community User');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${WORKER}/api/upload`);
      if (idToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        }
      };

      xhr.onload = () => {
        try {
          const uploadData = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            setStatus('success');
            setTimeout(() => {
              onSuccess(uploadData.file);
              onClose();
            }, 1000);
          } else {
            throw new Error(uploadData.error || 'Upload failed');
          }
        } catch (e) {
          logger.error('Upload parsing error', e);
          setErr(e.message || 'Upload failed');
          setStatus('error');
        }
      };

      xhr.onerror = () => {
        logger.error('Network error during file upload');
        setErr('Network error during upload');
        setStatus('error');
      };

      xhr.send(formData);
    } catch (e) {
      logger.error('Upload initialization error', e);
      setErr(e.message);
      setStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        style={{
          ...glass,
          borderRadius: 24,
          padding: 32,
          width: '100%',
          maxWidth: 460,
          color: '#F3F4F6',
        }}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-lg font-bold text-white">Upload to &quot;{folder}&quot;</h3>
            <p className="text-xs text-neutral-400 mt-1">
              {subjectCode} · {category} · {section}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="text-neutral-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {status === 'success' ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-lime-400 mx-auto mb-3" />
            <p className="font-bold text-base text-white">Resource uploaded successfully!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Section
              </label>
              <div className="relative">
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-100 text-sm font-medium outline-none cursor-pointer"
                >
                  {sectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-lime-400 opacity-60"
                />
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                drag ? 'border-lime-400 bg-lime-400/10' : 'border-white/15 hover:border-white/30'
              }`}
            >
              <Upload size={28} className="mx-auto mb-2 text-lime-400/80" />
              {file ? (
                <div>
                  <p className="font-bold text-sm text-lime-300 truncate">{file.name}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-sm text-neutral-200">
                    Drop file or click to browse
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">PDF, PPTX, DOCX, images…</p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                <AlertCircle size={15} /> {err}
              </div>
            )}

            <button
              type="button"
              onClick={upload}
              disabled={!file || status === 'uploading'}
              className="w-full py-3 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-lime-300 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {status === 'uploading' ? `Uploading... ${uploadProgress}%` : 'Upload Resource'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

UploadModal.propTypes = {
  folder: PropTypes.string.isRequired,
  subjectCode: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
