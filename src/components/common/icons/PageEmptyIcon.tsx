import React from 'react';

const PageEmptyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M16 8h24l12 12v32a4 4 0 01-4 4H16a4 4 0 01-4-4V12a4 4 0 014-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.4"
    />
    <path
      d="M40 8v12h12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.4"
    />
    <circle cx="32" cy="34" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
  </svg>
);

export default PageEmptyIcon;
