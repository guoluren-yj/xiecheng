import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import { noop } from 'lodash';
import intl from 'utils/intl';

import BatchQuotationPrice from'./BatchQuotationPrice';

const BatchEditModal = (props) => {
  const { onClose = noop, onOk = noop, totalPriceLoading = false } = props || {};

  const modal = Modal.open({
    key: 'bidding-hall-batch-edit-modal',
    title: intl.get('ssrc.supplierQuotation.view.button.batchMaintenance').d('批量维护'),
    children: <BatchQuotationPrice {...props} />,
    style: { width: '380px' },
    drawer: true,
    closable: true,
    onOk,
    okProps: {
      loading: totalPriceLoading,
    },
    afterClose: onClose,
  });
  return modal;
};

export { BatchEditModal };
