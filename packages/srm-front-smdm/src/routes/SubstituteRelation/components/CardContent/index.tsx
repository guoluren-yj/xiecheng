import React, { ReactNode } from 'react';
import classNames from 'classnames';

import styles from './card.less';

interface CardProps {
  key: any,
  header: any,
  content: ReactNode,
  className?: string
}

const CardContent = (props: CardProps) => {
  const { key, header, content, className='' } = props;
  return (
    <div key={key} className={classNames(styles['smdm-sub-relation-card-container'], styles[className])}>
      <h3 className={classNames(styles['smdm-sub-relation-card-title'])}>{header}</h3>
      <div className={classNames(styles['smdm-sub-relation-card-content'])}>{content}</div>
    </div>
  )

} 

export default CardContent;