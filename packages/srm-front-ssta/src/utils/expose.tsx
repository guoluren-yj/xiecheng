import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import commonStyles from '../routes/common.less';
import { getSettleHeaderData } from '../services/settlePoolServices';
import TenderPay from '../routes/SourcingCostSupplier/components/TenderPay';

interface OpenTenderPayModalParams {
  tenderFeesId?: number | string; // 招标文件费ID
  tenderFeesNum?: string; // 招标文件费编码
  returnUrl?: string, // 支付成功跳回页面
}
function openTenderPayModal(params: OpenTenderPayModalParams): void {
  const { tenderFeesId, tenderFeesNum, returnUrl } = params;
  if (!tenderFeesId && !tenderFeesNum) {
    throw new Error('At least one tenderFeesId or tenderFeesNum must be passed');
  }
  Modal.open({
    drawer: true,
    closable: true,
    key: Modal.key(),
    title: intl.get('ssta.sourcingCost.view.button.tenderFileFeePay').d('招标文件费用缴纳'),
    className: commonStyles['ssta-medium-modal'],
    children: <TenderPay tenderFeesId={tenderFeesId} tenderFeesNum={tenderFeesNum} returnUrl={returnUrl} />,
  });
};

export {
  openTenderPayModal,
  getSettleHeaderData,
};

