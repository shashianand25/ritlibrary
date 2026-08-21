import React from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb navigation component showing hierarchical pathway
 */
export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-gray-400 py-3">
      <Link
        to="/"
        className="flex items-center text-gray-400 hover:text-white transition-colors duration-150"
        aria-label="Home"
      >
        <Home className="w-4 h-4 mr-1" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            {isLast || !item.to ? (
              <span className="font-medium text-lime-400 truncate max-w-xs" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-white transition-colors duration-150 truncate max-w-xs"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
};
