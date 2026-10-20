import React from 'react';
import { noop } from 'lodash';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';

import { getQuotationName } from '@/utils/globalVariable';
import { InquiryAbandon, BidAbandon } from './children';

export default function abandonModal({
  bidFlag = false,
  cancelAbandon = noop,
  abandonOk = noop,
  AbandonRef,
}) {
  const abandonProps = { bidFlag };
  Modal.open({
    key: Modal.key(),
    title: intl
      .get(`ssrc.supplierQuotation.view.message.title.abandonQuotationOrBid`, {
        quoOrBidName: getQuotationName(bidFlag),
      })
      .d('放弃{quoOrBidName}'),
    children: bidFlag ? (
      <BidAbandon {...abandonProps} onRef={AbandonRef} />
    ) : (
      <InquiryAbandon {...abandonProps} onRef={AbandonRef} />
    ),
    style: {
      width: '380px',
    },
    drawer: true,
    closable: true,
    onCancel: cancelAbandon,
    onOk: async () => {
      const validateFlag = await AbandonRef?.current?.formDS?.validate();
      if (validateFlag) {
        abandonOk();
        return;
      }
      return false;
    },
  });
}
