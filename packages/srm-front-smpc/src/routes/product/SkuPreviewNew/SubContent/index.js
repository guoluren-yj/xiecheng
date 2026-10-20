import React from 'react';

import styles from './style.less';

const SubContent = (props) => {
  const { id, title, showDivide = true, children, style } = props;
  return (
    <>
      {showDivide && <div className={styles['content-divide']} />}
      <div id={id} className={`${styles['sub-content-container']}`} style={style}>
        {title && (
          <div className="sub-content-header" id={id}>
            <span>{title}</span>
          </div>
        )}
        <div className="sub-content-body">{children}</div>
      </div>
    </>
  );
};

export default SubContent;
