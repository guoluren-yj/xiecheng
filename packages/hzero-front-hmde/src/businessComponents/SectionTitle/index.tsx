import React, { memo } from 'react';

import styles from './index.less';

interface IIndex {
  title: string; // 块级标题 必输
  children?: any; // 块级标题内容 任何元素
  flex?: boolean; // 开启关闭flex布局 默认开启
}
const Index = ({ title = '', children, flex = true }: IIndex) => {
  return (
    <h3 className={flex && styles['section-wrapper']}>
      <span>{title}</span>
      {children}
    </h3>
  );
};
export default memo(Index);
