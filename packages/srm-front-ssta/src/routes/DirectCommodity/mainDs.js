import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const prefix = `ssta.commodity`;
const mainTableDs = () => ({
  selection: 'multiple',
  cacheSelection: true,
  autoQuery: false,
  // table表单显示的字段
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'commodityCode',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.taxCode`).d('税收编码'),
    },
    {
      name: 'commodityName',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.name`).d('商品或服务名称'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.taxRate`).d('税率'),
      lookupCode: 'SDIM.COMMODITY_TAX_RATE',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'freeTaxMarkMeaning',
      type: 'string',
      lookupCode: 'SDIM.FREE_TAX_MARK',
      label: intl.get(`${prefix}.model.commodity.zeroTaxRateFlag`).d('零税率标识'),
    },
    {
      name: 'preferentialPolicyFlagMeaning',
      type: 'string',
      lookupCode: 'SDIM.PREFERENTIAL_POLICY_FLAG',
      label: intl.get(`${prefix}.model.commodity.policy`).d('优惠政策标识'),
    },
    {
      name: 'specialManagementVat',
      type: 'string',
      lookupCode: 'SDIM.COMMODITY_SPECIAL_MANAGEMENT_VAT',
      label: intl.get(`${prefix}.model.commodity.specialVAT`).d('增值税特殊管理'),
    },
    {
      name: 'percent',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.percent`).d('归一化百分数概率'),
    },
    {
      name: 'keyWord',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.keyWord`).d('关键字'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.remark`).d('说明'),
    },
    {
      name: 'summaryFlagMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.summaryFlag`).d('汇总项'),
    },
    {
      name: 'sourceCodeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.source`).d('商品来源'),
      // lookupCode: 'SDIM.COMMODITY_SOURCE_CODE',
    },
    {
      name: 'taxNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.supplierCompanyTaxNum`).d('供应商公司税号'),
    },
    {
      name: 'commodityServiceCateCode',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.serviceShortName`).d('商品或服务分类简称'),
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.commodity.enableFlag`).d('启用状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-commoditys/list?customizeUnitCode=SSTA.DIRECT_COMMODITY.COMMODITY_GRID,SSTA.DIRECT_COMMODITY.COMMODITY_SEARCH`,
        method: 'GET',
      };
    },
  },
});

const recordDs = () => ({
  autoQuery: false,
  fields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-commodity-actions/list`,
        method: 'GET',
      };
    },
  },
});

const searchDs = () => ({
  // selection: 'multiple',
  fields: [
    {
      name: 'supplierCompanyLov',
      type: 'object',
      label: intl.get('ssta.taxControl.model.taxControl.partnerInfo').d('企业信息'),
      lovCode: 'SSTA.USER_AUTH.PURCHASER.WITH_TAX',
      noCache: true,
      textField: 'supplierCompanyName',
      lovPara: { tenantId: organizationId },
      required: true,
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyLov.supplierCompanyName',
    },
    {
      name: 'projectName',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.projectName`).d('项目名称'),
    },
    {
      name: 'unit',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.unit`).d('单位'),
    },
    {
      name: 'model',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.specificationsModel`).d('规格型号'),
    },
  ],
});

const mapTableDs = () => ({
  selection: 'multiple',
  cacheSelection: true,
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'itemCodeLov',
      type: 'object',
      label: intl.get(`ssta.prePayment.model.prePayment.projectCode`).d('项目编码'),
      lovCode: 'SDIM.COMMODITY_MAPPING_ITEM_LOV',
      textField: 'itemCode',
      dynamicProps: {
        lovPara: ({ record }) => ({
          commodityId: record.get('commodityId'),
          tenantId: getCurrentOrganizationId(),
        }),
      },
      required: true,
      noCache: true,
    },
    {
      name: 'itemCode',
      type: 'string',
      bind: 'itemCodeLov.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`ssta.prePayment.model.prePayment.projectName`).d('项目名称'),
      bind: 'itemCodeLov.itemName',
    },
    {
      name: 'partnerItemId',
      type: 'string',
      bind: 'itemCodeLov.partnerItemId',
    },
    {
      name: 'itemId',
      type: 'string',
      bind: 'itemCodeLov.itemId',
    },
    {
      name: 'uom',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.unit`).d('单位'),
      bind: 'itemCodeLov.uom',
      required: true,
    },

    {
      name: 'model',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.specificationsModel`).d('规格型号'),
      bind: 'itemCodeLov.model',
    },
    {
      name: 'partnerItemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.releatedCustomerMateriel`).d('关联客户物料编码'),
      bind: 'itemCodeLov.partnerItemCode',
    },
    {
      name: 'partnerItemName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.commodity.releatedCustomerMaterielName`)
        .d('关联客户物料名称'),
      bind: 'itemCodeLov.partnerItemName',
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.model.commodity.taxRate`).d('税率'),
      lookupCode: 'SDIM.COMMODITY_TAX_RATE',
      bind: 'itemCodeLov.taxRate',
    },
    {
      name: 'commodityNumberLov',
      type: 'object',
      label: intl.get(`${prefix}.model.commodity.relatedTaxesCode`).d('关联税收编码'),
      lovCode: 'SDIM.COMMODITY_LOV',
      textField: 'commodityCode',
      dynamicProps: {
        lovPara: ({ record }) => ({
          itemId: record.get('itemId'),
          tenantId: getCurrentOrganizationId(),
        }),
      },
      required: true,
      noCache: true,
    },
    {
      name: 'commodityId',
      type: 'string',
      bind: 'commodityNumberLov.commodityId',
    },
    {
      name: 'commodityCode',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.relatedTaxesCode`).d('关联税收编码'),
      bind: 'commodityNumberLov.commodityCode',
    },
    {
      name: 'commodityNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.relatedTaxesCode`).d('关联税收编码'),
      bind: 'commodityNumberLov.commodityNumber',
    },
    {
      name: 'commodityName',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.name`).d('商品或服务名称'),
      bind: 'commodityNumberLov.commodityName',
    },
    {
      name: 'commodityServiceCateCode',
      type: 'string',
      label: intl.get(`${prefix}.model.commodity.serviceShortName`).d('商品或服务分类简称'),
      bind: 'commodityNumberLov.commodityServiceCateCode',
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.commodity.enableFlag`).d('启用状态'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('hzero.common.table.column.options').d('操作'),
    },
  ],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-commodity-mappings/list?customizeUnitCode=SSTA.DIRECT_COMMODITY_MAPPING.COMMODITY_MAP_GRID,SSTA.DIRECT_COMMODITY_MAPPING.COMMODITY_MAP_SEARCH`,
        method: 'GET',
      };
    },
  },
});

const recordMapDs = () => ({
  autoQuery: false,
  fields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-commodity-mapping-actions/list`,
        method: 'GET',
      };
    },
  },
});

export { mainTableDs, recordDs, searchDs, mapTableDs, recordMapDs };
