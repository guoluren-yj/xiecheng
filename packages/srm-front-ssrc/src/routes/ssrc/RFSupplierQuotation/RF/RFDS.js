import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();
const defaultPageSize = 5;

const TableDS = ({ customizeUnitCode, currentTable, pageSize }) => ({
  primaryKey: 'uniqueKey',
  selection: false,
  pageSize: pageSize || defaultPageSize,
  autoQuery: false,
  fields: [
    {
      name: 'displayQuotationStatusMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
    },
    {
      name: 'operationMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.message.button.operating').d('操作'),
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.view.message.button.orderType').d('单据类型'),
    },
    {
      name: 'rfNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.RFNo.').d('RF单号'),
    },
    {
      name: 'rfTitle',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.RFITitle').d('征询书标题'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'quotationStartDate',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.RFIquotationStartTimes`)
        .d('征询开始时间'),
    },
    {
      name: 'quotationEndDate',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFIquotationDeadTimes`).d('征询截止时间'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.companyName`).d('客户'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`ssrc.rf.model.rf.sourceType`).d('寻源方式'),
    },
    {
      name: 'realName',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.creater`).d('创建人'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${Prefix}/${organizationId}/rf/quotation/list/${currentTable}`,
        method: 'GET',
        data: { ...data, customizeUnitCode, multiRfNumOrTitle: data?.multiRfNumOrTitle?.join(',') },
      };
    },
  },
});

export { TableDS };
