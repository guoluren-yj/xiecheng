import intl from 'utils/intl';
import { getDynamicLabel } from '@/routes/components/utils';
import { BUCKET_NAME, LINE_DIRECTORY, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';

const modelCommonPrompt = 'sodr.common.model.common';

// 明细行
const detailInfo = () => ({
  dataToJSON: 'all',
  pageSize: 20,
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
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('secondaryUomPrecision'),
      },
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        precision: ({ record }) => record.get('uomPrecision'),
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
      type: 'number',
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
      name: 'exemptInspectionFlag',
      label: intl.get('sodr.workspace.model.common.exemptInspectionFlag').d('是否免检'),
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
      name: 'productBrand',
      label: intl.get(`${modelCommonPrompt}.productBrand`).d('商品品牌'),
    },
    {
      name: 'productModel',
      label: intl.get(`${modelCommonPrompt}.productModel`).d('商品规格'),
    },
    {
      name: 'packingList',
      label: intl.get(`${modelCommonPrompt}.packingList`).d('商品型号'),
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
      name: 'purchaseLineTypeId',
      label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
      lookupCode: 'SODR.PO_LINE_TYPE',
    },
    {
      name: 'budgetAccountName',
      label: intl.get('sodr.workspace.model.common.budgetAccountId').d('预算科目'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
    },
    {
      name: 'costInformation',
      label: intl.get('sodr.workspace.model.costInformation.costInformation').d('费用信息'),
    },
    {
      name: 'fundLineTermId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
    },
  ],
  queryParameter: {
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode:
      'SODR.WORKSPACE_CANCEL_DETAIL.DETAILINFO,SODR.WORKSPACE_CANCEL_DETAIL.DETAILINFO_FILTER',
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        const basicInfoDs = dataSet.getState('basicInfoDs')?.current;
        const { domesticDefaultPrecision, domesticFinancialPrecision } = basicInfoDs?.get([
          'domesticDefaultPrecision',
          'domesticFinancialPrecision',
        ]);
        const {
          domesticDefaultPrecision: precision,
          domesticFinancialPrecision: financial,
        } = i.get(['domesticDefaultPrecision', 'domesticFinancialPrecision']);
        i.init({
          domesticDefaultPrecision: domesticDefaultPrecision || precision,
          domesticFinancialPrecision: domesticFinancialPrecision || financial,
        });
      });
    },
  },
});

export { detailInfo };
