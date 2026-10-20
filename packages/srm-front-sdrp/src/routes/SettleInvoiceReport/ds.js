import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

export default function ReportDs({ customizeUnitCodes }) {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.settleInvoice.model.invoiceStatusMeaning').d('开票状态'),
        name: 'invoiceStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.settleNum').d('结算发票申请号'),
        name: 'settleNum',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.thirdEcInvoiceNum').d('第三方电商开票申请号'),
        name: 'thirdEcInvoiceNum',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.taxIncludedAmount').d('结算发票申请金额'),
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.invoiceTaxIncludedAmount').d('电商发票回执金额'),
        name: 'invoiceTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.explain').d('说明'),
        name: 'explain',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.processingService').d('当前处理服务'),
        name: 'processingService',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.settleStatusMeaning').d('结算开票状态'),
        name: 'settleStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.requestStatusMeaning').d('商城开票状态'),
        name: 'requestStatusMeaning',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.ecPlatformMeaning').d('来源电商'),
        name: 'ecPlatformMeaning',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.creationDate').d('开票创建时间'),
        name: 'creationDate',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.companyName').d('结算公司'),
        name: 'companyName',
      },
      {
        label: intl.get('sdrp.settleInvoice.model.supplierName').d('结算供应商'),
        name: 'supplierName',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${organizationId}/e-commerce/report/settle-invoice`,
          method: 'GET',
          params: {
            ...params,
            customizeUnitCode: customizeUnitCodes.join(','),
          },
        };
      },
    },
  };
}
