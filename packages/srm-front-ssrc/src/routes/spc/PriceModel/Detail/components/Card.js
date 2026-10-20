import React, { memo } from 'react';

export default memo(function Card({ title, children }) {
  return (
    <div className="card-wrapper">
      <div className="card-content">
        <div className="card-content-title">{title}</div>
        {children}
      </div>
    </div>
  );
});
