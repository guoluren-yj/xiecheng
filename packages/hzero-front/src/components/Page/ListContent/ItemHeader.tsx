import * as React from 'react';
import classNames from 'classnames';
import './styles.less';

const ItemHeader = (props) => {
  const { title, children, style, className } = props;
  const classString = classNames('item-head', className);

  return (
    <div className={classString} style={style}>
      {title && (
        <span key="item-head-title" className="item-head-title">
          {title}
        </span>
      )}
      <div key="item-head-operator" className="item-head-operator">
        {children}
      </div>
    </div>
  );
};

export default ItemHeader;
