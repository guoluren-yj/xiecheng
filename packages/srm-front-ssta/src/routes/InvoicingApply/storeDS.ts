import { isNil, isArray } from 'lodash';
import { FieldIgnore, FieldType, DataSetSelection, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions, priceFormatterOptions } from '../../utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

// 开票申请头
export const invApplyHeaderDS = (applyHeaderId?: string | number): DataSetProps => ({
  paging: false,
  autoQuery: !isNil(applyHeaderId),
  primaryKey: 'applyHeaderId',
  dataToJSON: DataToJSON.all,
  fields: [
    {
      name: 'supplierCompanyLov',
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.belongCompanyName`).d('所属公司'),
      type: FieldType.object,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      lovPara: { tenantId },
      ignore: FieldIgnore.always,
    },
    {
      name: 'supplierCompanyId',
      type: FieldType.string,
      bind: 'supplierCompanyLov.companyId',
    },
    {
      name: 'supplierCompanyName',
      type: FieldType.string,
      bind: 'supplierCompanyLov.companyName',
    },
    {
      name: 'companyNameLov',
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.companyName`).d('所属客户'),
      type: FieldType.object,
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      textField: 'companyName',
      lovPara: { tenantId },
      ignore: FieldIgnore.always,
    },
    {
      name: 'companyId',
      type: FieldType.string,
      bind: 'companyNameLov.supplierCompanyId',
    },
    {
      name: 'companyName',
      type: FieldType.string,
      bind: 'companyNameLov.companyName',
    },
    {
      name: 'applyType',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.businessType`).d('业务类型'),
      lookupCode: 'SDIM.APPLY_TYPE',
      defaultValue: 'SALE_INVOICE',
    },
    {
      name: 'ruleLov',
      type: FieldType.object,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceRule`).d('开票规则'),
      lovCode: 'SDIM.POOL_RULE_LOV',
      lovPara: { tenantId },
    },
    {
      name: 'ruleId',
      type: FieldType.string,
      bind: 'ruleLov.ruleId',
    },
    {
      name: 'ruleNum',
      type: FieldType.string,
      bind: 'ruleLov.ruleNum',
    },
    {
      name: 'invoiceType',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.billType`).d('发票种类'),
      lookupCode: 'SDIM.INVOICE_TYPE',
      required: true,
    },
    {
      name: 'invoiceListMark',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purchaseListFlag`).d('购货清单标志'),
      lookupCode: 'SDIM.INVOICE_LIST_MARK',
      required: true,
    },
    {
      name: 'extNumber',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.extNumber`).d('分机号'),
    },
    {
      name: 'applyNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.InvoiceNum`).d('开票清单编号'),
    },
    {
      name: 'applyStatus',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.applyStatus`).d('申请状态'),
      defaultValue: 'NEW',
      lookupCode: 'SDIM.APPLY_STATUS',
    },
    {
      name: 'purchaseCompanyLov',
      label: intl.get('ssta.costSheet.model.costSheet.purname').d('购方名称'),
      type: FieldType.object,
      lovCode: 'SSTA.USER_AUTH_COMPANY.WITH_TAXCODE',
      textField: 'companyName',
      lovPara: { tenantId },
      ignore: FieldIgnore.always,
    },
    {
      name: 'purchaseCompanyId',
      type: FieldType.string,
      bind: 'purchaseCompanyLov.companyId',
    },
    {
      name: 'purchaseCompanyName',
      type: FieldType.string,
      bind: 'purchaseCompanyLov.companyName',
    },
    {
      name: 'purUnifiedSocialCode',
      type: FieldType.string,
      label: intl
        .get(`ssta.directPoolSupply.model.directPoolSupply.purUnifiedSocialCode`)
        .d('购方纳税人识别号'),
      bind: 'purchaseCompanyLov.unifiedSocialCode',
    },
    {
      name: 'saleCompanyLov',
      type: FieldType.object,
      label: intl.get('ssta.costSheet.model.costSheet.supcompanysName').d('销方名称'),
      lovCode: 'SSTA.USER_AUTH_SUPPLIER_WITH_TAX',
      textField: 'supplierCompanyName',
      lovPara: { tenantId },
      ignore: FieldIgnore.always,
    },
    {
      name: 'saleCompanyId',
      type: FieldType.string,
      bind: 'saleCompanyLov.supplierCompanyId',
    },
    {
      name: 'saleCompanyName',
      type: FieldType.string,
      bind: 'saleCompanyLov.supplierCompanyName',
    },
    {
      name: 'saleUnifiedSocialCode',
      type: FieldType.string,
      label: intl
        .get(`ssta.directPoolSupply.model.directPoolSupply.supUnifiedSocialCode`)
        .d('销方纳税人识别号'),
      bind: 'saleCompanyLov.unifiedSocialCode',
    },
    {
      name: 'purchaseCompanyType',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purCompanyType`).d('购方企业类型'),
      lookupCode: 'SDIM.COMPANY_TYPE',
    },
    {
      name: 'saleCompanyType',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.supCompanyType`).d('销方企业类型'),
      lookupCode: 'SDIM.COMPANY_TYPE',
    },
    {
      name: 'purAddressTel',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.purAddrAndTel').d('购方地址电话'),
    },
    {
      name: 'saleAddressTel',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.supAddrAndTel').d('销方地址电话'),
    },
    {
      name: 'purBankAndAccount',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purBankAccount`).d('购方开户行及账号'),
    },
    {
      name: 'saleBankAndAccount',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.supBankAccount`).d('销方开户行及账号'),
    },
    {
      name: 'netAmount',
      type: FieldType.number,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.totalIncludeTax`).d('合计不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: FieldType.number,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.totalTax`).d('合计税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'amount',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.taxsIncludedAmount').d('价税合计'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'invoiceBy',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.drawer').d('开票人'),
    },
    {
      name: 'payee',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.payee').d('收款人'),
    },
    {
      name: 'reviewer',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.reviewer').d('复核人'),
    },
    {
      name: 'receiver',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiver`).d('受票人'),
    },
    {
      name: 'recipientPhone',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiverPhone`).d('受票人电话'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('pushPhoneFlag')) === 1,
      },
    },
    {
      name: 'recipientEmail',
      type: FieldType.email,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiverEmail`).d('受票人邮箱'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('pushEmailFlag')) === 1,
      },
    },
    {
      name: 'recipientAddress',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceReceiverAddress`).d('受票人地址'),
    },
    {
      name: 'pushEmailFlag',
      type: FieldType.boolean,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.pushEmailFlag`).d('将电票版式文件推送至受票人邮箱'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'pushPhoneFlag',
      type: FieldType.boolean,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.pushPhoneFlag`).d('将电票版式文件推送至受票人手机短信'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'billingType',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.invoiceTypeMeaning').d('开票类型'),
      lookupCode: 'SDIM.BILLING_TYPE',
    },
    {
      name: 'invoiceCode',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.invoiceCode').d('发票代码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('billingType') === '0',
      },
    },
    {
      name: 'invoiceNum',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.invoiceNum').d('发票号码'),
      dynamicProps: {
        disabled: ({ record }) => record.get('billingType') === '0',
      },
    },
    {
      name: 'writeOffReason',
      type: FieldType.string,
      lookupCode: 'SDIM.WRITE_OFF_REASON',
      label: intl.get('ssta.common.model.purchaseSettle.invoiceRefundedReason').d('冲红原因'),
      dynamicProps: {
        required: ({ record }) => Number(record.get('billingType')) === 2,
      },
    },
    {
      name: 'redInfoNumber',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.redInfoTable').d('红字信息表/红字确认单编号'),
      // required: true,
    },
    {
      name: 'invoiceSpecialMark',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.invoiceSpecialMark').d('特殊票种标志'),
      lookupCode: 'SDIM.INVOICE_SPECIAL_MARK',
      required: true,
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.remark').d('备注'),
    },
    {
      name: 'representativeFlag',
      type: FieldType.number,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.representativeFlag`).d('代开标志'),
      defaultValue: 0,
    },

    {
      name: 'paperInvoiceType',
      type: FieldType.string,
      lookupCode: 'SDIM.PAPER_INVOICE_TYPE',
      label: intl.get(`ssta.invoiceRule.model.rule.paperInvoiceType`).d('纸质发票类型'),
    },
    {
      name: 'pushPriceFlag',
      type: FieldType.string,
      label: intl.get(`ssta.invoiceRule.model.rule.unitPriceRelease`).d('是否传出单价'),
      lookupCode: 'HPFM.FLAG',
      required: true,
    },
    {
      name: 'digitInvoiceNum',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.invoiceNumDigit').d('数电发票号码'),
    },
    {
      name: 'originalInvoiceCode',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.originalInvoiceCode').d('原蓝票发票代码'),
    },
    {
      name: 'originalInvoiceNum',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.originalInvoiceNum').d('原蓝票发票号码'),
    },
    {
      name: 'originalDigitInvoiceNum',
      type: FieldType.string,
      label: intl.get('ssta.supplySettle.model.supplySettle.originalInvoiceNumDigit').d('原蓝票数电发票号码'),
    },

    {
      name: 'buyer',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.purchaseInfo`).d('购方信息'),
    },
    {
      name: 'seller',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.saleInfo`).d('销方信息'),
    },
    {
      name: 'invoiceDate',
      type: FieldType.date,
      label: intl.get('ssta.costSheet.model.costSheet.invoicingDate').d('开票日期'),
    },
    {
      name: 'sourceDocTotalNetAmount',
      type: FieldType.number,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.totalIncludeTax`).d('合计不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'sourceDocTotalTaxAmount',
      type: FieldType.number,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.totalTax`).d('合计税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'sourceDocTotalAmount',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.taxsIncludedAmount').d('价税合计'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxIncludedPriceFlag',
      type: FieldType.string,
      label: intl.get(`ssta.invoiceRule.model.rule.unitPriceTaxFlag`).d('单价含税标志'),
      lookupCode: 'SDIM.TAX_INCLUDED_PRICE_FLAG',
      required: true,
    },
  ],
  queryParameter: {
    applyHeaderId,
  },
  transport: {
    read: ({ dataSet }): any => {
      const applyHeaderId = dataSet?.getQueryParameter('applyHeaderId');
      if (!applyHeaderId) return;
      const url = `${apiPrefix}/direct-invoice-apply-headers/detail/${applyHeaderId}`;
      return {
        url,
        method: 'GET',
      };
    },
    submit: ({ dataSet, data }): any => {
      const submitType = dataSet?.getState('submitType');
      const submitParam = dataSet?.getState('submitParam');
      switch (submitType) {
        case 'update':
          return {
            url: `${apiPrefix}/direct-invoice-apply-headers/save`,
            method: 'PUT',
            data: data[0],
          };
        case 'submit':
          return {
            url: `${apiPrefix}/direct-invoice-apply-headers/submit`,
            method: 'PUT',
            data: submitParam,
          };
        case 'delete':
          return {
            url: `${apiPrefix}/direct-invoice-apply-headers/delete`,
            method: 'PUT',
            data: submitParam,
          };
        default:
      }
    },
  },
});

// 开票申请行
export const invApplyLineDS = (): DataSetProps => ({
  forceValidate: true,
  cacheSelection: true,
  selection: DataSetSelection.multiple,
  primaryKey: 'applyLineId',
  autoQueryAfterSubmit: false,
  fields: [
    {
      name: 'lineNum',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.linseNum').d('行号'),
    },
    {
      name: 'applyLineType',
      lookupCode: 'SDIM.APPLY_LINE_TYPE',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceLineType`).d('发票行性质'),
      required: true,
    },
    {
      name: 'associatedDiscountedLineNumStr',
      type: FieldType.string,
      label: intl.get('ssta.common.model.invoiceApply.lineNumDiscounted').d('被折扣行行号'),
    },
    {
      name: 'originalApplyLineIdLov',
      lovCode: 'SDIM.BLUE_APPLY_LINE',
      type: FieldType.object,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.originalApplyLineIdLov`).d('关联蓝票明细行序号'),
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          applyHeaderId: dataSet.parent.current?.get('originalApplyHeaderId'),
        }),
        required: ({ dataSet }) => Number(dataSet.parent.current?.get('billingType')) === 2,
      },
    },
    {
      name: 'originalApplyLineNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.originalApplyLineIdLov`).d('关联蓝票明细行序号'),
      bind: 'originalApplyLineIdLov.lineNum',
    },
    {
      name: 'originalApplyLineId',
      type: FieldType.string,
      bind: 'originalApplyLineIdLov.applyLineId',
    },
    {
      name: 'commodityCode',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.taxNum`).d('税收编码'),
    },
    {
      name: 'projectName',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.chargsseCode').d('货物或应税劳务，服务名称'),
    },
    {
      name: 'model',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.spec').d('规格型号'),
    },
    {
      name: 'uomCode',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.theUom').d('单位'),
    },
    {
      name: 'uomName',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.uomName').d('单位名称'),
    },
    {
      name: 'quantity',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.quantitys').d('数量'),
    },
    {
      name: 'netPrice',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.thenetPrice').d('不含税单价'),
      computedProps: { formatterOptions: priceFormatterOptions },
    },
    {
      name: 'taxRate',
      type: FieldType.string,
      label: intl.get('ssta.costSheet.model.costSheet.taxRate').d('税率'),
    },
    {
      name: 'price',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.taxIncssludedAmount').d('含税单价'),
      computedProps: { formatterOptions: priceFormatterOptions },
    },
    {
      name: 'netAmount',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.noIncludedPrice').d('不含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'taxAmount',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.thetaxAmount').d('税额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'amount',
      type: FieldType.number,
      label: intl.get('ssta.costSheet.model.costSheet.thetaxIncludesdAmount').d('含税金额'),
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'deductionAmount',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.deduction`).d('扣除额'),
    },
    {
      name: 'freeTaxMark',
      type: FieldType.string,
      label: intl.get('ssta.commodity.model.commodity.zeroTaxRateFlag').d('零税率标识'),
      lookupCode: 'SDIM.FREE_TAX_MARK',
    },
    {
      name: 'preferentialPolicyFlag',
      type: FieldType.string,
      label: intl.get('ssta.commodity.model.commodity.policy').d('优惠政策标识'),
      lookupCode: 'SDIM.PREFERENTIAL_POLICY_FLAG',
    },
    {
      name: 'specialManagementVat',
      type: FieldType.string,
      label: intl.get('ssta.commodity.model.commodity.specialVAT').d('增值税特殊管理'),
    },
    {
      name: 'vehicleType',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.carType`).d('车辆类型'),
    },
    {
      name: 'brandModel',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.factoryPlate`).d('厂牌型号'),
    },
    {
      name: 'productArea',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.sourceArea`).d('原产地'),
    },
    {
      name: 'certificateNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.qualifiedNum`).d('合格证号'),
    },
    {
      name: 'importExportCertificateNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.exportsAndImportsNum`).d('进出口证明书号'),
    },
    {
      name: 'commodityInspectionNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.commodityInspectionNum`).d('商检单号'),
    },
    {
      name: 'engineNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.EngineNo`).d('发动机号码'),
    },
    {
      name: 'vehicleNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.vehicleNum`).d('车辆识别号码/机动车号码'),
    },
    {
      name: 'taxPaymentCertificateNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.taxCertificateNum`).d('完税证明号码'),
    },
    {
      name: 'tonnage',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.tonnage`).d('吨位'),
    },
    {
      name: 'passengersLimit',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.maxCapacity`).d('限乘人数'),
    },
    {
      name: 'organizationCode',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.IDNum`).d('身份证号码或组织机构代码'),
    },
    {
      name: 'sourceDocSettleNum',
      type: FieldType.string,
      label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.settleNum`).d('结算事务编号'),
    },
  ],
  transport: {
    read: ({ data }): any => {
      const { applyHeaderId } = data;
      if (!applyHeaderId) return;
      const url = `${apiPrefix}/direct-invoice-apply-lines/${applyHeaderId}`;
      return {
        url,
        method: 'GET',
      };
    },
  },
});

export const batchModifyInvoiceDS = (applyHeaderId): any => {
  return {
    autoCreate: true,
    forceValidate: true,
    autoQuery: false,
    fields: [
      {
        name: 'applyLineType',
        lookupCode: 'SDIM.APPLY_LINE_TYPE',
        type: FieldType.string,
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceLineType`).d('发票行性质'),
        required: true,
      },
    ],
    transport: {
      submit: ({ dataSet, data }) => {
        const applyLineIdList = dataSet?.getState('applyLineIdList');
        return {
          url: `${apiPrefix}/direct-invoice-apply-lines/edit`,
          method: 'PUT',
          data: {
            applyLineIdList,
            applyHeaderId,
            ...data[0],
          },
        };
      },
    },
  };
};


export const relationDiscountedDS = (applyHeaderId): any => {
  return {
    autoCreate: true,
    forceValidate: false,
    autoQuery: true,
    paging: false,
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'applyLineType',
        lookupCode: 'SDIM.APPLY_LINE_TYPE',
        type: FieldType.string,
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.invoiceLineType`).d('发票行性质'),
      },
      {
        name: 'associateDiscountedLov',
        lovCode: 'SDIM.DISCOUNTED_LINE',
        type: FieldType.object,
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.AssociateDiscounted`).d('关联被折扣行'),
        multiple: true,
        required: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            applyLineId: record.get('applyLineId'),
            applyHeaderId,
            applyLineTypeStr: '0,2',
          }),
        },
      },
      {
        name: 'associatedDiscountedIdList',
        type: FieldType.string,
        bind: 'associateDiscountedLov.applyLineId',
      },
      {
        name: 'associatedDiscountedIdStr',
        type: FieldType.number,
        bind: 'associateDiscountedLov.applyLineId',
        transformRequest: (value) => (isArray(value) ? Number(value[0]) : Number(value)),
        multiple: ',',
        ignore: 'always',
      },
      {
        name: 'associatedDiscountedLineNumStr',
        type: FieldType.string,
        bind: 'associateDiscountedLov.lineNum',
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        multiple: ',',
        label: intl.get('ssta.common.model.invoiceApply.lineNumDiscounted').d('被折扣行行号'),
      },
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceApply.lineNumDiscount').d('折扣行行号'),
      },
      {
        name: 'amount',
        type: FieldType.number,
        label: intl.get('ssta.common.model.invoiceApply.thetaxIncludesdAmount').d('折扣行含税金额'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'sourceDocSettleNum',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceApply.sourceDocNum').d('折扣行结算事务编号'),
      },
      {
        name: 'associatedDiscountedLineTotalAmount',
        type: FieldType.number,
        label: intl.get('ssta.common.model.invoiceApply.associatedDiscountedLineTotalAmount').d('关联被折扣行含税金额汇总'),
        computedProps: { formatterOptions: amountFormatterOptions },
      },
    ],
    transport: {
      read: (): any => {
        return {
          url: `${apiPrefix}/direct-invoice-apply-lines/list`,
          method: 'POST',
          data: {
            applyHeaderId,
            applyLineTypeStr: '1',
          },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/direct-invoice-apply-lines/match/discounted`,
          method: 'PUT',
          data: {
            applyHeaderId,
            applyLineDTOList: data,
          },
        };
      },
    },
  };
};

export const blueLineNumDS = (applyHeaderId, originalApplyLineId): any => {
  return {
    autoCreate: true,
    forceValidate: false,
    autoQuery: true,
    selection: DataSetSelection.single,
    dataToJSON: 'all',
    record: {
      dynamicProps: {
        defaultSelected: (record) => record?.get('applyLineId') === originalApplyLineId,
      },
    },
    fields: [
      {
        name: 'lineNum',
        type: FieldType.string,
        label: intl.get(`ssta.common.model.directPoolSupply.invoiceApplyLineNum`).d('开票申请行号'),
      },
      {
        name: 'sourceDocSettleNum',
        type: FieldType.string,
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.settleNum`).d('结算事务编号'),
      },
      {
        name: 'commodityCode',
        type: FieldType.string,
        label: intl.get(`ssta.directPoolSupply.model.directPoolSupply.taxNum`).d('税收编码'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('ssta.common.model.invoiceApply.projectName').d('货物或应税劳务，服务名称'),
      },
    ],
    transport: {
      read: (): any => {
        return {
          url: `${apiPrefix}/direct-invoice-apply-lines/list`,
          method: 'POST',
          data: {
            applyHeaderId,
            applyLineTypeStr: '1',
          },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${apiPrefix}/direct-invoice-apply-lines/match/discounted`,
          method: 'PUT',
          data: {
            applyHeaderId,
            applyLineDTOList: data,
          },
        };
      },
    },
  };
};
