import intl from 'utils/intl';
import { queryBatchApprovaFlag } from '_utils/utils';

import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
  LINE_DIRECTORY,
} from '@/routes/components/utils/constant';
import { getBatchOperationFlag } from '@/routes/components/utils';

const basicInfo = () => ({
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('sodr.workspace.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'versionNum',
      label: intl.get('sodr.workspace.model.common.versionNum').d('版本号'),
    },
    {
      name: 'poTypeDesc',
      label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'paymentPlanNum',
      label: intl.get('sodr.workspace.model.common.newPaymentPlanNum').d('付款计划编号'),
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.quantityTotal').d('总数量'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'creationDate',
      label: intl.get('sodr.workspace.model.common.creationDate').d('创建日期'),
      type: 'dateTime',
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'termsName',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
    // 默认隐藏字段
    {
      name: 'domesticCurrencyCode',
      label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'),
    },
    {
      name: 'domesticTaxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludeAmounts').d('本币金额(含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmounts').d('本币金额(不含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'originalPoNum',
      label: intl.get('sodr.workspace.model.common.originalPoNum').d('原订单号'),
    },
    {
      name: 'sourceOfTransferOrder',
      label: intl.get('sodr.workspace.model.common.sourceOfTransferOrder').d('转单来源'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('单据来源'),
    },
    {
      name: 'supplierOrderTypeCode',
      label: intl.get('sodr.workspace.model.common.supplierOrderTypeCode').d('京东e卡-code'),
    },

    // 附件字段
    {
      name: 'purchaserInnerAttachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('sodr.workspace.model.common.supplierAttachmentId').d('供应商附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: SUPPLIER_DIRECTORY,
    },
    {
      name: 'createdUnitName',
      label: intl.get('sodr.workspace.model.common.createdUnitName').d('创建人部门'),
    },
    {
      name: 'pcHeaderIdLov',
      label: intl.get(`sodr.workspace.model.common.pcSubjectId`).d('关联采购协议'),
    },
  ],
  queryParameter: {
    camp: 1,
    poEntryPoint: 'PURCHASE_APPROVAL_DETAIL',
    customizeUnitCode: [
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BASICINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.RECEIPTINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.BILLINGINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.PAYMENTTERMINFO',
    ].toString(),
  },
  events: {
    async load({ dataSet }) {
      const workFlowBussinessKey = dataSet.current.get('workFlowBusinessKey');
      if (workFlowBussinessKey) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag([workFlowBussinessKey]);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag([workFlowBussinessKey]);
        dataSet.setState({ approvaFlags, operationFlags });
      }
    },
  },
});

const organizationInfo = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    // 默认隐藏字段
    {
      name: 'settleCompanyName',
      label: intl.get(`sodr.common.model.common.settleCompanyName`).d('结算公司'), // H
    },
    {
      name: 'settleSupplierName',
      label: intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get(`sodr.common.model.common.supplierSiteName`).d('供应商地点'),
    },
    {
      name: 'supplierContactName',
      label: intl.get('sodr.workspace.model.common.supplierContactName').d('供应商联系人名称'),
    },
    {
      name: 'supplierContactTelNum',
      label: intl.get('sodr.workspace.model.common.supplierContactTelNum').d('供应商联系人电话'),
    },
  ],
});
// 基础信息
const detailInfo = () => ({
  dataToJSON: 'all',
  selection: false,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('sodr.workspace.model.common.displayStatusCode').d('状态'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'quantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('uomPrecision'),
      },
    },
    {
      name: 'uomCodeAndName',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
    },
    {
      name: 'needByDate',
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      type: 'date',
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'lineAmount',
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'taxRate',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'promiseDeliveryDate',
      label: intl.get('sodr.workspace.model.common.promiseDeliveryDate').d('承诺交货日期'),
      type: 'date',
    },
    {
      name: 'categoryName',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('sodr.workspace.model.common.invLocationId').d('收货库位'),
    },
    {
      name: 'departmentName',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
    },
    {
      name: 'costName',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
    },
    {
      name: 'accountSubjectName',
      label: intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目'),
    },
    {
      name: 'wbs',
      label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.lineAttachmentUuid').d('行附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: LINE_DIRECTORY,
    },
    // {
    //   name: 'lastPurchasePrice',
    //   label: intl.get('sodr.workspace.model.common.lastPurchasePrice').d('最近一次采购价'),
    //   type: 'number',
    // },
    {
      name: 'domesticUnitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticUnitPrices').d('本币单价(不含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticLineAmounts').d('本币金额(不含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludedPrices').d('本币单价(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl
        .get('sodr.workspace.model.common.domesticTaxIncludedLineAmounts')
        .d('本币金额(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs').current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'exchangeRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.rate').d('汇率'),
    },
  ],
  queryParameter: {
    // poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.DETAILINFO',
  },
});

const otherInfo = () => ({
  selection: false,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('sodr.workspace.model.common.displayStatusCode').d('状态'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'consignedFlag',
      label: intl.get('sodr.workspace.model.common.consignedFlag').d('是否寄售'),
    },
    {
      name: 'returnedFlag',
      label: intl.get('sodr.workspace.model.common.returnedFlag').d('是否退回'),
    },
    {
      name: 'freeFlag',
      label: intl.get('sodr.workspace.model.common.freeFlag').d('是否免费'),
    },
    {
      name: 'bom',
      label: intl.get('sodr.workspace.model.common.bom').d('外协BOM'),
    },
    {
      name: 'displayPrNumAndDisplayPrLineNum',
      label: intl.get('sodr.workspace.model.common.prNumAndPrLineNums').d('采购申请号-行号'),
    },
    {
      name: 'sourceNumAndLine',
      label: intl.get('sodr.workspace.model.common.sourceNumAndLines').d('寻源单号-行号'),
    },
    {
      name: 'contractNum',
      label: intl.get('sodr.workspace.model.common.contractNums').d('采购协议号-行号'),
    },
    {
      name: 'prRequestedName',
      label: intl.get('sodr.workspace.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'productNum',
      label: intl.get('sodr.workspace.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      label: intl.get('sodr.workspace.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName',
      label: intl.get('sodr.workspace.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'brand',
      label: intl.get('sodr.workspace.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
    },
    {
      name: 'skuType',
      label: intl.get('sodr.workspace.model.common.skuType').d('定制品标识'),
    },
    {
      name: 'customUomName',
      label: intl.get('sodr.workspace.model.common.customUomName').d('定制单位'),
    },
    {
      name: 'customQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.skuType').d('定制数量'),
    },
    {
      name: 'packageQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.packageQuantity').d('份数'),
    },
    {
      name: 'customSpecsJson',
      label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'customSpecs',
      label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'productSpecsJson',
      label: intl.get('sodr.workspace.model.common.productSpecsJson').d('商品属性'),
    },
    {
      name: 'productSpecs',
      label: intl.get('sodr.workspace.model.common.productSpecsJson').d('商品属性'),
    },
    {
      name: 'priceSource',
      label: intl.get('sodr.workspace.model.common.priceSource').d('价格来源'),
    },
    {
      name: 'priceSourceNum',
      label: intl.get('sodr.workspace.model.common.priceSourceNum').d('价格来源单据号'),
    },
    {
      name: 'priceSourceLineNum',
      label: intl.get('sodr.workspace.model.common.priceSourceLineNum').d('价格来源单据行号'),
    },
    {
      name: 'accountAssignTypeCode',
      label: intl.get('sodr.workspace.model.common.accountAssignTypeCode').d('账户分配类别'),
    },
    {
      name: 'receiveToleranceQuantity',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantity').d('接收允差（%）'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
    },
    {
      name: 'budgetAccountName',
      label: intl.get('sodr.workspace.model.common.budgetAccountId').d('预算科目'),
    },
    // {
    //   name: 'invOrganizationName',
    //   label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
    // },
    // {
    //   name: 'categoryName',
    //   label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
    // },
    // {
    //   name: 'immedShippedFlag',
    //   label: intl.get('sodr.workspace.model.common.immedShippedFlag').d('是否直发'),
    // },
    // {
    //   name: 'shipToThirdPartyName',
    //   label: intl.get('sodr.workspace.model.common.shipToThirdPartyName').d('送达方'),
    // },
    // {
    //   name: 'priceUomName',
    //   label: intl.get('sodr.workspace.model.common.priceUomName').d('订单价格单位'),
    // },
    // {
    //   name: 'priceUomConversion',
    //   label: intl.get('sodr.workspace.model.common.priceUomConversion').d('单位转换关系'),
    // },
  ],
});

const partner = () => ({
  selection: false,
  fields: [
    {
      name: 'partnerType',
      label: intl.get('sodr.workspace.model.common.partnerType').d('合作类型'),
    },
    {
      name: 'partnerNum',
      label: intl.get('sodr.workspace.model.common.partnerNum').d('合作方编码'),
    },
    {
      name: 'partnerName',
      label: intl.get('sodr.workspace.model.common.partnerName').d('合作方名称'),
    },
    {
      name: 'externalSystemCode',
      label: intl.get('sodr.workspace.model.common.externalSystemCode').d('来源系统'),
    },
  ],
  queryParameter: {
    customizeUnitCode: 'SODR.WORKSPACE_ORDERAPPROVAL_DETAIL.PARTNER',
  },
});

// 审批意见
const approvalComments = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'approvedRemark',
      label: intl.get('sodr.workspace.model.common.approvedRemark').d('审批意见'),
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('type') === 'rejected',
      },
    },
  ],
});

const receiptInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'shipToLocationAddress',
      label: intl.get('sodr.workspace.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'shipToLocContName',
      label: intl.get('sodr.workspace.model.common.shipToLocContName').d('收货方联系人'),
    },
    {
      name: 'shipToLocTelNum',
      label: intl.get('sodr.workspace.model.common.shipToLocTelNum').d('收货联系电话'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('sodr.workspace.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'billToLocContName',
      label: intl.get('sodr.workspace.model.common.billToLocContName').d('收单方联系人'),
    },
    {
      name: 'billToLocTelNum',
      label: intl.get('sodr.workspace.model.common.billToLocTelNum').d('收单联系电话'),
    },
    {
      name: 'receiverEmailAddress',
      label: intl.get('sodr.workspace.model.common.receiverEmailAddress').d('收单邮箱'),
    },
  ],
});

const billingInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'taxRegisterAddress',
      label: intl.get('sodr.workspace.model.common.taxRegisterAddress').d('税务登记地址'),
    },
    {
      name: 'taxRegisterNum',
      label: intl.get('sodr.workspace.model.common.taxRegisterNum').d('税号'),
    },
    {
      name: 'taxRegisterBank',
      label: intl.get('sodr.workspace.model.common.taxRegisterBank').d('开户行'),
    },
    {
      name: 'taxRegisterBankAccount',
      type: 'secret',
      label: intl.get('sodr.workspace.model.common.taxRegisterBankAccount').d('开户行账号'),
    },
    {
      name: 'invoiceTitle',
      label: intl.get('sodr.workspace.model.common.invoiceTitle').d('开票公司名称'),
    },
    {
      name: 'taxRegisterTel',
      label: intl.get('sodr.workspace.model.common.taxRegisterTel').d('税务登记电话'),
    },
    {
      name: 'invoiceTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceTitleTypeName').d('发票类型'),
    },
    {
      name: 'invoiceMethodName',
      label: intl.get('sodr.workspace.model.common.invoiceMethodName').d('开票方式'),
    },
    {
      name: 'invoiceTitleTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceTypeName').d('发票形式'),
    },
    {
      name: 'invoiceDetailTypeName',
      label: intl.get('sodr.workspace.model.common.invoiceDetailTypeName').d('发票明细'),
    },
  ],
});

export {
  basicInfo,
  organizationInfo,
  detailInfo,
  otherInfo,
  partner,
  approvalComments,
  receiptInfo,
  billingInfo,
};
