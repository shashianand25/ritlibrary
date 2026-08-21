import React from 'react';
import PropTypes from 'prop-types';
import { BookMarked, Layers } from 'lucide-react';
import { FolderSection, EmptyState } from '../UIElements.jsx';
import FileRow from '../FileRow.jsx';

function capitalizeWords(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NotesResults({
  groupedNotes = [],
  openMenuId,
  setOpenMenuId,
  openPreview,
  isSmallScreen,
  colors,
}) {
  if (!groupedNotes || groupedNotes.length === 0) {
    return <EmptyState icon={BookMarked} label="Notes" colors={colors} />;
  }

  const isSingleFolder = groupedNotes.length === 1;

  return (
    <div className="flex flex-col gap-5">
      {groupedNotes.map(([folder, files]) => (
        <FolderSection
          key={folder}
          title={capitalizeWords(folder)}
          count={files.length}
          icon={Layers}
          color={colors?.secondary || '#A3E635'}
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
      ))}
    </div>
  );
}

NotesResults.propTypes = {
  groupedNotes: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.object)]))
  ),
  openMenuId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setOpenMenuId: PropTypes.func,
  openPreview: PropTypes.func,
  isSmallScreen: PropTypes.bool,
  colors: PropTypes.object,
};
