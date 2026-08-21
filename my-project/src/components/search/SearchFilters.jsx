import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen, Layers } from 'lucide-react';
import { StyledInput, StyledSelect, Dropdown } from '../UIElements.jsx';
import {
  branchGroups,
  COLORS,
  sectionCountsByBranch,
  electiveOptions,
} from '../../constants/searchData.js';

export default function SearchFilters({
  searchMode,
  setSearchMode,
  form,
  setForm,
  subjectCode,
  setSubjectCode,
  codeError,
  handleSearch,
  isSearching,
  cycleTag,
  showElective,
  branchSubjects,
  handleBranch,
  handleSemester,
  handleSubject,
  handleSubSubject,
  isSmallScreen,
}) {
  const C = COLORS;

  return (
    <div className="search-filters-container space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-neutral-900/60 border border-white/10 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setSearchMode('guided')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            searchMode === 'guided'
              ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen size={14} /> Guided Search
        </button>
        <button
          type="button"
          onClick={() => setSearchMode('code')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
            searchMode === 'code'
              ? 'bg-lime-400/20 text-lime-300 border border-lime-400/40 shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} /> Subject Code Search
        </button>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {searchMode === 'guided' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Branch */}
            <Dropdown label="Branch" value={form.branch} onChange={handleBranch}>
              <option value="" disabled hidden>
                Select Branch
              </option>
              {Object.entries(branchGroups).map(([group, branches]) => (
                <optgroup key={group} label={group}>
                  {branches.map(({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Dropdown>

            {/* Semester */}
            <Dropdown
              label="Semester"
              value={form.semester}
              onChange={handleSemester}
              disabled={!form.branch}
            >
              <option value="" disabled hidden>
                Select Semester
              </option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </Dropdown>

            {/* Subject */}
            <Dropdown
              label="Subject"
              value={form.subject}
              onChange={handleSubject}
              disabled={!form.semester || branchSubjects.length === 0}
            >
              <option value="" disabled hidden>
                Select Subject
              </option>
              {branchSubjects.map(({ label, value, code }) => (
                <option key={value || code} value={value}>
                  {label} {code ? `(${code})` : ''}
                </option>
              ))}
            </Dropdown>

            {/* Elective Sub-Subject */}
            {showElective ? (
              <Dropdown label="Elective Topic" value={form.subSubject} onChange={handleSubSubject}>
                <option value="" disabled hidden>
                  Select Elective
                </option>
                {electiveOptions[form.subject]?.map(({ label, value }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Dropdown>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="w-full relative">
              <StyledInput
                placeholder="Enter Subject Code (e.g. BCS301, 21CS32, ESC131)"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                className="w-full font-mono uppercase"
              />
            </div>
          </div>
        )}

        {codeError && <p className="text-xs text-rose-400 px-1 font-medium">{codeError}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm shadow-lg shadow-lime-400/20 hover:bg-lime-300 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSearching ? (
              <span className="inline-block w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search size={16} />
            )}
            Search Resources
          </button>
        </div>
      </form>
    </div>
  );
}
