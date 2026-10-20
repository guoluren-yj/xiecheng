import React from 'react';

import { Expose } from 'utils/remote';
import intl from 'utils/intl';

import styles from './index.less';

export default new Expose({
  process: {
    SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER_OPERATION_DESC_ARR_CUX_MAP: () => {
      return {
        OFFLINE_WHOLE_RETURN: [
          `{realName} ({loginName}) `,
          intl.get('ssrc.common.view.message.backAction').d('退回了'),
          `【${intl.get('ssrc.common.view.message.rfx').d('询价单')}】`,
        ],
      };
    },
    SSRC_COMPONENTS_OPERATION_RECORD_CONTAINER_OPERATION_CUX_AFTER_TIME_RENDER: (_, otherProps) => {
      const { item } = otherProps || {};
      return item?.processOperation === 'OFFLINE_WHOLE_RETURN' ? (
        <div className={styles['operation-record-item-conent-remark']}>
          <>
            <span>
              {intl.get(`ssrc.common.model.operationRecord.trip.cuxRollbackRemark`).d('理由：')}
            </span>
            <span className={styles['operation-record-item-conent-remark-value']}>
              {item.processRemark || '-'}
            </span>
          </>
        </div>
      ) : null;
    },
  },
});
