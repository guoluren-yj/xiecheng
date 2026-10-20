import React, { memo } from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import pinIcon from '../../assets/pin.svg';
import cancelPinIcon from '../../assets/cancel_pin.svg';
import styles from './index.less';

interface PanelExtraProps {
  showExtra?: boolean
  stickyFlag: boolean,
  setStickyFlag: (flag: boolean) => void
}

const prefixCls = 'summary-panel-extra';
const PanelExtra = memo(
  (props: PanelExtraProps) => {

    const { showExtra, stickyFlag, setStickyFlag } = props;

    return showExtra ? (
      <div className={styles[prefixCls]} onClick={() => setStickyFlag(!stickyFlag)}>
        <Tooltip
          placement="top"
          title={
            stickyFlag
              ? intl.get('ssta.common.view.message.pinAreaCancel').d('取消固定此区域')
              : intl.get('ssta.common.view.message.pinArea').d('固定此区域')
          }
        >
          <img
            alt=""
            src={stickyFlag ? pinIcon : cancelPinIcon}
            className={styles[`${prefixCls}-icon`]}
          />
          {stickyFlag
            ? intl.get('ssta.common.view.message.cancelPin').d('取消钉住')
            : intl.get('ssta.common.view.message.onTheTop').d('钉在顶部')}
        </Tooltip>
      </div>
    ) : null;
  }
);

export default PanelExtra;