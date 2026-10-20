import React, { memo } from 'react';
import { Icon, Tooltip } from 'choerodon-ui/pro';

import styles from './index.less';

export interface CardTitleProps {
  title: string;
  help?: string;
  effectiveTip?: string;
  effectiveText?: string;
}

const CardTitle = memo((props: CardTitleProps) => {

  const {
    title,
    help,
    effectiveTip,
    effectiveText,
  } = props;

  return (
    <div className={styles['card-title-wrapper']}>
      <div>
        {title}
        {help && (
          <Tooltip title={help}>
            <Icon type="help" className={styles['card-title-help']} />
          </Tooltip>
        )}
      </div>
      {effectiveText && (
        <div className={styles['card-title-effective-wrapper']}>
          <Tooltip title={effectiveTip}>
            <Icon type="info" className={styles['card-title-effective-help']} />
            {effectiveText}
          </Tooltip>
        </div>
      )}
    </div>
  );
});
export default CardTitle;