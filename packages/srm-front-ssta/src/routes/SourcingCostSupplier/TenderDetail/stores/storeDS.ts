import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import { TenderDetailGridUnitCode, TenderHeadUnitCode } from '../../utils/type';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export const tenderHeaderDS = (tenderFeesId: string): DataSetProps => {
  return {
    paging: false,
    autoQuery: true,
    forceValidate: true,
    primaryKey: 'tenderFeesId',
    fields: [
      {
        name: 'tenderFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeNumber').d('招标文件费编号'),
      },
      {
        name: 'tenderFeesStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tendeFilerFeeStatus').d('招标文件费状态'),
        lookupCode: 'SDEP.TENDER_FEES_STATUS',
      },
      {
        name: 'tenderFeesPaymentStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.payStatus').d('缴纳状态'),
        lookupCode: 'SDEP.TENDER_FEES_PAYMENT_STATUS',
      },
      {
        name: 'tenderFeesInvoiceStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.invoicingStatus').d('开票状态'),
        lookupCode: 'SDEP.TENDER_FEES_INVOICE_STATUS',
      },
      {
        name: 'sourceDocumentTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentType').d('寻源单据类型'),
      },
      {
        name: 'sourceDocumentNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentNumber').d('寻源单据编号'),
      },
      {
        name: 'sourceDocumentTitle',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.sourceDocumentTitle').d('寻源单据标题'),
      },
      {
        name: 'creationDate',
        type: FieldType.date,
        label: intl.get('ssta.common.model.common.createdDate').d('创建日期'),
      },
      {
        name: 'createdUserName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.createdBy').d('创建人'),
      },
      {
        name: 'companyNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderCompanyNum').d('招标公司编码'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderCompanyName').d('招标公司名称'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get('ssta.common.model.common.currency').d('币种'),
      },
      {
        name: 'supplierCompanyNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSupplierNum').d('招标供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSupplierName').d('招标供应商名称'),
      },
      {
        name: 'sourceCompanyNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSourceCompanyNum').d('招标源公司编码'),
      },
      {
        name: 'sourceCompanyName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderSourceCompanyName').d('招标源公司名称'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeAmount').d('招标文件费金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'payRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeePaymentRule').d('招标文件费支付规则'),
      },
      {
        name: 'invoiceRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeInvoicingRule').d('招标文件费开票规则'),
      },
      {
        name: 'downloadNodeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeDownloadNode').d('招标文件费下载时点'),
      },
      {
        name: 'paymentRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeePayRule').d('招标文件费缴纳规则'),
      },
      {
        name: 'returnRuleMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeReturnRule').d('招标文件费退回规则'),
      },
      {
        name: 'defaultDirectInvoiceTypeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.defaultDirectInvoiceType').d('默认直连开票类型'),
      },
    ],
    queryParameter: { tenderFeesId, customizeUnitCode: Object.values(TenderHeadUnitCode).join() },
    transport: {
      read: () => {
        return {
          url: `${apiPrefix}/tender-feess/detail`,
          method: 'GET',
        };
      },
    },
  };
};

export const payRecordDS = (): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.lineNum').d('行号'),
      },
      {
        name: 'tenderFeesNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.tenderFileFeeNumber').d('招标文件费编号'),
      },
      {
        name: 'paymentCategory',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentType').d('支付类型'),
        lookupCode: 'SDEP.TENDER_FEES_PAYMENT_CATEGORY',
      },
      {
        name: 'tenderPayRecordStatus',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentRecordStatus').d('支付记录状态'),
        lookupCode: 'SDEP.RECORD_STATUS',
      },
      {
        name: 'paymentModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentMethod').d('支付方式'),
      },
      {
        name: 'paymentAmount',
        type: FieldType.number,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentAmount').d('支付金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'paymentDate',
        type: FieldType.dateTime,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.paymentTime').d('支付时间'),
      },
      {
        name: 'purchaserConfirmByName',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.purchaserConfirmBy').d('采购方确认人'),
      },
      {
        name: 'paymentOrderNum',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.extSysPaymentOrderNum').d('外部系统支付单号'),
      },
      {
        name: 'approveModeMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.approveMethod').d('审批方式'),
      },
      {
        name: 'initiateCampMeaning',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.initiatorCamp').d('发起方阵营'),
      },
      {
        name: 'processInstanceId',
        type: FieldType.string,
        label: intl.get('ssta.sourcingCost.model.sourcingCost.workflowProcessIdentification').d('工作流流程标识'),
      },
    ],
    queryParameter: { customizeUnitCode: TenderDetailGridUnitCode.PAY },
    transport: {
      read: ({ data }) => {
        const { tenderFeesId } = data;
        return {
          url: `${apiPrefix}/tender-pay-records/list/${tenderFeesId}`,
          method: 'GET',
        };
      },
    },
  };
};