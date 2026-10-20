/**
 * 供应商找关系页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 监控列表DS
 * @returns
 */
const MonitorListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/monitor-user`,
        params: {
          ...data,
          ...params,
          ...passParams,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  autoQuery: false,
  fields: [
    {
      label: intl.get('sdat.monitorOrgManagement.model.companyCode').d('企业编码'),
      name: 'enterpriseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.companyName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.riskLevel').d('风险等级'),
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_LEVEL_TYPE',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.monitorStuff').d('监控员'),
      name: 'monitorStuff',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.uscc').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.isErp').d('是否ERP'),
      name: 'erpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('sdat.monitorOrgManagement.model.lastScanningTime').d('上次扫描时间'),
      name: 'lastScanTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.failureTime').d('失效时间'),
      name: 'expireDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.isActive').d('是否有效'),
      name: 'effectiveFlag',
      type: 'number',
    },
  ],
  events: {},
});

/**
 * 企业列表
 * @returns
 */
const BusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const ids = data?.categoryIdList ?? [];
      const idsStr = ids.length ? ids.join(',') : '';
      // eslint-disable-next-line no-param-reassign
      delete data.categoryIdList;

      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/srm-enterprise-list`,
        params: {
          ...data,
          ...params,
          ...passParams,
          categoryIdList: idsStr,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'companyId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersCode').d('供应商编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.suppliersName').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
    {
      name: 'categoryObj',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl.get('sdat.monitorBusiness.model.supplierTypeList').d('供应商分类'),
      multiple: true,
      noCache: true,
      ignore: 'always',
      // lovQueryAxiosConfig: () => {
      //   return {
      //     url: `/sslm/v1/${getCurrentOrganizationId()}/supplier-categorys/tree-c7n`,
      //     method: 'GET',
      //   };
      // },
      lovPara: {
        tenantId,
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: (dsProps) => {
        return {
          ...dsProps,
          paging: 'server',
          idField: 'categoryId',
          parentIdField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('checkFlag'),
            },
          },
          events: {
            select: ({ dataSet, record }) => {
              // 仅多选时处理联动
              const parentCategoryId = record.get('parentCategoryId');
              if (parentCategoryId) {
                const parentRecord = dataSet.find(
                  (rec) => rec.get('categoryId') === parentCategoryId
                );
                if (parentRecord) {
                  dataSet.select(parentRecord);
                }
              }
            },
          },
        };
      },
      transformResponse: (value, data) => {
        const { categoryList } = data;
        if (!isEmpty(categoryList)) {
          return categoryList;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIdList',
      bind: 'categoryObj.categoryId',
    },
  ],
  events: {},
});

/**
 * 企业列表
 * @returns
 */
const AddedBusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/monitor-enterprise-other`,
        params: {
          ...data,
          ...params,
          tenant: tenantId,
          useTenant: tenantId,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'companyId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierCodes').d('供应商编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      name: 'unifiedSocialCode',
      label: intl.get('sdat.monitorBusiness.model.unifiedSocialCodes').d('统一社会信用代码'),
    },
    {
      name: 'categoryObj',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER_CATEGORY_PAGE',
      label: intl.get('sdat.monitorBusiness.model.supplierTypeList').d('供应商分类'),
      multiple: true,
      noCache: true,
      ignore: 'always',
      // lovQueryAxiosConfig: () => {
      //   return {
      //     url: `/sslm/v1/${getCurrentOrganizationId()}/supplier-categorys/tree-c7n`,
      //     method: 'GET',
      //   };
      // },
      lovPara: {
        tenantId,
        enabledFlag: 1,
        parentCategoryId: 0,
      },
      textField: 'categoryDescription',
      optionsProps: (dsProps) => {
        return {
          ...dsProps,
          paging: 'server',
          idField: 'categoryId',
          parentIdField: 'parentCategoryId',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('checkFlag'),
            },
          },
          events: {
            select: ({ dataSet, record }) => {
              // 仅多选时处理联动
              const parentCategoryId = record.get('parentCategoryId');
              if (parentCategoryId) {
                const parentRecord = dataSet.find(
                  (rec) => rec.get('categoryId') === parentCategoryId
                );
                if (parentRecord) {
                  dataSet.select(parentRecord);
                }
              }
            },
          },
        };
      },
      transformResponse: (value, data) => {
        const { categoryList } = data;
        if (!isEmpty(categoryList)) {
          return categoryList;
        } else {
          return value;
        }
      },
    },
    {
      name: 'categoryIdList',
      bind: 'categoryObj.categoryId',
    },
  ],
  events: {},
});

/**
 * getResultDetailDs: 添加企业后的详情结果
 * @returns
 */
const getResultDetailDs = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/add-monitor-result`,
        params: {
          ...data,
          ...params,
          ...passParams,
        },
        method: 'GET',
      };
    },
  },
  paging: false,
  primaryKey: 'companyId',
  cacheSelection: true,
  selection: false,
  fields: [
    {
      label: intl.get('hzero.common.view.serialNumber').d('序号'),
      name: 'number',
      type: 'number',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.supplierNames').d('供应商名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.addResult').d('添加结果'),
      name: 'result',
      type: 'string',
    },
  ],
});

export { MonitorListDS, getResultDetailDs, AddedBusinessListDS, BusinessListDS };
