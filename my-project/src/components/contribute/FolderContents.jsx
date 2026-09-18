import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Trash2, X, AlertCircle } from 'lucide-react';
import { getFileViewName } from '../../utils/fileHelpers.js';

const glass = {
  background: 'rgba(20,25,35,0.85)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 16px 50px rgba(0,0,0,0.6)',
};

export default function FolderContents({
  activeFolder,
  folderFiles = [],
  isAdmin,
  isDeleting,
  deletingFileId,
  deleteError,
  isCustom,
  onClose,
  onDelete,
  onRemoveFolder,
}) {
  if (!activeFolder) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 190,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <motion.section
        initial={{ scale: 0.94, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 18 }}
        style={{
          ...glass,
          borderRadius: 22,
          padding: 24,
          width: '100%',
          maxWidth: 640,
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        className="relative flex flex-col"
      >
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white m-0">{activeFolder}</h3>
            <p className="text-xs text-neutral-400 mt-1 m-0">
              {folderFiles.length} uploaded {folderFiles.length === 1 ? 'file' : 'files'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCustom && onRemoveFolder && (
              <button
                type="button"
                onClick={onRemoveFolder}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title="Delete this custom folder"
              >
                <Trash2 size={13} />
                <span>Delete Folder</span>
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-0"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {deleteError && (
          <div className="flex gap-2 items-center p-2.5 mb-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <AlertCircle size={14} className="shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        {folderFiles.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8 m-0">
            No files uploaded to this folder yet.
          </p>
        ) : (
          <div className="grid gap-2.5">
            {folderFiles.map((file) => {
              const displayName = getFileViewName(
                file.view || file.name?.split('/').pop() || file.name || 'Untitled file'
              );
              const section = file.section || 'Gen';
              const isFileDeleting = Boolean(
                isDeleting || (deletingFileId && deletingFileId === file.id)
              );

              return (
                <div
                  key={file.id || file.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-lime-400/15 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-lime-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate m-0">
                        {displayName}
                      </p>
                      <p className="text-[11px] text-neutral-400 m-0 mt-0.5 truncate">
                        {section}
                        {file.uploaderName ? ` · ${file.uploaderName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.previewUrl && (
                      <a
                        href={file.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-lime-300 transition-colors"
                        title="Preview file"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={isFileDeleting}
                        onClick={() => onDelete?.(file)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        title="Delete file"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

FolderContents.propTypes = {
  activeFolder: PropTypes.string,
  folderFiles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      view: PropTypes.string,
      section: PropTypes.string,
      uploaderName: PropTypes.string,
      previewUrl: PropTypes.string,
    })
  ),
  isAdmin: PropTypes.bool,
  isDeleting: PropTypes.bool,
  deletingFileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  deleteError: PropTypes.string,
  isCustom: PropTypes.bool,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onRemoveFolder: PropTypes.func,
};
