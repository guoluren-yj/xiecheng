/**
 * 协议工作台-引用单据创建ds
 */
// import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import { getDynamicLabel } from '@/utils/util';
import notification from 'utils/notification';

import { isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

// 引用采购订单
const purchaseOrder = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'poLineId',
  modifiedCheck: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`hzero.common.status`).d('状态'),
      name: 'displayStatusMeaning',
    },
    {
      label: intl.get('ssta.purchaseSettle.common.poNums').d('采购订单编号-行号'),
      name: 'displayPoNum',
    },
    {
      label: intl.get(`entity.supplier.code`).d('供应商编码'),
      name: 'supplierCode',
    },
    {
      label: intl.get(`entity.supplier.name`).d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.version`).d('版本'),
      name: 'versionNum',
    },
    {
      label: intl.get('spcm.common.model.common.termId').d('付款条款'),
      name: 'termsName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.releaseNum`).d('发放号'),
      name: 'releaseNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
      name: 'displayLineLocationNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
      name: 'categoryId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.oldItemCodeNum`).d('旧物料号'),
      name: 'oldItemCode',
    },
    {
      // label: intl.get(`sodr.sendOrder.model.common.quantity`).d('数量'),
      name: 'quantity',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.netReceivedQuantity`).d('净接收'),
      name: 'netReceivedQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.netDeliverQuantity`).d('净入库'),
      name: 'netDeliverQuantity',
    },
    {
      label: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
      name: 'notDeliverQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.invoicedQuantity`).d('已开票'),
      name: 'invoicedQuantity',
    },
    {
      // label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'unitPrice'),
      },
      name: 'unitPrice',
      align: 'right',
    },
    {
      // label: intl.get(`spcm.common.model.common.enteredTaxIncludedPrice2`).d('原币单价(含税)'),
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
      },
      name: 'enteredTaxIncludedPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      name: 'secondaryUnitPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.common.lineAmount`).d('行金额(不含税)'),
      name: 'lineAmount',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.common.taxIncludedLineAmount2`).d('行金额(含税)'),
      name: 'taxIncludedLineAmount',
      align: 'right',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
    },
    {
      // label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'uomId',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
      name: 'taxCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
      name: 'needByDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
      name: 'promiseDeliveryDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.specifications`).d('规格'),
      name: 'specifications',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.modelNum`).d('型号'),
      name: 'model',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.manufacturerName`).d('制造商'),
      name: 'manufacturerName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.brand`).d('品牌'),
      name: 'brand',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.erpStatus`).d('ERP状态'),
      name: 'erpStatus',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.frozenStatus`).d('是否冻结'),
      name: 'frozenFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.consignedFlag`).d('是否寄售'),
      name: 'consignedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.projectCategory`).d('是否委外'),
      name: 'projectCategory',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.returnedFlag`).d('是否退回'),
      name: 'returnedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.freeFlag`).d('是否免费'),
      name: 'freeFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.immedShippedFlag`).d('是否直发'),
      name: 'isImmedShippedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.purchaserRemark`).d('采购方行备注'),
      name: 'remark',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.feedbackInfo`).d('反馈信息'),
      name: 'feedback',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.shipToThirdPartyName`).d('送达方'),
      name: 'shipToThirdPartyName',
    },
    {
      label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('地点'),
      name: 'shipToThirdPartyAddress',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.contactPersonInfo`).d('联系人信息'),
      name: 'shipToThirdPartyContact',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.supplierSite`).d('供应商地点'),
      name: 'supplierSiteId',
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouId',
    },
    {
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      name: 'purchaseOrgId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
      name: 'purchaseAgentId',
    },
    {
      label: intl.get(`entity.organization.class.receiving`).d('收货组织'),
      name: 'invOrganizationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.inventoryName`).d('收货库房'),
      name: 'inventoryId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.locationName`).d('收货库位'),
      name: 'invLocationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.billToLocationName`).d('收单方'),
      name: 'billToLocationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
      name: 'erpCreationDate',
    },
    {
      label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
      name: 'erpCreatedName',
    },
    {
      label: intl.get(`sodr.common.model.common.department`).d('部门'),
      name: 'departmentId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.releaseTime`).d('发布时间'),
      name: 'releasedDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.confirmedDate`).d('确认日期'),
      name: 'confirmedDate',
    },
    {
      label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
      name: 'urgentFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.urgentTime`).d('加急时间'),
      name: 'urgentDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.contractNum`).d('合同编号'),
      name: 'erpContractNum',
    },
    {
      label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
      name: 'displayPrNum',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    // {
    //   label: intl.get(`sodr.sendOrder.model.common.purchaseReqLineNum`).d('采购申请行号'),
    //   name: 'displayPrLineNum',
    // },
    {
      label: intl.get(`sodr.sendOrder.model.common.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.commodityDirectory`).d('商品目录'),
      name: 'catalogName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
      name: 'poSourcePlatform',
    },
  ],
  queryParameter: {
    workbenchFlag: '1',
    customizeUnitCode:
      'SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER.FILTER,SPCM.WORKSPACE_DOCUMENT.PURCHASEORDER',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchaser/poLine`,
        method: 'GET',
      };
    },
  },
  events: {},
});

// 引用寻源结果
const sourcingResults = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  primaryKey: 'resultId',
  pageSize: 20,
  fields: [
    {
      label: intl.get(`sodr.workspace.model.common.sourceNumAndLines`).d('寻源单号-行号'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
      name: 'itemNum',
    },
    {
      label: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
      name: 'companyNum',
    },
    {
      label: intl.get(`spcm.common.model.common.supplierCompanyName2`).d('企业名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('spcm.common.model.common.termId').d('付款条款'),
      name: 'termsName',
    },
    {
      label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
      name: 'organizationName',
    },
    {
      label: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
      name: 'categoryName',
    },
    {
      label: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
      name: 'currencyCode',
    },
    {
      // label: intl.get(`spcm.common.model.common.base.unit`).d('单位'),
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      // label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'quantity',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
      name: 'occupationQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
      name: 'availableQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
      name: 'taxRate',
    },
    {
      // label: intl.get(`spcm.common.model.common.noTaxPrice2`).d('单价(不含税)'),
      name: 'unitPrice',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'unitPrice'),
      },
    },
    {
      label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      name: 'secondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.noTaxAmount2`).d('金额(不含税)'),
      name: 'amountExcludingTax',
    },
    {
      // label: intl.get(`spcm.common.model.common.TaxPrice2`).d('单价(含税)'),
      name: 'taxIncludedUnitPrice',
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
      },
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.TaxAmount2`).d('金额(含税)'),
      name: 'taxAmount',
    },
    {
      label: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
      name: 'validPromisedDate',
    },
    {
      label: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
        .d('适用其他组织'),
      name: 'sourceAppScopeLineDTOs',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
      name: 'purchaseOrganizatioName',
    },
    // {
    //   label: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
    //   name: 'purchaseAgentName',
    //   width: 100,
    // },
    {
      label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
      name: 'realName',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
      name: 'prLineNum',
    },
    {
      label: intl.get(`spcm.common.model.common.displayPrNumLineNum`).d('采购申请展示单号-行号'),
      name: 'prDisplayLineNum',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    {
      label: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
      name: 'rfxRoleMan',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'itemRemark',
    },
    {
      label: intl.get(`spcm.contractMaintain.model.sourceItemRemark`).d('物料说明'),
      name: 'sourceItemRemark',
    },
    {
      label: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
      name: 'contractPendingFlag',
    },
    {
      label: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
      name: 'resultStatus',
    },
    {
      label: intl.get('spcm.common.model.common.occupyStatus').d('占用状态'),
      name: 'occupyStatus',
      lookupCode: 'SPCM.SOURCE_RESULT_OCCUPY_STATUS',
    },
  ],
  queryParameter: {
    tenantId: getCurrentOrganizationId(),
    workbenchFlag: '1',
    customizeUnitCode:
      'SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS.FILTER,SPCM.WORKSPACE_DOCUMENT.SOURCERESULTS',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/source-results`,
        method: 'GET',
      };
    },
  },
  events: {},
});

// 引用采购申请
const purchaseNeed = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  cacheModified: true, // 缓存修改过的数据
  modifiedCheck: false,
  primaryKey: 'prLineId',
  pageSize: 20,
  fields: [
    {
      label: intl.get(`spcm.common.model.common.prNumAndLine`).d('采购申请编号-行号'),
      name: 'prNum',
    },
    {
      label: intl.get(`spcm.common.model.lineNum`).d('行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`spcm.common.model.common.transferredDocumentType`).d('协议执行类型'),
      name: 'transferredDocumentTypeVOList',
    },
    {
      label: intl.get(`spcm.common.model.common.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'orderSupplierLov',
      label: intl.get('sodr.workspace.model.common.recommendedSupplier').d('推荐供应商'),
      type: 'object',
      lovCode: 'SODR.PR_SUGGEST_SUPPLIER',
      ignore: 'always',
      dynamicProps: {
        lovPara({ record }) {
          return {
            itemId: record.get('itemId'),
            companyId: record.get('companyId'),
            ouId: record.get('ouId'),
            priceSortFlag: 1,
            purchaseOrgId: record.get('purchaseOrgId'),
            invOrganizationId: record.get('invOrganizationId'),
            uomId: record.get('uomId'),
            prLineId: record.get('prLineId'),
            orderTypeId: record.get('orderTypeId'),
            orderTypeCode: record.get('orderTypeCode'),
            categoryId: record.get('categoryId'),
          };
        },
      },
    },
    {
      name: 'selectSupplierCompanyId',
      bind: 'orderSupplierLov.supplierCompanyId',
    },
    {
      name: 'selectSupplierCode',
      bind: 'orderSupplierLov.supplierCompanyNum',
    },
    {
      name: 'selectSupplierCompanyName',
      bind: 'orderSupplierLov.supplierCompanyName',
    },
    {
      name: 'selectSupplierTenantId',
      bind: 'orderSupplierLov.supplierTenantId',
    },
    {
      name: 'selectSupplierCompanyName',
      bind: 'orderSupplierLov.supplierCompanyName',
    },
    {
      name: 'selectLocalSupplierId',
      bind: 'orderSupplierLov.supplierId',
    },
    {
      name: 'selectLocalSupplierName',
      bind: 'orderSupplierLov.supplierName',
    },
    {
      name: 'priceLibraryId',
      bind: 'orderSupplierLov.priceLibraryId',
    },
    {
      name: 'priceLibId',
      bind: 'orderSupplierLov.priceLibId',
    },
    {
      name: 'selectDisplaySupplierCompanyName',
      ignore: 'always',
      bind: 'orderSupplierLov.displaySupplierCompanyName',
    },
    {
      label: intl.get(`spcm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryName',
    },
    {
      // label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
      },
      name: 'taxIncludedUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.taxType`).d('税种'),
      name: 'taxCode',
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
      name: 'taxRate',
    },
    {
      label: intl.get(`spcm.common.model.common.currencyCode`).d('原币币种'),
      name: 'currencyCode',
    },
    {
      // label: intl.get(`spcm.common.model.common.base.unit`).d('单位'),
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      // label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'quantity',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.availableQuantity`).d('可用数量'),
      name: 'availableQuantity',
    },
    {
      label: intl.get(`spcm.common.model.executionStatusCode`).d('执行状态'),
      name: 'executionStatusCodeMeaning',
    },
    {
      label: intl.get(`spcm.common.model.reqTypeCode`).d('申请类型'),
      name: 'reqTypeCode',
    },
    {
      label: intl.get(`spcm.common.model.supplierCode`).d('供应商编码'),
      name: 'supplierCode',
    },
    {
      label: intl.get(`spcm.common.model.supplierName`).d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get(`spcm.common.model.companyName`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgName`).d('采购组织'),
      name: 'purchaseOrgName',
    },
    {
      label: intl.get(`spcm.common.model.purchaseOrgGroupName`).d('采购员'),
      name: 'agentName',
    },
    {
      label: intl.get(`spcm.common.model.invOrganizationName`).d('库存组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`spcm.common.model.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`spcm.common.model.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`spcm.common.model.catalogName`).d('商品目录'),
      name: 'catalogName',
    },
    {
      label: intl.get(`spcm.common.model.prRequestedName`).d('申请人'),
      name: 'prRequestedName',
    },
    {
      label: intl.get(`spcm.common.model.common.telNum`).d('联系电话'),
      name: 'contactTelNum',
    },
    {
      label: intl.get(`spcm.common.model.invoiceAddress`).d('收货方地址'),
      name: 'invoiceAddress',
    },
    {
      label: intl.get(`spcm.common.model.neededDate`).d('需求日期'),
      name: 'neededDate',
    },
    {
      label: intl.get(`spcm.common.model.companyOrgName`).d('公司组织'),
      name: 'companyOrgName',
    },
    {
      label: intl.get(`spcm.common.model.costAnchDepDesc`).d('费用挂靠部门'),
      name: 'costAnchDepDesc',
    },
    {
      label: intl.get(`spcm.common.model.expBearDep`).d('费用承担部门'),
      name: 'expBearDep',
    },
    {
      label: intl.get(`spcm.common.model.location`).d('地点'),
      name: 'addressMeaning',
    },
    {
      label: intl.get(`spcm.common.model.projectCode`).d('项目编码'),
      name: 'projectNum',
    },
    {
      label: intl.get(`spcm.common.model.projectName`).d('项目名称'),
      name: 'projectName',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    {
      label: intl.get(`spcm.common.model.prSourcePlatformMeaning`).d('来源平台'),
      name: 'prSourcePlatformMeaning',
    },
    // {
    //   label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
    //   name: 'urgentFlag',
    // },
    {
      label: intl.get(`spcm.common.model.urgentDate`).d('加急时间'),
      name: 'urgentDate',
    },
    {
      label: intl.get('spcm.common.model.executorName').d('需求执行人'),
      name: 'executorName',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
  ],
  queryParameter: {
    workbenchFlag: '1',
    erpControlFlag: 1,
    assignFlag: 1, // 是否为已分配的单据
    customizeUnitCode:
      'SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2.FILTER,SPCM.WORKSPACE_DOCUMENT.PURCHASENEED2',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/prLine/page`,
        method: 'GET',
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) => {
        i.init({
          selectDisplaySupplierCompanyName: isNil(i.get('selectSupplierCompanyName'))
            ? i.get('selectLocalSupplierName')
            : i.get('selectSupplierCompanyName'),
        });
      });
    },
    update: ({ name, value, record, dataSet }) => {
      if (name === 'orderSupplierLov') {
        const {
          uomId,
          uomCode,
          uomName,
          uomPrecision,
          uomCodeAndName,
          currencyCode,
          taxId,
          taxRate,
          // netPrice,
          // unitPrice,
          priceLibId,
          priceLibraryStatus,
          // priceLibraryId,
          taxIncludedPrice,
          unitPrice,
          enteredTaxIncludedPrice,
          unitPriceBatch,
          // holdPcHeaderId,
          // holdPcLineId,
          // contractNum,
          // benchmarkPriceType,
          // ladderPriceLibId,
          // ladderQuotationFlag,
          supplierId,
          supplierName,
          supplierNum,
          // supplierCompanyId,
        } = value || {};
        // record.set({ noUnitPrice: unitPrice });
        if (value) {
          const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
          if ([0, 1, 2].includes(doubleUnitEnabled)) {
            const sodrEnabled = doubleUnitEnabled !== 0;
            if (uomId && sodrEnabled && record.getPristineValue('uomId') !== uomId) {
              notification.error({
                message: intl
                  .get(`spcm.common.view.message.validatePriceUomId`)
                  .d(
                    `自动带出价格失败，失败原因：该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作`
                  ),
              });
              record.reset();
              return;
              // record.getField('priceLibraryId').reset();
            }
            if (!sodrEnabled) {
              record.set({
                secondaryUomId: uomId,
                secondaryUomName: uomName,
                secondaryUomCode: uomCode,
                secondaryUomCodeAndName: uomCodeAndName,
                secondaryUomPrecision: uomPrecision,
              });
            }
          }
          const setFields = {
            uomId,
            uomCode,
            uomName,
            uomCodeAndName,
            currencyCode,
            taxId,
            taxRate,
            // noUnitPrice: unitPrice,
            // unitPrice,
            priceLibId,
            priceLibraryStatus,
            // priceLibraryId: isNil(priceLibId) ? null : priceLibraryId,
            selectLocalSupplierCode: isNil(supplierId) ? null : supplierNum,
            selectLocalSupplierId: isNil(supplierId) ? null : supplierId,
            selectLocalSupplierName: isNil(supplierId) ? null : supplierName,
            // taxIncludedPrice: enteredTaxIncludedPrice,
            unitPriceBatch,
            // holdPcHeaderId,
            // holdPcLineId,
            // contractNum,
            // benchmarkPriceType,
            // ladderPriceLibId,
            // ladderQuotationFlag,
            // originUnitPrice:
            //   benchmarkPriceType === 'NET_PRICE' ? unitPrice : enteredTaxIncludedPrice,
            unitPrice,
            enteredTaxIncludedPrice: enteredTaxIncludedPrice || taxIncludedPrice,
          };
          record.set(setFields);
        } else {
          record.reset();
          // record.init({ orderSupplierLov: {}, noUnitPrice: null, netPrice: null });
          record.set({ orderSupplierLov: {}, unitPrice: null });
        }
      }
    },
  },
});

export { purchaseOrder, sourcingResults, purchaseNeed };
