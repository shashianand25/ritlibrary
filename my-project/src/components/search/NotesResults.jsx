import React from 'react';
import { BookMarked, Layers } from 'lucide-react';
import { FolderSection, EmptyState } from '../UIElements.jsx';
import FileRow from '../FileRow.jsx';

export function capitalizeWords(str) {
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
          color={colors.secondary}
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
