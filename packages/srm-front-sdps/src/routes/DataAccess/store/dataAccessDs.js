/**
 * 数据接入管理DS文件（平台级）
 * @date: 2021-12-13
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';

const intlPrompt = 'sdps.dataAccess.view';
/**
 * getIndexResultDs:指标结果表单
 * @returns Dataset
 */
function getDataAccessDs() {
  return {
    selection: false, // 隐藏选择列
    autoQuery: true,
    fields: [
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceName`).d('服务名称'),
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceCode`).d('服务编码'),
      },
      {
        name: 'serviceSource',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceSource`).d('服务来源'),
      },
      {
        name: 'serviceRoute',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceRoute`).d('服务路由'),
      },
      {
        name: 'enableStatus',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.enableStatus`).d('状态'),
      },
      {
        name: 'operation',
        label: intl.get(`${intlPrompt}.title.operation`).d('操作'),
      },
    ],
    queryFields: [
      {
        name: 'serviceName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceName`).d('服务名称'),
      },
      {
        name: 'serviceCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.serviceCode`).d('服务编码'),
      },
      {
        name: 'serviceSource',
        type: 'object',
        label: intl.get(`${intlPrompt}.title.serviceSource`).d('服务来源'),
        lookupCode: 'SDPS.SERVICE.SOURCE',
        transformRequest: (value) => {
          return value && value.value;
        },
      },
      {
        name: 'enableStatus',
        type: 'object',
        label: intl.get(`${intlPrompt}.title.enableStatus`).d('状态'),
        lookupCode: 'SDPS.SERVICE.ENABLE.STATUS',
        transformRequest: (value) => {
          return value && value.value;
        },
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-service`,
          method: 'GET',
        };
      },
    },
  };
}

function getDimensionDs() {
  return {
    selection: false, // 隐藏选择列
    autoQuery: false,
    fields: [
      {
        name: 'dimensionalityCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dimensionalityCode`).d('维度编码'),
      },
      {
        name: 'dimensionalityName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dimensionalityName`).d('维度名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dataType`).d('数据类型'),
      },
    ],
    queryFields: [
      {
        name: 'dimensionalityCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dimensionalityCode`).d('维度编码'),
      },
      {
        name: 'dimensionalityName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dimensionalityCode`).d('维度名称'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-service/dimensionalityInfo/${data.serviceCode}`,
          method: 'GET',
        };
      },
    },
  };
}

function getIndexDs() {
  return {
    selection: false, // 隐藏选择列
    autoQuery: false,
    fields: [
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.indexCode`).d('指标编码'),
      },
      {
        name: 'indexName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.indexName`).d('指标名称'),
      },
      {
        name: 'dataType',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.dataType`).d('数据类型'),
      },
    ],
    queryFields: [
      {
        name: 'indexCode',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.indexCode`).d('指标编码'),
      },
      {
        name: 'indexName',
        type: 'string',
        label: intl.get(`${intlPrompt}.title.indexName`).d('指标名称'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/data-service/indexInfo/${data.serviceCode}`,
          method: 'GET',
        };
      },
    },
  };
}

export { getDataAccessDs, getDimensionDs, getIndexDs };
