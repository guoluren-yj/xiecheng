/**
 * 指标字典
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-21
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

/**
 * 指标列表
 * @returns
 */
const IndexListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'indexId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdps.indexDictionary.model.status`).d('状态'),
      name: 'status',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_ENABLED_LIST',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexType`).d('指标类型'),
      name: 'indexType',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_INDEX_TYPE',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexCode`).d('指标编码'),
      name: 'indexCode',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexName`).d('指标名称'),
      name: 'indexName',
      type: 'string',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.dataType`).d('数据类型'),
      name: 'dataType',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_DATA_TYPE',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexSource`).d('来源'),
      name: 'indexSource',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_SOURCE_LIST',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdps.indexDictionary.model.indexCode`).d('指标编码'),
      name: 'indexCode',
      type: 'string',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexName`).d('指标名称'),
      name: 'indexName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 指标详情 DS
 * @returns
 */
const IndexFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define/save-or-update`,
        data: {
          ...param,
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define/save-or-update`,
        data: {
          ...param,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdps.indexDictionary.model.status`).d('状态'),
      name: 'status',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_ENABLED_LIST',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexCode`).d('指标编码'),
      name: 'indexCode',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      required: true,
      maxLength: 180,
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexName`).d('指标名称'),
      name: 'indexName',
      type: 'intl',
      required: true,
      maxLength: 180,
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexType`).d('指标类型'),
      name: 'indexType',
      type: 'string',
      required: true,
      lookupCode: 'SDPS.INDEX_DICTIONARY_INDEX_TYPE',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.dataType`).d('数据类型'),
      name: 'dataType',
      type: 'string',
      required: true,
      maxLength: 20,
      lookupCode: 'SDPS.INDEX_DICTIONARY_DATA_TYPE',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexSource`).d('来源'),
      name: 'indexSource',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_SOURCE_LIST',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'number',
      required: true,
      max: 99999999999,
    },
    {
      name: 'tenantId',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 指标详情 平台级 DS
 * @returns
 */
const PlatformFormDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define/save-or-update`,
        data: {
          ...param,
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_PROCESS}/v1/index-define/save-or-update`,
        data: {
          ...param,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdps.indexDictionary.model.status`).d('状态'),
      name: 'status',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_ENABLED_LIST',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexType`).d('指标类型'),
      name: 'indexType',
      type: 'string',
      bind: 'indexObj.indexType',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexCode`).d('指标编码'),
      name: 'indexObj',
      type: 'object',
      required: true,
      lovCode: 'SDPS.RELEASE_INDEX_INFO',
    },
    {
      name: 'indexCode',
      bind: 'indexObj.indexCode',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexName`).d('指标名称'),
      name: 'indexName',
      type: 'intl',
      required: true,
      bind: 'indexObj.indexName',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.dataType`).d('数据类型'),
      name: 'dataType',
      type: 'string',
      required: true,
      bind: 'indexObj.dataType',
      lookupCode: 'SDPS.INDEX_DICTIONARY_DATA_TYPE',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.indexSource`).d('来源'),
      name: 'indexSource',
      type: 'string',
      lookupCode: 'SDPS.INDEX_DICTIONARY_SOURCE_LIST',
    },
    {
      label: intl.get(`sdps.indexDictionary.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'number',
      required: true,
      max: 99999999999,
    },
    {
      name: 'tenantId',
    },
  ],
  queryFields: [],
  events: {},
});

export { IndexListDS, IndexFormDS, PlatformFormDS };
