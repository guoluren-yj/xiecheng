import intl from 'utils/intl';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 设置sbdm国际化前缀 - common - model
const tenantId = getCurrentOrganizationId();

const byOrgListDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    selection: 'multiple',
    pageSize: 10,
    queryParameter: {
    customizeUnitCode: 'SMDM_MATERIELQUERY_LIST.ORG_LIST,SMDM_MATERIELQUERY_LIST.ORG_SEARCH',
  },
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/items/query-org-list`,
        method: 'GET',
      },
    },
    fields: [
      {
        label: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        name: 'itemCode',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位'),
        type: 'string',
        name: 'primaryUomId',
      },
      {
        label: intl.get('smdm.materiel.model.common.externalSystemCode').d('外部来源系统编码'),
        type: 'string',
        align: 'center',
        name: 'externalSystemCode',
      },
      {
        label: intl.get('hzero.common.status').d('物料启用状态'),
        type: 75,
        align: 'center',
        name: 'enabledFlag',
      },
      {
        label: intl.get(`smdm.materiel.model.materiel.lastUpdateDate`).d('最后更新时间'),
        type: 'string',
        name: 'lastUpdateDate',
      },
      {
        label: intl
          .get('smdm.materiel.model.materiel.itemAllOrgFlag')
          .d('是否加入全部库存组织标志'),
        type: 'string',
        name: 'itemAllOrgFlag',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.itemCategoryCode').d('物料主品类编码'),
        type: 'string',
        name: 'itemCategoryCode',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.itemCategoryName').d('物料主品类名称'),
        type: 'string',
        name: 'itemCategoryName',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.organizationCode').d('库存组织编码'),
        type: 'string',
        name: 'organizationCode',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.inventoryOrgDesc').d('库存组织描述'),
        type: 'string',
        name: 'organizationName',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.minPackQuantity').d('最小包装数量'),
        name: 'minPackQuantity',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.leadDays').d('前置时间（天数）'),
        name: 'leadDays',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.allowExcessType').d('允许超收类型'),
        name: 'allowExcessType',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.allowExcessAmount').d('允许超收数量/比例'),
        name: 'allowExcessAmount',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.minOrderQuantity').d('最小订货数量'),
        name: 'minOrderQuantity',
        type: 'number',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.executorNames').d('需求执行人'),
        name: 'demandExecutorBy',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.orderExecutorNames').d('订单执行人'),
        name: 'orderExecutor',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.sourceExecutorNames').d('寻源执行人'),
        name: 'sourceExecutor',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.forPurchaseFlag').d('是否用于采购'),
        name: 'forPurchaseFlag',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.internalBatchFlag').d('是否内部批次'),
        name: 'internalBatchFlag',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.dimensionQcMeaning').d('质检维度'),
        name: 'dimensionQc',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.validPeriodFlag').d('是否有有效期'),
        name: 'validPeriodFlag',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.externalBatchFlag').d('是否外部批次'),
        name: 'externalBatchFlag',
        type: 'string',
      },
      {
        label: intl
          .get('smdm.materiel.model.materiel.orgEnabledFlag')
          .d('物料所属库存组织启用标识'),
        name: 'orgEnabledFlagMeaning',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.consignmentFlag').d('是否寄售'),
        name: 'consignmentFlag',
        type: 'string',
      },
      {
        label: intl.get('smdm.materiel.model.materiel.exemptInspectionFlag').d('是否免检'),
        name: 'exemptInspectionFlag',
        type: 'string',
      },
    ],
    queryFields: [
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
      },
      {
        name: 'itemCodePrecision',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.itemCodePrecision').d('物料编码（精准）'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
      },
      {
        name: 'commonName',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.commonName').d('通用名'),
      },
      {
        name: 'specifications',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.specifications').d('规格'),
      },
      {
        name: 'model',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.model').d('型号'),
      },
      {
        name: 'externalSystemCode',
        type: 'string',
        label: intl.get('smdm.materiel.model.common.externalSystemCode').d('外部来源系统编码'),
      },
      {
        name: 'orgEnabledFlag',
        type: 'string',
        lookupCode: 'SMDM.FLAG_REVERSE',
        defaultValue: '1',
        label: intl.get('smdm.materiel.model.materiel.orgEnabledFlagMeaning').d('是否显示库存组织维度禁用行'),
      },
      {
        name: 'invOrganizationIdStr',
        type: 'object',
        lovCode: 'HPFM.INV_ORG',
        multiple: true,
        label: intl.get('smdm.materiel.model.materiel.organizationCode').d('所属库存组织'),
        transformRequest: value =>
          value && value.length ? (value || []).map(v => v.organizationId).toString() : null,
      },
      {
        name: 'uomId',
        type: 'object',
        lovCode: 'SMDM.UOM',
        label: intl.get('smdm.materiel.model.materiel.uomIdCode').d('计量单位代码'),
        transformRequest: (value) => value?.uomId,
      },
      {
        name: 'enabledFlag',
        type: 'string',
        lookupCode: 'SMDM.FLAG_REVERSE',
        defaultValue: '1',
        label: intl.get(`smdm.materiel.model.materiel.materialsDisplayed`).d('是否显示失效物料'),
      },
      {
        name: 'categoryIsNullFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get('smdm.materiel.model.materiel.categoryIsNullFlag').d('所属品类为空'),
      },
      {
        name: 'lastUpdateDateFrom',
        type: 'dateTime',
        label: intl.get('smdm.materiel.model.materiel.itemLastUpdateFrom').d('物料最后更新时间从'),
      },
      {
        name: 'lastUpdateDateTo',
        type: 'dateTime',
        label: intl.get('smdm.materiel.model.materiel.itemLastUpdateTo').d('物料最后更新时间至'),
      },
      {
        name: 'itemCodeMultiSelect',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.itemCodeMultiSelect').d('物料编码（批量）'),
      },
      {
        name: 'versionNumber',
        type: 'number',
        label: intl.get('smdm.materiel.model.materiel.version').d('版本'),
      },
      {
        name: 'categoryId',
        type: 'object',
        lovCode: 'SPRM.ITEM_CATEGOR',
        label: intl.get('smdm.materiel.model.materiel.mainCategory').d('所属主品类'),
        transformRequest: (value) => value?.categoryId,
      },
      {
        name: 'brand',
        type: 'string',
        label: intl.get('smdm.materiel.model.materiel.brand').d('品牌'),
      },
    ],
  };
};

export { byOrgListDS };
