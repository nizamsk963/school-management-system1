import React from 'react';

const PagePlaceholder = ({ title, message }) => {
  return (
    <div className="placeholder-page">
      <h2>{title}</h2>
      <p>{message || 'This page is not implemented yet. Please check back later.'}</p>
    </div>
  );
};

export default PagePlaceholder;
