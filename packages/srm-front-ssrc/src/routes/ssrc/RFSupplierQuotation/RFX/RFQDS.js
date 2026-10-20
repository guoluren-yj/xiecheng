import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  PrefixV2,
  getCategoryCode,
  getDocumentTypeName,
  getQuotationName,
} from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const defaultPageSize = 5;

const RFQTableDS = ({ customizeUnitCode, currentTable, pageSize, bidFlag }) => ({
  primaryKey: 'uniqueKey',
  selection: false,
  pageSize: pageSize || defaultPageSize,
  fields: [
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.message.button.operating').d('操作'),
    },
    {
      name: 'displayQuotationStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
    },
    {
      name: 'rfxNum',
      type: 'string',
      label: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonRfxNum`, {
          categoryCode: getCategoryCode(bidFlag),
        })
        .d('{categoryCode}单号'),
    },
    {
      name: 'rfxLineItemNum',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
    },
    {
      name: 'rfxTitle',
      type: 'string',
      label: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonRfxTitle`, {
          documentTypeName: getDocumentTypeName(bidFlag),
        })
        .d('{documentTypeName}标题'),
    },
    {
      name: 'pretrialApplication',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.pretrialApplication`).d('预审申请'),
    },
    {
      name: 'clearAnswerList',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswerList`).d('澄清答疑'),
    },
    {
      name: 'quotationStartDate',
      showType: 'dateTime',
      label: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartDate`, {
          quotationName: getQuotationName(bidFlag),
        })
        .d('{quotationName}开始时间'),
    },
    {
      name: 'quotationEndDate',
      showType: 'dateTime',
      label: intl
        .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndDate`, {
          quotationName: getQuotationName(bidFlag),
        })
        .d('{quotationName}截止时间'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
      name: 'roundNumber',
      type: 'string',
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.sourcingApproach`).d('寻源方式'),
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.creater`).d('创建人'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { multiRfxNumOrTitle = null } = data || {};

      return {
        url: `${PrefixV2}/${organizationId}/rfx/quotation/list/${currentTable}`,
        method: 'GET',
        data: {
          customizeUnitCode,
          secondarySourceCategory: bidFlag ? 'NEW_BID' : '',
          ...data,
          multiRfxNumOrTitle: multiRfxNumOrTitle?.join(','),
        },
      };
    },
  },
});

export { RFQTableDS };
