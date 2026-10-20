import intl from 'utils/intl';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import {
  conversionUpdate,
  getDynamicLabel,
} from '@/routes/OrderExecutionWorkbench/components/utils';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const supplierTenantId = getUserOrganizationId();

const toBeFedBack = () => ({
  dataToJSON: 'selected',
  primaryKey: 'poHeaderId',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('slod.orderExecution.model.common.statusCode').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'orgName',
      label: intl.get('slod.orderExecution.model.common.orgName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('slod.orderExecution.model.common.agentName').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeCode',
      label: intl.get('slod.orderExecution.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'erpCreationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.erpCreationDate').d('创建时间'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('slod.orderExecution.model.common.electricSignFlag').d('电签标识'),
    },
    {
      name: 'electricSignStatus',
      label: intl.get('slod.orderExecution.model.common.electricSignStatus').d('电签状态'),
    },
  ],
  queryParameter: {
    supplierTenantId,
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_TOBEFEDBACK.LIST,SINV.ORDER_EXECUTION_TOBEFEDBACK.SEARCH',
  },
  transport: {
    read: () => ({
      url: `${SRM_SPUC}/v1/${organizationId}/po-header/confirm-list`,
      method: 'GET',
    }),
  },
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
  },
});

const feedbackAlready = () => ({
  dataToJSON: 'selected',
  primaryKey: 'poHeaderId',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('slod.orderExecution.model.common.statusCode').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'orgName',
      label: intl.get('slod.orderExecution.model.common.orgName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('slod.orderExecution.model.common.agentName').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeCode',
      label: intl.get('slod.orderExecution.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'erpCreationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.erpCreationDate').d('创建时间'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('slod.orderExecution.model.common.electricSignFlag').d('电签标识'),
    },
    {
      name: 'electricSignStatus',
      label: intl.get('slod.orderExecution.model.common.electricSignStatus').d('电签状态'),
    },
  ],
  queryParameter: {
    supplierTenantId,
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_FEEDBACKALREADY.LIST,SINV.ORDER_EXECUTION_FEEDBACKALREADY.SEARCH',
    statusCodes: 'CONFIRMED_ALL',
  },
  transport: {
    read: () => ({
      url: `${SRM_SPUC}/v1/${organizationId}/po-header/supplier`,
      method: 'GET',
    }),
  },
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
  },
});

const all = () => ({
  dataToJSON: 'selected',
  primaryKey: 'poHeaderId',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'statusCode',
      label: intl.get('slod.orderExecution.model.common.statusCode').d('状态'),
    },
    {
      name: 'action',
      label: intl.get('slod.orderExecution.model.common.action').d('操作'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNum').d('订单编号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'orgName',
      label: intl.get('slod.orderExecution.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('slod.orderExecution.model.common.agentId').d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
    },
    {
      name: 'amount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeCode',
      label: intl.get('slod.orderExecution.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.creationTime').d('创建时间'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'displayReleaseNum',
      label: intl.get('slod.orderExecution.model.common.displayReleaseNum').d('发放号'),
    },
    {
      name: 'remark',
      label: intl.get('slod.orderExecution.model.common.remark').d('备注'),
    },
    {
      name: 'electricSignFlag',
      label: intl.get('slod.orderExecution.model.common.electricSignFlag').d('电签标识'),
    },
    {
      name: 'electricSignStatus',
      label: intl.get('slod.orderExecution.model.common.electricSignStatus').d('电签状态'),
    },
  ],
  queryParameter: {
    supplierTenantId,
    poWorkbenchFlag: 1,
    customizeUnitCode: 'SINV.ORDER_EXECUTION_ALL.LIST,SINV.ORDER_EXECUTION_ALL.SEARCH',
  },
  transport: {
    read: ({ data }) => {
      const {
        statusCodes = 'PART_FEED_BACK,PUBLISHED,DELIVERY_DATE_REVIEW,DELIVERY_DATE_REJECT,CONFIRMED,PUBLISH_CANCEL,CANCELED,CANCELING_WFL,CLOSED,CLOSE_WFL',
      } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/supplier`,
        method: 'GET',
        data: { ...data, statusCodes },
      };
    },
  },
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
  },
});

const detailToBeFedBack = () => ({
  primaryKey: 'poLineLocationId',
  dataToJSON: 'selected',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('slod.orderExecution.model.common.displayStatus').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNumAndLineNum').d('订单编号-行号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('slod.orderExecution.model.common.displayLineLocationNum').d('发运号'),
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
      name: 'originalQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.originalQuantity').d('数量'),
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('slod.orderExecution.model.common.uomCodeAndName').d('单位'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.feedbackQuantity').d('反馈数量'),
      min: 0,
      dynamicProps: {
        disabled: ({ record }) => record.get('transactionMode') === 'TRIPARTITE',
        precision: ({ record }) => record.get('secondaryUomPrecision'),
        defaultValue: ({ record }) => record.get('originalQuantity'),
        max: ({ record }) => record.get('originalQuantity'),
        required: ({ record }) => record.get('quantityEnableFlag'),
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      min: 0,
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity', true),
        precision: ({ record }) => record.get('uomPrecision'),
        defaultValue: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? undefined : record.get('originalQuantity'),
        max: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? Infinity : record.get('originalQuantity'),
        disabled: ({ dataSet, record }) =>
          dataSet.getState('doubleUnitEnabled') || record.get('transactionMode') === 'TRIPARTITE',
        required: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? false : record.get('quantityEnableFlag'),
      },
    },
    {
      name: 'needByDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.needByDate').d('需求日期'),
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
      dynamicProps: {
        // disabled: ({ record }) => !record.get('deliveryDateEditFlag'),
        required: ({ record }) => record.get('deliveryDateEnableFlag'),
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.taxRate').d('税率'),
      max: MAX_BIGNUMBER_NUMBER,
    },
    {
      name: 'unitPriceBatch',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.unitPriceBatch').d('每'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'orderTypeName',
      label: intl.get('slod.orderExecution.model.common.orderTypeName').d('订单类型'),
    },
    {
      name: 'ouName',
      label: intl.get('slod.orderExecution.model.common.ouName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('slod.orderExecution.model.common.purchaseAgentName').d('采购员'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('slod.orderExecution.model.common.invOrganizationName').d('库存组织'),
    },
    {
      name: 'categoryName',
      label: intl.get('slod.orderExecution.model.common.categoryName').d('物料分类'),
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
      name: 'poSourcePlatform',
      label: intl.get('slod.orderExecution.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('slod.orderExecution.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'erpCreatedName',
      label: intl.get('slod.orderExecution.model.common.erpCreatedName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.erpCreationDate').d('创建日期'),
    },
    {
      name: 'versionNum',
      label: intl.get('slod.orderExecution.model.common.versionNum').d('版本号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'supplierCode',
      label: intl.get('slod.orderExecution.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'inventoryName',
      label: intl.get('slod.orderExecution.model.common.inventoryName').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('slod.orderExecution.model.common.invLocationId').d('收货库位'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyContact').d('收货联系人'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('slod.orderExecution.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'costName',
      label: intl.get('slod.orderExecution.model.common.costName').d('成本中心'),
    },
    {
      name: 'departmentName',
      label: intl.get('slod.orderExecution.model.common.departmentName').d('部门'),
    },
    {
      name: 'brand',
      label: intl.get('slod.orderExecution.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('slod.orderExecution.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('slod.orderExecution.model.common.model').d('型号'),
    },
    {
      name: 'projectCategory',
      label: intl.get('slod.orderExecution.model.common.projectCategory').d('项目类别'),
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
      name: 'delayFlag',
      label: intl.get('slod.orderExecution.model.common.delayFlag').d('交期满足需求'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'urgentDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.urgentDate').d('加急时间'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'confirmedDate',
      type: 'dateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
      label: intl.get('slod.orderExecution.model.common.confirmedDate').d('确认时间'),
    },
  ],
  queryParameter: {
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.SEARCH,SINV.ORDER_EXECUTION_DETAIL_TOBEFEDBACK.LIST',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-location/confirm/list`,
        method: 'GET',
      };
    },
  },
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach((i) => {
    //     Object.assign(i, {
    //       status: 'update',
    //     });
    //   });
    // },
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
    update: ({ dataSet, record, value, name }) => {
      const itemCode = record.get('itemCode');
      const sodrEnabled = dataSet.getState('doubleUnitEnabled');
      if (name === 'quantity' && !sodrEnabled) {
        record.set({ secondaryQuantity: value });
      }
      if (name === 'secondaryQuantity') {
        // 有物料编码 并且开启双单位换算出基本数量
        if (sodrEnabled && itemCode) {
          conversionUpdate({ dataSet, record, value });
        } else {
          record.set({ quantity: value });
        }
      }
    },
  },
});

const detailFeedbackAlready = () => ({
  primaryKey: 'poLineLocationId',
  dataToJSON: 'selected',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('slod.orderExecution.model.common.displayStatus').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNumAndLineNum').d('订单编号-行号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('slod.orderExecution.model.common.displayLineLocationNum').d('发运号'),
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
      name: 'originalQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.originalQuantity').d('数量'),
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('slod.orderExecution.model.common.uomCodeAndName').d('单位'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.feedbackQuantity').d('反馈数量'),
      min: 0,
      max: MAX_BIGNUMBER_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('secondaryUomPrecision'),
        defaultValue: ({ record }) => record.get('originalQuantity'),
        max: ({ record }) => record.get('originalQuantity'),
        required: ({ record }) => record.get('quantityEnableFlagConfirm'),
        disabled: ({ record }) => record.get('transactionMode') === 'TRIPARTITE',
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.feedbackQuantity').d('反馈数量'),
      min: 0,
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity', true),
        precision: ({ record }) => record.get('uomPrecision'),
        defaultValue: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? undefined : record.get('originalQuantity'),
        max: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? Infinity : record.get('originalQuantity'),
        disabled: ({ dataSet, record }) =>
          dataSet.getState('doubleUnitEnabled') || record.get('transactionMode') === 'TRIPARTITE',
        required: ({ record, dataSet }) =>
          dataSet.getState('doubleUnitEnabled') ? false : record.get('quantityEnableFlag'),
      },
    },

    {
      name: 'needByDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.needByDate').d('需求日期'),
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
      dynamicProps: {
        required: ({ record }) => record.get('deliveryDateEnableFlagConfirm'),
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.taxRate').d('税率'),
      max: MAX_BIGNUMBER_NUMBER,
    },
    {
      name: 'unitPriceBatch',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.unitPriceBatch').d('每'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'poTypeCode',
      label: intl.get('slod.orderExecution.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'orderTypeName',
      label: intl.get('slod.orderExecution.model.common.orderTypeName').d('订单类型'),
    },
    {
      name: 'ouName',
      label: intl.get('slod.orderExecution.model.common.ouName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('slod.orderExecution.model.common.purchaseAgentName').d('采购员'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('slod.orderExecution.model.common.invOrganizationName').d('库存组织'),
    },
    {
      name: 'categoryName',
      label: intl.get('slod.orderExecution.model.common.categoryName').d('物料分类'),
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
      name: 'poSourcePlatform',
      label: intl.get('slod.orderExecution.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('slod.orderExecution.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'erpCreatedName',
      label: intl.get('slod.orderExecution.model.common.erpCreatedName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.creationDate').d('创建日期'),
    },
    {
      name: 'versionNum',
      label: intl.get('slod.orderExecution.model.common.versionNum').d('版本号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'supplierCode',
      label: intl.get('slod.orderExecution.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'inventoryName',
      label: intl.get('slod.orderExecution.model.common.inventoryName').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('slod.orderExecution.model.common.inventoryName').d('收货库位'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyContact').d('收货联系人'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('slod.orderExecution.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'costName',
      label: intl.get('slod.orderExecution.model.common.costName').d('成本中心'),
    },
    {
      name: 'departmentName',
      label: intl.get('slod.orderExecution.model.common.departmentName').d('部门'),
    },
    {
      name: 'brand',
      label: intl.get('slod.orderExecution.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('slod.orderExecution.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('slod.orderExecution.model.common.model').d('型号'),
    },
    {
      name: 'projectCategory',
      label: intl.get('slod.orderExecution.model.common.projectCategory').d('项目类别'),
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
      name: 'delayFlag',
      label: intl.get('slod.orderExecution.model.common.delayFlag').d('交期满足需求'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'urgentDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.urgentDate').d('加急时间'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'confirmedDate',
      type: 'dateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
      label: intl.get('slod.orderExecution.model.common.confirmedDate').d('确认时间'),
    },
  ],
  queryParameter: {
    camp: 2,
    supplierTenantId,
    poWorkbenchFlag: 1,
    statusCodes: 'CONFIRMED',
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.SEARCH,SINV.ORDER_EXECUTION_DETAIL_FEDBACKALREADY.LIST',
  },
  transport: {
    read: ({ data }) => {
      const { statusCodes } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-location/supplier`,
        method: 'GET',
        data: {
          ...data,
          statusCodes: statusCodes === 'CONFIRMED' ? 'CONFIRMED_ALL' : statusCodes,
        },
      };
    },
  },
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach((i) => {
    //     Object.assign(i, {
    //       status: 'update',
    //     });
    //   });
    // },
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
    update: ({ dataSet, record, value, name }) => {
      const itemCode = record.get('itemCode');
      const sodrEnabled = dataSet.getState('doubleUnitEnabled');
      if (name === 'quantity' && !sodrEnabled) {
        record.set({ secondaryQuantity: value });
      }
      if (name === 'secondaryQuantity') {
        // 有物料编码 并且开启双单位换算出基本数量
        if (sodrEnabled && itemCode) {
          conversionUpdate({ dataSet, record, value });
        } else {
          record.set({ quantity: value });
        }
      }
    },
  },
});

const detailAll = () => ({
  dataToJSON: 'selected',
  primaryKey: 'poLineLocationId',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'displayStatusCode',
      label: intl.get('slod.orderExecution.model.common.displayStatus').d('状态'),
    },
    {
      name: 'displayPoNum',
      label: intl.get('slod.orderExecution.model.common.displayPoNumAndLineNum').d('订单编号-行号'),
    },
    {
      name: 'companyName',
      label: intl.get('slod.orderExecution.model.common.companyName').d('客户'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('slod.orderExecution.model.common.displayLineLocationNum').d('发运号'),
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
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.quantity').d('数量'),
    },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('slod.orderExecution.model.common.uomCodeAndName').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.taxRate').d('税率'),
    },
    {
      name: 'unitPriceBatch',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.unitPriceBatch').d('每'),
    },
    {
      name: 'currencyCode',
      label: intl.get('slod.orderExecution.model.common.currencyCode').d('币种'),
    },
    {
      name: 'needByDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.needByDate').d('需求日期'),
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
    },
    {
      name: 'poTypeCode',
      label: intl.get('slod.orderExecution.model.common.poTypeCode').d('订单类型'),
    },
    {
      name: 'orderTypeName',
      label: intl.get('slod.orderExecution.model.common.orderTypeName').d('订单类型'),
    },
    {
      name: 'ouName',
      label: intl.get('slod.orderExecution.model.common.ouName').d('业务实体'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get('slod.orderExecution.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('slod.orderExecution.model.common.purchaseAgentName').d('采购员'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('slod.orderExecution.model.common.invOrganizationName').d('库存组织'),
    },
    {
      name: 'categoryName',
      label: intl.get('slod.orderExecution.model.common.categoryName').d('物料分类'),
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
      name: 'poSourcePlatform',
      label: intl.get('slod.orderExecution.model.common.poSourcePlatform').d('来源平台'),
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('slod.orderExecution.model.common.sourceBillTypeCode').d('来源单据'),
    },
    {
      name: 'erpCreatedName',
      label: intl.get('slod.orderExecution.model.common.erpCreatedName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get('slod.orderExecution.model.common.erpCreationDate').d('创建日期'),
    },
    {
      name: 'checkContectDoc',
      label: intl.get(`slod.orderExecution.model.common.checkContectDoc`).d('执行单据'),
    },
    {
      name: 'versionNum',
      label: intl.get('slod.orderExecution.model.common.versionNum').d('版本号'),
    },
    {
      name: 'releaseNum',
      label: intl.get('slod.orderExecution.model.common.releaseNum').d('发放号'),
    },
    {
      name: 'supplierCode',
      label: intl.get('slod.orderExecution.model.common.supplierCode').d('供应商编码'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get('slod.orderExecution.model.common.supplierSiteName').d('供应商地点'),
    },
    {
      name: 'inventoryName',
      label: intl.get('slod.orderExecution.model.common.inventoryName').d('收货库房'),
    },
    {
      name: 'locationName',
      label: intl.get('slod.orderExecution.model.common.inventoryName').d('收货库位'),
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyAddress').d('收货地址'),
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('slod.orderExecution.model.common.shipToThirdPartyContact').d('收货联系人'),
    },
    {
      name: 'receiveTelNum',
      label: intl.get('slod.orderExecution.model.common.receiveTelNum').d('联系电话'),
    },
    {
      name: 'netReceivedQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.netReceivedQuantity').d('净接收'),
    },
    {
      name: 'netDeliverQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.netDeliverQuantity').d('净入库'),
    },
    {
      name: 'notDeliverQuantity',
      type: 'number',
      label: intl.get('slod.orderExecution.model.common.notDeliverQuantity').d('未入库'),
    },
    {
      name: 'shippedQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.shippedQuantity').d('已发货'),
    },
    {
      name: 'billMatchedQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.billMatchedQuantity').d('已对账'),
    },
    {
      name: 'invoicedQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.orderExecution.model.common.invoicedQuantity').d('已开票'),
    },
    {
      name: 'costName',
      label: intl.get('slod.orderExecution.model.common.costName').d('成本中心'),
    },
    {
      name: 'departmentName',
      label: intl.get('slod.orderExecution.model.common.departmentName').d('部门'),
    },
    {
      name: 'brand',
      label: intl.get('slod.orderExecution.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      label: intl.get('slod.orderExecution.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      label: intl.get('slod.orderExecution.model.common.model').d('型号'),
    },
    {
      name: 'projectCategory',
      label: intl.get('slod.orderExecution.model.common.projectCategory').d('项目类别'),
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
      name: 'delayFlag',
      label: intl.get('slod.orderExecution.model.common.delayFlag').d('交期满足需求'),
    },
    {
      name: 'urgentFlag',
      label: intl.get('slod.orderExecution.model.common.urgentFlag').d('是否加急'),
    },
    {
      name: 'urgentDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.urgentDate').d('加急时间'),
    },
    {
      name: 'releasedDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get('slod.orderExecution.model.common.releasedDate').d('发布时间'),
    },
    {
      name: 'confirmedDate',
      type: 'dateTime',
      format: 'YYYY-MM-DD HH:mm:ss',
      label: intl.get('slod.orderExecution.model.common.confirmedDate').d('确认时间'),
    },
  ],
  queryParameter: {
    camp: 2,
    supplierTenantId,
    poWorkbenchFlag: 1,
    customizeUnitCode:
      'SINV.ORDER_EXECUTION_DETAIL_ALL.SEARCH,SINV.ORDER_EXECUTION_DETAIL_ALL.LIST',
  },
  transport: {
    read: ({ data }) => {
      const {
        statusCodes = 'PUBLISHED,PART_FEED_BACK,DELIVERY_DATE_REVIEW,DELIVERY_DATE_REJECT,CONFIRMED,PUBLISH_CANCEL,CANCELED,CANCELING_WFL,CLOSED,CLOSE_WFL,CLOSETOBECOMFIRMED,CANCELTOBECOMFIRMED',
      } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-location/supplier`,
        method: 'GET',
        data: { ...data, statusCodes },
      };
    },
  },
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.forEach((i) => {
        i.reset();
      });
    },
  },
});

const batchMaintenance = () => ({
  dataToJSON: 'normal',
  autoCreate: true,
  fields: [
    {
      name: 'promiseDeliveryDate',
      label: intl.get('slod.orderExecution.model.common.promiseDeliveryDate').d('承诺交货日期'),
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
    },
  ],
});

export {
  toBeFedBack,
  feedbackAlready,
  all,
  detailToBeFedBack,
  detailFeedbackAlready,
  detailAll,
  batchMaintenance,
};
