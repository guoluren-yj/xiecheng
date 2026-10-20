
import React from 'react';
import { Content } from 'components/Page';
import styles from './style.less';

const SubContent = (props) => {
  const { id, title, showDivide, children, style, hasTip } = props;
  return (
    <>
      {showDivide && <div className={styles['part-content-divider']} />}
      <Content id={id} className={styles['part-content']} style={style}>
        <div className={styles["content-title"]} style={hasTip ? { marginBottom: 8 } : {}}>
          {title}
        </div>
        <div className="sub-content-body">{children}</div>
      </Content>
    </>
  );
};
export default SubContent;