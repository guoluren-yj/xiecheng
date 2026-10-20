import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { AiRecognizeStatus } from '../utils/type';

const organizationId = getCurrentOrganizationId();

export const aiRecognizeRecordDS = (identifyStatus: AiRecognizeStatus): DataSetProps => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'invoiceAiBatchId',
  selection: false,
  fields: [
    {
      name: 'sourceDoc',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.sourceDoc').d('识别来源'),
      lookupCode: 'SSTA_INVOICE_AI_SOURCE_DOC',
    },
    {
      name: 'batchNum',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.batchNum').d('识别批次'),
    },
    {
      name: 'aiAttachmentUrl',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.aiAttachmentUrl').d('识别文件'),
    },
    {
      name: 'recognizeStatus',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.RecognizeStatus').d('识别状态'),
      lookupCode: 'SSTA_INVOICE_AI_IDENTIFY_STATUS',
    },
    {
      name: 'settleNum',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.settleHeaderNum').d('结算单号'),
    },
    {
      name: 'invoiceNum',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.invoiceNum').d('发票号码'),
    },
    {
      name: 'invoicingDate',
      type: FieldType.date,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.invoicingDate').d('开票日期'),
    },
    {
      name: 'syncStatus',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.syncStatus').d('同步状态'),
      lookupCode: 'SSTA_INVOICE_AI_SYNC_STATUS',
    },
    {
      name: 'syncMessage',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.syncMessage').d('同步反馈信息'),
    },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      label: intl.get('ssta.common.model.common.createdDate').d('创建时间'),
    },
    {
      name: 'returnMessage',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.returnMessage').d('失败原因'),
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${SRM_SSTA}/v1/${organizationId}/invoice-ai-batch/page`,
      method: 'GET',
      data: {
        ...data,
        identifyStatus,
      },
    }),
  },
});

export const headerDS = ({ aiBatchId }): DataSetProps => ({
  autoQuery: true,
  primaryKey: 'aiBatchId',
  forceValidate: true,
  dataToJSON: DataToJSON.all,
  fields: [
    { name: 'invoiceNum', label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.invoiceNum').d('发票号码') },
    {
      name: 'invoiceType',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.invoiceType').d('发票类型'),
      lookupCode: 'SSTA.THIRDPART_STANDARD_INVOICE_TYPE',
    },
    {
      name: 'invoicingDate',
      type: FieldType.date,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.invoicingDate').d('开票日期'),
    },
    {
      name: 'currencyLov',
      type: FieldType.object,
      lovCode: 'SSTA.CURRENCY',
      textField: 'currencyCode',
      label: intl.get('ssta.common.model.common.currency').d('币种'),
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'taxIncludedAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.taxIncludedAmountMeaning').d('含税金额'),
    },
    {
      name: 'netAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.netAmountMeaningno').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.thetaxAmount').d('税额'),
    },
    {
      name: 'paymentTerms',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.paymentTerms').d('支付条款'),
    },
    {
      name: 'companyName',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.buyscompanyName').d('购方名称'),
    },
    {
      name: 'buyerContact',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.buyerContact').d('购方联系人'),
    },
    {
      name: 'purAddrAndTel',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.supcompanysName').d('销方名称'),
    },
    {
      name: 'sellerContact',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.sellerContact').d('销方联系人'),
    },
    {
      name: 'supAddrAndTel',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.supAddrAndTel').d('销方地址电话'),
    },
    {
      name: 'beneficiaryBank',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.beneficiaryBank').d('收款银行'),
    },
    {
      name: 'beneficiaryAccountNum',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.beneficiaryAccountNum').d('收款银行账号'),
    },
    {
      name: 'beneficiaryAccountName',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.beneficiaryAccountName').d('收款银行账户名称'),
    },
    {
      name: 'beneficiaryBankAddress',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.beneficiaryBankAddress').d('收款银行地址'),
    },
    { name: 'memo', label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.memo').d('备忘说明') },
  ],
  queryParameter: {
    aiBatchId,
  },
  transport: {
    read: () => ({
      url: `${SRM_SSTA}/v1/${organizationId}/invoice-ai-header-infos/detail`,
      method: 'GET',
    }),
    submit: ({ data }) => ({
      url: `${SRM_SSTA}/v1/${organizationId}/invoice-ai-header-infos/save/all`,
      method: 'POST',
      data: data[0],
    }),
  },
});

export const lineDS = ({ aiBatchId }): DataSetProps => ({
  primaryKey: 'aiLineId',
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'lineNum',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.lineNo').d('行号'),
    },
    {
      name: 'itemName',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.itemName').d('商品名称'),
    },
    {
      name: 'quantity',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.quantitys').d('数量'),
    },
    {
      name: 'netPrice',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.thenetsPrice').d('不含税单价'),
    },
    {
      name: 'taxRate',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.theTaxsRate').d('税率'),
    },
    {
      name: 'netAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.netAmountMeaningno').d('不含税金额'),
    },
    {
      name: 'taxAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.thetaxAmount').d('税额'),
    },
    {
      name: 'taxIncludedAmount',
      type: FieldType.number,
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.thetaxIncludesdAmount').d('含税金额'),
    },
    {
      name: 'uom',
      label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.uom').d('单位'),
    },
    { name: 'spec', label: intl.get('ssta.aiRecognizeRecord.model.aiRecognizeRecord.spec').d('规格型号') },
  ],
  queryParameter: {
    aiBatchId,
  },
  transport: {
    read: () => ({
      url: `${SRM_SSTA}/v1/${organizationId}/invoice-ai-line-infos/page`,
      method: 'GET',
    }),
  },
});
