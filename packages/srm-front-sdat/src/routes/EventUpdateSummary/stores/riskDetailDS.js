/**
 * 风险定义页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-07
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 风险定义 适用范围列表 DS
 * @returns
 */
const ScopeListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/operate-logs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'companyId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      name: 'companyId',
    },
  ],
  events: {},
});

const SupplierListDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'companyId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.supplierCode`).d('供应商编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.supplierName`).d('供应商名称'),
      name: 'categoryDescription',
      type: 'string',
    },
    {
      name: 'companyId',
    },
  ],
  events: {},
});

/**
 * 风险定义 适用范围 新增数据lov弹窗DS
 * @returns
 */
const CompanyLovDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/company-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'companyId',
  autoQuery: true,
  // selectable: 'multiple',
  // cacheSelection: true,
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      name: 'companyId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskDefinition.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 风险定义 适用范围 新增数据lov弹窗 查询条件DS
 * @returns
 */
const CompanyLovFormDS = () => ({
  transport: {},
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.companyCodeOrName`).d('公司编码/名称'),
      name: 'searchContent',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 风险定义 供应商适用范围 新增数据lov弹窗DS
 * @returns
 */
const SupplierLovDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/event-generate-monitor/supplier-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  // autoQuery: true,
  // selectable: 'multiple',
  // cacheSelection: true,
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.supplierCode`).d('供应商编码'),
      name: 'categoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.supplierName`).d('供应商名称'),
      name: 'categoryDescription',
      type: 'string',
    },
    {
      name: 'categoryId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskDefinition.model.supplierCode`).d('供应商编码'),
      name: 'categoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.supplierName`).d('供应商名称'),
      name: 'categoryDescription',
      type: 'string',
    },
  ],
  events: {},
});

export { ScopeListDS, SupplierListDS, CompanyLovDS, SupplierLovDS, CompanyLovFormDS };
