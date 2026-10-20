import React from 'react';
import classnames from 'classnames';
import styles from './index.less';

function Card(props) {
  const { children, title, subTitle, style = {}, cardBodyStyle = {} } = props;
  return (
    <div className={styles['card-container']} style={style}>
      <div className="card-header">
        <div className="sagm-card-title">{title}</div>
      </div>
      {subTitle && <div className="sagm-card-sub-title">{subTitle}</div>}
      <div className="card-body" style={cardBodyStyle}>
        {children}
      </div>
    </div>
  );
}

const SubContent = (props) => {
  const { id, title, subTitle, showDivide, thirdCard = false, children, style = {} } = props;
  return (
    <>
      {showDivide && <div className={styles['content-divide']} />}
      <div
        id={id}
        className={classnames(styles['sub-content-container'], {
          [styles['third-card']]: thirdCard,
        })}
        style={style}
      >
        <div className="sub-content-header" id={id}>
          <div>{title}</div>
          {subTitle && <div className="sub-title">{subTitle}</div>}
        </div>
        <div className="sub-content-body">{children}</div>
      </div>
    </>
  );
};

export default Card;
export { SubContent, Card };
