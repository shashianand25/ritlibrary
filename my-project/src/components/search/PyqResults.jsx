import React from 'react';
import { GraduationCap } from 'lucide-react';
import { FolderSection, EmptyState } from '../UIElements.jsx';
import FileRow from '../FileRow.jsx';

export default function PyqResults({
  pdfFiles = [],
  groupedPDFs = [],
  openMenuId,
  setOpenMenuId,
  openPreview,
  isSmallScreen,
  colors,
}) {
  if (!pdfFiles || pdfFiles.length === 0) {
    return <EmptyState icon={GraduationCap} label="PYQs" colors={colors} />;
  }

  const isSingleFolder = groupedPDFs.length === 1;

  return (
    <div className="flex flex-col gap-5">
      {groupedPDFs.map(([year, files]) =>
        year !== 'null' && year !== '' ? (
          <FolderSection
            key={year}
            title={year}
            count={files.length}
            icon={GraduationCap}
            color={colors.primary}
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
      )}
    </div>
  );
}
