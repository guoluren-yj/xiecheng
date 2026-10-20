import intl from 'utils/intl';

import { BID, getDocumentTypeName, getCategoryCode } from '@/utils/globalVariable';

// 单据头基本信息
const headerDataSet = (data = {}) => {
  const { sourceKey } = data || {};

  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'rfxNum',
        label: intl
          .get(`ssrc.inquiryHall.model.commonInquiryHall.RFXNo.`, {
            categoryCode: getCategoryCode(sourceKey === BID),
          })
          .d('{categoryCode}单号'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'rfxTitle',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
            documentTypeName: getDocumentTypeName(sourceKey === BID),
          })
          .d(`{documentTypeName}标题`),
        type: 'string',
        disabled: true,
      },
      {
        name: 'quotationRoundNumber',
        label: intl.get(`ssrc.inquiryHall.bargain.roundNumber`).d('轮次'),
        type: 'string',
        disabled: true,
      },
    ],
  };
};

export { headerDataSet };
