import React from 'react';
import PropTypes from 'prop-types';
import { GraduationCap, ExternalLink } from 'lucide-react';
import { FolderSection, EmptyState } from '../UIElements.jsx';
import FileRow from '../FileRow.jsx';
import { COLLEGE_PYQ_DRIVE_URL } from '../../constants/searchData.js';

export default function PyqResults({
  pdfFiles = [],
  groupedPDFs = [],
  openMenuId,
  setOpenMenuId,
  openPreview,
  isSmallScreen,
  colors,
}) {
  const isSingleFolder = groupedPDFs.length === 1;

  return (
    <div className="flex flex-col gap-5">
      {/* College-Wide Common PYQ Drive Banner */}
      <a
        href={COLLEGE_PYQ_DRIVE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open College-Wide PYQ Repository Google Drive"
        className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-lime-400/30 bg-lime-400/10 hover:bg-lime-400/15 transition-all shadow-md hover:shadow-lime-400/10"
        style={{ textDecoration: 'none' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-lime-400/20 border border-lime-400/30 flex items-center justify-center shrink-0 text-lime-400 group-hover:scale-105 transition-transform">
            <GraduationCap size={20} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-[15px] group-hover:text-lime-300 transition-colors">
                College-Wide PYQ Repository
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 border border-lime-400/30">
                All Branches
              </span>
            </div>
            <p className="text-xs text-white/60 m-0 mt-0.5">
              Common Google Drive folder for all semesters & branches
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime-400/20 text-lime-300 text-xs font-semibold group-hover:bg-lime-400 group-hover:text-black transition-all">
          <span>Open Drive</span>
          <ExternalLink size={13} />
        </div>
      </a>

      {!pdfFiles || pdfFiles.length === 0 ? (
        <EmptyState icon={GraduationCap} label="PYQs" colors={colors} />
      ) : (
        groupedPDFs.map(([year, files]) =>
          year !== 'null' && year !== '' ? (
            <FolderSection
              key={year}
              title={year}
              count={files.length}
              icon={GraduationCap}
              color={colors?.primary || '#A3E635'}
              initialOpen={isSingleFolder}
              isSmallScreen={isSmallScreen}
            >
              {files.map((file, i) => (
                <FileRow
                  key={file.id || i}
                  file={file}
                  index={i}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  openPreview={openPreview}
                  isSmallScreen={isSmallScreen}
                  colors={colors}
                />
              ))}
            </FolderSection>
          ) : (
            <div key={year} className="flex flex-col gap-1.5">
              {files.map((file, i) => (
                <FileRow
                  key={file.id || i}
                  file={file}
                  index={i}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  openPreview={openPreview}
                  isSmallScreen={isSmallScreen}
                  colors={colors}
                />
              ))}
            </div>
          )
        )
      )}
    </div>
  );
}

PyqResults.propTypes = {
  pdfFiles: PropTypes.arrayOf(PropTypes.object),
  groupedPDFs: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.object)]))
  ),
  openMenuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setOpenMenuId: PropTypes.func,
  openPreview: PropTypes.func,
  isSmallScreen: PropTypes.bool,
  colors: PropTypes.object,
};
