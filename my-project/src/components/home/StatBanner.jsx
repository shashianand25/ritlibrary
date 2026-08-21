import React from 'react';
import PropTypes from 'prop-types';
import { BookOpen, FileText, Users, Award } from 'lucide-react';

const DEFAULT_STATS = [
  { label: 'Study Notes & Modules', value: '1,200+', icon: BookOpen },
  { label: 'Previous Year Question Papers', value: '350+', icon: FileText },
  { label: 'Engineering Branches', value: '8 Branches', icon: Award },
  { label: 'Active Student Contributors', value: '500+', icon: Users },
];

/**
 * Metric banner displaying community learning stats
 */
export default function StatBanner({ stats = DEFAULT_STATS }) {
  return (
    <section aria-label="Portal Statistics" className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon || BookOpen;
          return (
            <div
              key={`${stat.label}-${idx}`}
              className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 text-center flex flex-col items-center hover:border-lime-500/30 transition-all duration-200"
            >
              <div className="p-3 bg-lime-500/10 text-lime-400 rounded-lg mb-3">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm text-gray-400 font-medium">{stat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

StatBanner.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ),
};
