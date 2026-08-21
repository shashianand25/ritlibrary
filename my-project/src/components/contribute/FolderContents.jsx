import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { COLORS } from '../../constants/searchData.js';
import { getFileViewName } from '../../utils/fileHelpers.js';

const C = COLORS;

const glass = {
  background: 'rgba(20,25,35,0.75)',
  backdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};

export default function FolderContents({
  activeFolder,
  folderFiles = [],
  isAdmin,
  isDeleting,
  onDelete,
}) {
  if (!activeFolder) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="mt-6"
    >
      <section style={{ ...glass, borderRadius: 20, padding: '20px 24px' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-white">Files in &quot;{activeFolder}&quot;</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-neutral-300">
            {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        {folderFiles.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-6">
            No files uploaded to this folder yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {folderFiles.map((file) => {
              const displayName = getFileViewName(file.view || file.name);
              const section = file.section || 'Gen';

              return (
                <div
                  key={file.id || file.name}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-lime-400/15 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-lime-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate m-0">{displayName}</p>
                      <p className="text-[11px] text-neutral-400 m-0">
                        {section} {file.uploaderName ? `· ${file.uploaderName}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.previewUrl && (
                      <a
                        href={file.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-lime-300"
                        title="Preview file"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => onDelete(file)}
                        className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400"
                        title="Delete file"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </motion.div>
  );
}
