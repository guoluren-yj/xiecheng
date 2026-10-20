/**
 * 提示信息块
 */
import React, { useCallback } from 'react';
import { Icon } from 'choerodon-ui';
import classnames from 'classnames';

import intl from 'utils/intl';

import styles from './index.less';

const promptCode = 'ssrc.inquiryHall';

export default function HelpMessageSection(props) {
  const {
    leftIcon = 'info',
    helpMessage,
    className,
    sectionFlag,
    setShowFlag,
    showFlag = false,
  } = props;
  const handleClose = useCallback(() => {
    setShowFlag(false);
  }, []);
  return showFlag ? (
    <div
      className={classnames(
        styles['help-message-section-wrap'],
        className,
        sectionFlag && styles['help-message-section-wrap-section']
      )}
    >
      <Icon className={styles['left-icon']} type={leftIcon} />
      <span>
        {helpMessage ||
          intl
            .get(`${promptCode}.view.message.minPriceTips`)
            .d('已为您自动选用每个物料最低价的供应商, 可以直接手动修改或批量编辑。')}
      </span>
      <Icon type="close" className={styles['right-icon']} onClick={handleClose} />
    </div>
  ) : (
    <div />
  );
}
