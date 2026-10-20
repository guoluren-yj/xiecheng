import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const ladderQuotationHeaderDS = () => ({
  primaryKey: 'rfqItemId',
  paging: false,
  fields: [
    {
      name: 'itemCode',
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemName`).d('物料名称'),
      name: 'itemName',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-items/detail`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.LADDER_QUOTATION_HEADER' },
        data: { rfqItemId },
      };
    },
  },
});
const ladderQuotationTableDS = () => ({
  primaryKey: 'ladderInquiryId',
  paging: false,
  selection: false,
  fields: [
    {
      name: 'ladderLineNum',
      type: 'string',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderLineNum').d('行号'),
    },
    // 维护辅助数量，基本数量由辅助数量计算出
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderFromRange').d('数量从（>=）'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.ladderToRange').d('数量至(<)'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: `${intl.get(`ssrc.common.model.inquiryHall.basicLadderFrom`).d('基本数量从')} (>=)`,
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      label: `${intl.get(`ssrc.common.model.inquiryHall.basicLadderTo`).d('基本数量至')} (>=)`,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.quickInquiry.model.quickInquiry.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqItemId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-ladder-inquirys/list`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.LADDER_QUOTATION' },
        data: { rfqItemId },
      };
    },
  },
});

export { ladderQuotationTableDS, ladderQuotationHeaderDS };
