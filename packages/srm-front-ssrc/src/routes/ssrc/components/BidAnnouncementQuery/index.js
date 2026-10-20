import React from 'react';
import { Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import Container from './Container';
import { priceDS, amountDS } from './indexDS';

const useBidAnnouncementQueryModal = () => {
  const openBidAnnouncementQueryModal = ({
    doubleUnitFlag = false,
    rfxHeaderId,
    supplierCompanyId,
    bidFlag = false,
  }) => {
    const priceDs = new DataSet(priceDS({ doubleUnitFlag, bidFlag }));
    const amountDs = new DataSet(amountDS({ bidFlag }));
    const Props = {
      priceDs,
      amountDs,
      bidFlag,
      rfxHeaderId,
      doubleUnitFlag,
      supplierCompanyId,
    };

    const modal = Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.common.model.common.bidAnnouncementQuery').d('唱标查询'),
      children: <Container {...Props} modal={modal} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  return {
    openBidAnnouncementQueryModal,
  };
};

export default useBidAnnouncementQueryModal;
