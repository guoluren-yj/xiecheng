import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const ladderQuotationHeaderDS = () => ({
  paging: false,
  fields: [
    {
      name: 'itemCode',
      label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemName').d('物料名称'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqQuotationId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/view/ladder-header`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION_HEADER' },
        data: { rfqQuotationId },
      };
    },
  },
});
const ladderQuotationTableDS = () => ({
  primaryKey: 'ladderQuotationId',
  paging: false,
  selection: false,
  fields: [
    {
      name: 'ladderLineNum',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderLineNum')
        .d('阶梯行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryLadderFrom')
        .d('数量从(>=)'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.secondaryLadderTo')
        .d('数量至(<)'),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderFrom')
        .d('基本数量从(>=)'),
    },
    {
      name: 'ladderTo',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderTo')
        .d('基本数量至(<)'),
    },
    {
      name: 'ladderSecPrice',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderSecPrice')
        .d('单价(含税)'),
    },
    {
      name: 'ladderPrice',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.ladderPrice')
        .d('基本单价(含税)'),
    },
    {
      name: 'netLadderSecPrice',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netLadderSecPrice')
        .d('单价(不含税)'),
    },
    {
      name: 'netLadderPrice',
      type: 'number',
      label: intl
        .get('ssrc.quickInquiry.quickReply.model.quickInquiry.netLadderPrice')
        .d('基本单价(不含税)'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.remark').d('备注'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { rfqQuotationId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/purchase/quick-rfq-quotations/view/quotation-ladder`,
        method: 'POST',
        params: { customizeUnitCode: 'SSRC.QUICK_INQUIRY.LIST.QUO_LADDER_QUOTATION' },
        data: { rfqQuotationId },
      };
    },
  },
});

export { ladderQuotationTableDS, ladderQuotationHeaderDS };
