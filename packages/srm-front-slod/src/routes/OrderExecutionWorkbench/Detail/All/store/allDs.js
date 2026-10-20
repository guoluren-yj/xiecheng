import intl from 'utils/intl';

import {
  BUCKET_NAME,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  TERMINATE_SIGN_DIRECTORY,
  SUPPLIER_DIRECTORY,
  LINE_DIRECTORY,
} from '@/routes/OrderExecutionWorkbench/components/utils/constant';
import { getBigNumberPrecision } from '@/routes/components/utils';
import { getDynamicLabel } from '@/routes/OrderExecutionWorkbench/components/utils';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';

const modelPrompt = 'slod.orderExecution.model.common';
const basicInfo = () => ({
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'versionNum',
      label: intl.get('slod.orderExecution.model.common.versionNum').d('版本号'),
    },
    {
      name: 'poTypeDesc',
      label: intl.get('slod.orderExecution.model.common.poTypeId').d('订单类型'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.quantityTotal').d('总数量'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'creationDate',
      label: intl.get('slod.orderExecution.model.common.creationDate').d('创建日期'),
      type: 'dateTime',
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('slod.orderExecution.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'termsName',
      label: intl.get('slod.orderExecution.model.common.termsId').d('付款条款'),
    },
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
    },
    // 默认隐藏字段
    {
      name: 'domesticCurrencyCode',
      label: intl.get('slod.orderExecution.model.common.domesticCurrencyCode').d('本币币种'),
    },
    {
      name: 'domesticTaxIncludeAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludeAmounts').d('本币金额(含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmounts').d('本币金额(不含税)'),
      // dynamicProps: {
      //   precision: ({ record }) => record.get('domesticFinancialPrecision'),
      // },
    },
    {
      name: 'originalPoNum',
      label: intl.get('slod.orderExecution.model.common.originalPoNum').d('原订单号'),
    },
    {
      name: 'sourceOfTransferOrder',
      label: intl.get('slod.orderExecution.model.common.sourceOfTransferOrder').d('转单来源'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('slod.orderExecution.model.common.sourceBillTypeCode').d('单据来源'),
    },
    {
      name: 'supplierOrderTypeCode',
      label: intl.get('slod.orderExecution.model.common.supplierOrderTypeCode').d('京东e卡-code'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('slod.orderExecution.model.common.electricSignFlag').d('电签标识'),
    },
    {
      name: 'electricSignStatus',
      label: intl.get('slod.orderExecution.model.common.electricSignStatus').d('电签状态'),
    },
    {
      name: 'electricSignOrder',
      label: intl.get('sodr.workspace.model.common.electricSignOrder').d('签署顺序'),
    },
    {
      name: 'electricSignStage',
      label: intl.get('sodr.workspace.model.common.electricSignStage').d('签署阶段'),
    },
    {
      name: 'terminateSignStatus',
      label: intl.get('sodr.common.model.common.terminateSignStatus').d('解约签署状态'),
    },
    {
      name: 'pcNum',
      label: intl.get('sodr.workspace.model.common.orderPcNum').d('订单协议单号'),
    },
    // 附件字段
    {
      name: 'purchaserInnerAttachmentUuid',
      label: intl.get('slod.orderExecution.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('slod.orderExecution.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('slod.orderExecution.model.common.supplierAttachmentId').d('供应商附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: SUPPLIER_DIRECTORY,
    },
    {
      name: 'terminateSignUuid',
      type: 'attachment',
      label: intl.get('sodr.common.model.common.terminateSignUuid').d('解约附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: TERMINATE_SIGN_DIRECTORY,
    },
  ],
  queryParameter: {
    camp: 2,
    customizeUnitCode: [
      'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.BASICINFO',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.BILLINGINFO',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.ORGANIZATIONINFO',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.RECEIPTINFO',
      'SINV.ORDER_EXECUTION_ALL_DETAIL.PAYMENTTERMINFO',
    ].toString(),
  },
});

const organizationInfo = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.company').d('公司'),
    },
    {
      name: 'supplierName',
      label: intl.get('slod.orderExecution.model.common.supplier').d('供应商'),
    },
    {
      name: 'ouName',
      label: intl.get('slod.orderExecution.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('slod.orderExecution.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('slod.orderExecution.model.common.agentId').d('采购员'),
    },
    // 默认隐藏字段
    {
      name: 'settleCompanyName',
      label: intl.get(`sodr.common.model.common.settleCompanyName`).d('结算公司'), // H
    },
    {
      name: 'settleSupplierName',
      label: intl.get('slod.orderExecution.model.common.settleSupplierId').d('结算供应商'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get(`slod.orderExecution.model.common.supplierSiteName`).d('供应商地点'),
    },
  ],
});

const detailInfo = () => ({
  dataToJSON: 'all',
  selection: false,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'poLineLocationId',
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('slod.orderExecution.model.common.displayStatusCode').d('状态'),
    },
    {
      name: 'displayLineNum',
      label: intl.get('slod.orderExecution.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('slod.orderExecution.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'domesticUnitPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.domesticUnitPrice').d('本币单价(不含税)'),
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl
        .get('slod.orderExecution.model.common.domesticTaxIncludedPrice')
        .d('本币单价(含税)'),
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl
        .get('slod.orderExecution.model.common.domesticLineAmount')
        .d('本币行金额(不含税)'),
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      label: intl
        .get('slod.orderExecution.model.common.domesticTaxIncludedLineAmount')
        .d('本币行金额(含税)'),
      max: MAX_BIGNUMBER_NUMBER,
    },
    {
      name: 'itemCode',
      label: intl.get('slod.orderExecution.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('slod.orderExecution.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('slod.orderExecution.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      dynamicProps: {
        precision: ({ record }) => getBigNumberPrecision(record.get('secondaryUomPrecision')),
      },
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('slod.orderExecution.model.common.uomId').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
        precision: ({ record }) => getBigNumberPrecision(record.get('uomPrecision')),
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'needByDate',
      label: intl.get('slod.orderExecution.model.common.needByDate').d('需求日期'),
      type: 'date',
    },
    {
      name: 'promiseDeliveryDate',
      label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
      type: 'date',
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('defaultPrecision'),
      // },
    },
    {
      name: 'lineAmount',
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('defaultPrecision'),
      // },
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      // dynamicProps: {
      //   precision: ({ record }) => record.get('financialPrecision'),
      // },
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.taxId').d('税率'),
      max: MAX_BIGNUMBER_NUMBER,
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('slod.orderExecution.model.common.unitPriceBatch').d('每'),
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'categoryName',
      label: intl.get('slod.orderExecution.model.common.categoryId').d('物料分类'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('slod.orderExecution.model.common.invOrganizationId').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('slod.orderExecution.model.common.invInventoryId').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('slod.orderExecution.model.common.invLocationId').d('收货库位'),
    },
    {
      name: 'consignedFlag',
      label: intl.get('slod.orderExecution.model.common.consignedFlag').d('是否寄售'),
    },
    {
      name: 'returnedFlag',
      label: intl.get('slod.orderExecution.model.common.returnedFlag').d('是否退回'),
    },
    {
      name: 'freeFlag',
      label: intl.get('slod.orderExecution.model.common.freeFlag').d('是否免费'),
    },
    {
      name: 'bom',
      label: intl.get('slod.orderExecution.model.common.bom').d('外协BOM'),
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
      label: intl.get('slod.orderExecution.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'productNum',
      label: intl.get('slod.orderExecution.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      label: intl.get('slod.orderExecution.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName',
      label: intl.get('slod.orderExecution.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('slod.orderExecution.model.common.receivingAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyContact').d('联系人信息'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('slod.orderExecution.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'departmentName',
      label: intl.get('slod.orderExecution.model.common.departmentId').d('部门'),
    },
    {
      name: 'costName',
      label: intl.get('slod.orderExecution.model.common.costId').d('成本中心'),
    },
    {
      name: 'projectCategory',
      label: intl.get('slod.orderExecution.model.common.projectCategory').d('项目类别'),
    },
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('slod.orderExecution.model.common.lineAttachmentUuid').d('行附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: LINE_DIRECTORY,
    },
    // 隐藏字段
    {
      name: 'productBrand',
      label: intl.get(`${modelPrompt}.productBrand`).d('品牌'),
    },
    {
      name: 'productModel',
      label: intl.get(`${modelPrompt}.productModel`).d('规格'),
    },
    {
      name: 'packingList',
      label: intl.get(`${modelPrompt}.packingList`).d('型号'),
    },
    {
      name: 'purchaseLineTypeId',
      label: intl.get(`slod.orderExecution.model.common.purchaseLineTypes`).d('采购行类型'),
      lookupCode: 'SODR.PO_LINE_TYPE',
    },
    // 增加定制品属性和商品属性相关字段，默认不显示
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
      label: intl.get('sodr.workspace.model.common.customQuantity').d('定制数量'),
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
      name: 'checkContectDoc',
      label: intl.get(`sodr.workspace.model.common.checkContectDoc`).d('执行单据'),
    },
  ],
  queryParameter: {
    camp: 2,
    sortType: 5,
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_ALL_DETAIL.DETAILINFO,SINV.ORDER_EXECUTION_ALL_DETAIL.DETAILINFO_FILTER',
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, {
          status: 'update',
        });
      });
    },
  },
});

const receiptInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'shipToLocationAddress',
      label: intl.get('slod.orderExecution.model.common.shipToLocationAddress').d('收货方地址'),
    },
    {
      name: 'shipToLocContName',
      label: intl.get('slod.orderExecution.model.common.shipToLocContName').d('收货方联系人'),
    },
    {
      name: 'shipToLocTelNum',
      label: intl.get('slod.orderExecution.model.common.shipToLocTelNum').d('收货联系电话'),
    },
    {
      name: 'billToLocationAddress',
      label: intl.get('slod.orderExecution.model.common.billToLocationAddress').d('收单方地址'),
    },
    {
      name: 'billToLocContName',
      label: intl.get('slod.orderExecution.model.common.billToLocContName').d('收单方联系人'),
    },
    {
      name: 'billToLocTelNum',
      label: intl.get('slod.orderExecution.model.common.billToLocTelNum').d('收单联系电话'),
    },
    {
      name: 'receiverEmailAddress',
      label: intl.get('slod.orderExecution.model.common.receiverEmailAddress').d('收单邮箱'),
    },
  ],
});

const billingInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'taxRegisterAddress',
      label: intl.get('slod.orderExecution.model.common.taxRegisterAddress').d('税务登记地址'),
    },
    {
      name: 'taxRegisterNum',
      label: intl.get('slod.orderExecution.model.common.taxRegisterNum').d('税号'),
    },
    {
      name: 'taxRegisterBank',
      label: intl.get('slod.orderExecution.model.common.taxRegisterBank').d('开户行'),
    },
    {
      name: 'taxRegisterBankAccount',
      label: intl.get('slod.orderExecution.model.common.taxRegisterBankAccount').d('开户行账号'),
    },
    {
      name: 'invoiceTitle',
      label: intl.get('slod.orderExecution.model.common.invoiceTitle').d('开票公司名称'),
    },
    {
      name: 'taxRegisterTel',
      label: intl.get('slod.orderExecution.model.common.taxRegisterTel').d('税务登记电话'),
    },
    {
      name: 'invoiceTitleTypeName',
      label: intl.get('slod.orderExecution.model.common.invoiceTitleTypeName').d('发票类型'),
    },
    {
      name: 'invoiceMethodName',
      label: intl.get('slod.orderExecution.model.common.invoiceMethodName').d('开票方式'),
    },
    {
      name: 'invoiceTypeName',
      label: intl.get('slod.orderExecution.model.common.invoiceTypeName').d('发票形式'),
    },
    {
      name: 'invoiceDetailTypeName',
      label: intl.get('slod.orderExecution.model.common.invoiceDetailTypeName').d('发票明细'),
    },
  ],
});

const supplementaryInfo = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
      defaultValue: '0',
    },
  ],
});

const filterLine = ({ detailInfoDs }) => ({
  fields: [
    {
      name: 'lineDisplay',
      lookupCode: 'SPUC.SUPPLIER_CONFIRM.ALL.FILTERLINE',
      defaultValue: '1',
    },
  ],
  events: {
    update: ({ name, value }) => {
      if (name === 'lineDisplay') {
        detailInfoDs.setQueryParameter(name, value);
        detailInfoDs.query();
      }
    },
  },
});

export {
  basicInfo,
  organizationInfo,
  detailInfo,
  receiptInfo,
  billingInfo,
  supplementaryInfo,
  filterLine,
};
