import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
}) => {
  return (
    <div
      className={`bg-[#1f2937] rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-700/50 ${className}`}
    >
      {(title || subtitle) && (
        <div
          className={`px-6 py-5 border-b border-gray-700/50 bg-[#1a2234] ${headerClassName}`}
        >
          {title && (
            <h3 className="text-2xl font-bold text-white tracking-tight animate-fade-in">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-400 mt-2 leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className={`px-6 py-6 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div
          className={`px-6 py-4 border-t border-gray-700/50 bg-[#1a2234]/70 backdrop-blur-sm ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;