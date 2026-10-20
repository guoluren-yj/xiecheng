import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const commonPrompt = 'sprm.forecastMgt.model.common';
const organizationId = getCurrentOrganizationId();

//
const wholeDs = ({ fcstSupplyHeaderId }) => ({
  autoQuery: false,
  fields: [
    {
      name: 'fcstNum',
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPRM.SUPPLIER',
      dynamicProps: {
        lovPara: () => ({ tenantId: organizationId }),
        textField: ({ record }) =>
          record.get('supplierCode') ? 'supplierNum' : 'supplierCompanyNum',
      },
      transformResponse: (value, object) => {
        return object
          ? {
              ...object,
              displaySupplierName: object?.supplierName || object?.supplierCompanyName,
            }
          : {};
      },
      label: intl.get(`${commonPrompt}.supplierLov`).d('供应商'),
    },
    {
      name: 'supplierId',
      label: intl.get(`${commonPrompt}.supplierLov`).d('供应商'),
      lovCode: 'SPRM.SUPPLIER',
      dynamicProps: {
        lovPara: () => ({ tenantId: organizationId }),
        textField: ({ record }) =>
          record.get('supplierCode') ? 'supplierCode' : 'supplierCompanyNum',
      },
    },

    {
      name: 'supplierName',
      label: intl.get(`${commonPrompt}.displaySupplierName`).d('供应商名称'),
      type: 'string',
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'createdBy',
      label: intl.get(`${commonPrompt}.createdBy`).d('创建人'),
      lovCode: 'HIAM.USER_REAL_NAME',
      transformRequest: (value) => value?.createdBy,
      transformResponse: (value, object) => {
        return object?.createdByName
          ? {
              ...object,
              createdBy: object?.createdBy,
              realName: object?.createdByName,
            }
          : {};
      },
    },
    // 存值
    {
      name: 'fcstLineList',
    },
    { name: 'actionLine', label: intl.get(`hzero.common.oprate`).d('操作') },
    {
      name: 'itemId',
      type: 'object',
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      label: intl.get(`${commonPrompt}.itemId`).d('物料编码'),
      transformRequest: (value) => value?.itemId,
      textField: 'itemCode',
      transformResponse: (value, object) => {
        return object?.itemId
          ? {
              ...object,
              itemId: object?.itemId,
              itemCode: object?.itemCode,
            }
          : {};
      },
    },
    { name: 'itemName', label: intl.get(`${commonPrompt}.itemName`).d('物料名称') },
    {
      name: 'categoryId',
      type: 'object',
      lovCode: 'SPRM.ITEM_CATEGOR_TILED',
      optionsProps: {
        paging: 'server',
      },
      dynamicProps: {
        lovPara({ record }) {
          return {
            itemId: record.get('itemId')?.itemId,
          };
        },
      },
      lovDefineAxiosConfig: (code) => {
        const lovConfig = lovDefineAxiosConfig(code);
        return {
          ...lovConfig,
          transformResponse: [
            ...lovConfig.transformResponse,
            (data) => {
              return {
                ...data,
                treeFlag: 'Y',
                idField: 'categoryId',
                parentIdField: 'parentCategoryId',
              };
            },
          ],
        };
      },
      transformRequest: (value) => value?.categoryId,
      transformResponse: (value, object) => {
        return object?.categoryId
          ? {
              ...object,
              categoryId: object?.categoryId,
              categoryName: object?.categoryName,
            }
          : {};
      },
    },
    {
      name: 'itemName',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
    },
    {
      name: 'uomId',
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      lovCode: 'SMDM.DUAL_UOM_ID',
      type: 'object',
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      transformRequest: (value) => value?.uomId,
      transformResponse: (value, object) => {
        return object?.itemId
          ? {
              ...object,
              uomId: object?.uomId,
              uomName: object?.uomName,
              uomCodeAndName: object?.uomName,
            }
          : {};
      },
    },
    {
      name: 'companyId',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      type: 'object',
      lovPara: { tenantId: organizationId, enabledFlag: 1 },
      transformRequest: (value) => value?.companyId,
      transformResponse: (value, object) => {
        return object?.companyId
          ? {
              ...object,
              companyId: object?.companyId,
            }
          : {};
      },
    },
    {
      name: 'ouId',
      label: intl.get(`entity.business.tag`).d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      textField: 'ouName',
      type: 'object',
      dynamicProps: {
        lovPara({ record }) {
          return {
            companyId: record.get('companyId')?.companyId,
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.ouId,
      transformResponse: (value, object) => {
        return object?.ouId
          ? {
              ...object,
              ouId: object?.ouId,
            }
          : {};
      },
    },
    {
      name: 'purchaseOrgId',

      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      textField: 'organizationName',
      type: 'object',
      dynamicProps: {
        lovPara({ record }) {
          return {
            ouId: record.get('ouId')?.ouId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.purchaseOrgId,
      transformResponse: (value, object) => {
        return object?.purchaseOrgId
          ? {
              ...object,
              purchaseOrgId: object?.purchaseOrgId,
              organizationName: object?.purchaseOrgName,
            }
          : {};
      },
    },
    {
      name: 'fcrtType',
      label: intl.get(`sprm.common.model.common.fcrtType`).d('预测类型'),
      lookupCode: 'SPRM.FCST_CATEGORY',
    },
    {
      name: 'purchaseAgentId',
      label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
      lovCode: 'SPUC.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.purchaseAgentId,
      transformResponse: (value, object) => {
        return object?.purchaseAgentId
          ? {
              ...object,
              purchaseAgentId: object?.purchaseAgentId,
            }
          : {};
      },
    },
    {
      name: 'invOrganizationId',
      label: intl.get(`entity.organization.class.invOrganizationId`).d('收货组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      type: 'object',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            ouId: record.get('ouId')?.ouId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.organizationId,
      transformResponse: (value, object) => {
        return object?.invOrganizationId
          ? {
              ...object,
              organizationId: object?.invOrganizationId,
              organizationName: object?.invOrganizationName,
            }
          : {};
      },
    },
    {
      name: 'deliveryPlan',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.deliveryPlan`).d('计划交期'),
    },
    {
      name: 'fcstStartDate',
      type: 'date',
      label: intl.get(`${commonPrompt}.fcstStartDate`).d('预测起始日期'),
    },
    {
      name: 'actionLine',
      label: intl.get(`${commonPrompt}.action`).d('操作记录'),
    },
    {
      name: 'sumQiantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumQiantity`).d('预测总量'),
    },
    {
      name: 'sumAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumAmount`).d('预测总额'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPRM}/v1/${organizationId}/fcst-supply-headers/approval/detail/${fcstSupplyHeaderId}`,
      method: 'GET',
    },
  },
});

const tableDataSet = () => ({
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'fcrtType',
      label: intl.get(`sprm.common.model.common.fcrtType`).d('预测类型'),
      lookupCode: 'SPRM.FCST_CATEGORY',
    },

    {
      name: 'sumQiantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumQiantity`).d('预测总量'),
    },
    {
      name: 'sumAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumAmount`).d('预测总额'),
    },
  ],
});

const forecastDetailDs = ({ fcstHeaderId, fcstLineId }) => {
  return {
    autoQuery: true,
    selection: false,
    primaryKey: 'fcstLineDetailId',
    fields: [
      {
        name: 'fcstDeliveryDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        label: intl.get(`sprm.forecastMgt.model.common.fcstDeliveryDate`).d('预计交货日期'),
      },
      {
        name: 'fcstQuantity',
        type: 'number',
        min: 0,
        precision: 10,
        label: intl.get(`sprm.forecastMgt.model.common.fcstQuantity`).d('要求到货数量'),
      },
      {
        name: 'purchaserRemark',
        label: intl.get(`sprm.forecastMgt.model.common.purchaserRemark`).d('采购方备注'),
      },
      {
        name: 'feedbackDeliveryDate',
        format: DEFAULT_DATE_FORMAT,
        transformRequest: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        label: intl.get(`sprm.forecastMgt.model.common.feedbackDeliveryDate`).d('供应商反馈交期'),
      },
      {
        name: 'feedbackQuantity',
        type: 'number',
        min: 0,
        precision: 10,
        label: intl.get(`sprm.forecastMgt.model.detail.feedbackQuantity`).d('供应商反馈数量'),
      },
      {
        name: 'supplierRemark',
        label: intl.get(`sprm.forecastMgt.model.detail.supplierRemark`).d('供应商备注'),
      },
      {
        name: 'enoughFlag',
        defaultValue: 0,
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`sprm.forecastMgt.model.detail.enoughFlag`).d('是否满足'),
      },
    ],

    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${getCurrentOrganizationId()}/fcst-supply-line-details/list`,
          method: 'GET',
          data: { fcstHeaderId, fcstLineId },
        };
      },
    },
  };
};

const operateRecordDs = () => ({
  // pageSize: 20,
  paging: false,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'processTypeCode',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`hzero.common.oprate`).d('操作'),
    },
    {
      name: 'processUserName',
      label: intl.get(`${commonPrompt}.processUserName`).d('操作人'),
    },
    {
      name: 'version',
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'processDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.processDate`).d('创建时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-actions`,
        method: 'GET',
      };
    },
  },
});

const historyVersionDs = () => ({
  paging: false,
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
    },
    {
      name: 'version',
      label: intl.get(`hzero.common.components.dataAudit.version`).d('版本'),
    },
    {
      name: 'fcstStatus',
      lookupCode: `SPRM.FCST_STATUS`,
      label: intl.get(`${commonPrompt}.fcstSatus`).d('状态'),
    },
    { name: 'fcrtType', label: intl.get(`sprm.common.model.common.fcrtType`).d('预测类型') },
    {
      name: 'sumQiantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumQiantity`).d('预测总量'),
    },
    {
      name: 'sumAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.sumAmount`).d('预测总额'),
    },
    {
      name: 'fcstNum',
      label: intl.get(`${commonPrompt}.fcstNum`).d('预测批次号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/fcst-header-vers/list`,
        method: 'GET',
      };
    },
  },
});

export { wholeDs, tableDataSet, forecastDetailDs, operateRecordDs, historyVersionDs };
