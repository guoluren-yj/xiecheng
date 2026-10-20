import React from 'react';

import { Expose } from 'utils/remote';

import ReceiptWorkFlowLineBatchEdit from '@/routes/scux/ReceiptWorkFlowLineBatchEdit';

export default new Expose({
  process: {
    SINV_PRDETAIL_REMOTE_PROCESS_TABLE_SELECTION: (sourceConfig, otherProps) => {
      const { that } = otherProps || {};
      const { sourceFromPub } = that?.state || {};
      if (sourceFromPub) {
        return 'rowbox';
      };
      return sourceConfig;
    },
    cuxHandleLineBtns: (sourceLineBtns, otherProps) => {
      const { that } = otherProps || {};
      const { sourceFromPub, rcvTrxHeaderId } = that?.state || {};
      const { onFormLoaded } = that?.props || {};

      if (sourceFromPub) {
        return [
          ...(sourceLineBtns || []),
          {
            name: 'cuxBatchEdit',
            child: '批量编辑',
            btnType: 'c7n-pro',
            btnComp: ReceiptWorkFlowLineBatchEdit,
            btnProps: {
              wait: 1000,
              funcType: 'flat',
              tableDs: that?.tableDs,
              onFormLoaded,
              rcvTrxHeaderId,
            },
          },
        ];
      };
      return sourceLineBtns;
    },
  },
});