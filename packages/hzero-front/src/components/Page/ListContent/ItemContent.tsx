/**
 * 工作区 ListContent
 *
 * @date: 2021-07-26
 * @author: chw <hongwei.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React from 'react';
import classNames from 'classnames';
import './styles.less';

const ItemContent = (props) => {
  const {
    children,
    style,
    wrapperStyle,
    wrapperClassName, // 包裹的className
    className, // 真正的 Content 的样式
  } = props;
  const classString = classNames('item-content-wrap', wrapperClassName);
  const contentClassString = classNames('item-content', className);
  return (
    <div className={classString} style={wrapperStyle}>
      <div className={contentClassString} style={style}>
        <React.Fragment key="item-content-content">{children}</React.Fragment>
      </div>
    </div>
  );
};

export default ItemContent;
