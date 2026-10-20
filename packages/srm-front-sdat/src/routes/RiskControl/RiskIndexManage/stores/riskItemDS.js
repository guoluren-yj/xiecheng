/* eslint-disable no-param-reassign */
/*
 * @Description  风险项列表 DS
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2024-12-27 17:05:31
 * @Last Modified by: lqx(qingxiang.luo@going-link.com)
 * @Last Modified time: 2025-05-28 15:47:38
 */

import intl from 'utils/intl';
// import { isEmpty } from 'lodash';
import { SRM_DATA_SDAT } from '@/utils/config';

const loopTree = (data = []) => {
  if (data.length) {
    data.forEach((item) => {
      if (!(item.children && item.children.length)) {
        item.children = null;
      }

      if (item.children && item.children.length) {
        loopTree(item.children);
      }
    });
  }
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 风险项列表 DS
 * @returns
 */
const RiskItemListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      if (data?.itemName) {
        data.itemCode = data.itemName;
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items/query-tree`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
        transformResponse: (dataArr) => {
          const list = dataArr && isJSON(dataArr) ? JSON.parse(dataArr) : dataArr;

          if (Array.isArray(list) && list.length) {
            loopTree(list);
            return list;
          }

          return dataArr;
        },
      };
    },
  },
  pageSize: 20,
  primaryKey: 'riskItemId',
  selection: false,
  childrenField: 'children',
  // paging: 'server',
  expandField: 'expand',
  paging: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.name`).d('名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.code`).d('编码'),
      name: 'itemCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.sortNumber`).d('排序号'),
      name: 'sortNum',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.type`).d('类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.WB2_RISK_ITEM_TYPE',
    },
    {
      name: 'level',
    },
    {
      name: 'endFlag',
      label: intl.get(`sdat.riskItemConfig.model.isLastLevel`).d('是否末级'),
      type: 'number',
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.creationDate`).d('创建时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.dsMatchType`).d('风险项匹配类型'),
      name: 'dsMatchType',
      type: 'string',
      lookupCode: 'SDAT.WB2_RISK_ITEM_MATCH_TYPE',
    },
    { name: 'expand', type: 'boolean' },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskItemConfig.model.name`).d('名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
    // {
    //   label: intl.get(`sdat.riskItemConfig.model.creationDate`).d('创建时间'),
    //   name: 'creationDate',
    //   type: 'dateTime',
    // },
  ],
  events: {},
});

/**
 * 风险项 目录 DS
 * @returns
 */
const RiskMenuDetailDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  autoCreate: true,
  forceValidate: true,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items/${data.riskItemId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items`,
        data,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.code`).d('编码'),
      name: 'itemCode',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.name`).d('名称'),
      name: 'itemName',
      type: 'intl',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.sortNumber`).d('排序号'),
      name: 'sortNum',
      type: 'number',
      step: 1,
      min: 0,
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.type`).d('类型'),
      name: 'type',
      type: 'string',
      lookupCode: 'SDAT.WB2_RISK_ITEM_TYPE',
    },
    {
      name: 'endFlag',
      label: intl.get(`sdat.riskItemConfig.model.isLastLevel`).d('是否末级'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.parentCode`).d('上级编码'),
      name: 'parentCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.parentName`).d('上级名称'),
      name: 'parentName',
      type: 'intl',
    },
    {
      name: 'parentId',
    },
  ],
  events: {},
});

/**
 * 风险项 DS
 * @returns
 */
const RiskDetailDS = () => ({
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  autoCreate: true,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items/${data.riskItemId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-items`,
        data,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskItemConfig.model.riskCode`).d('风险项编码'),
      name: 'itemCode',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.riskName`).d('风险项名称'),
      name: 'itemName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.dsMatchType`).d('风险项匹配类型'),
      name: 'dsMatchType',
      type: 'string',
      required: true,
      lookupCode: 'SDAT.WB2_RISK_ITEM_MATCH_TYPE',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.sortNumber`).d('排序号'),
      name: 'sortNum',
      type: 'number',
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.type`).d('风险类型'),
      name: 'dsType',
      type: 'string',
      lookupCode: 'SDAT.WB2_RISK_ITEM_DS_TYPE',
      required: true,
      // noCache: true,
      lookupAxiosConfig: () => {
        return {
          url: `/hpfm/v1/lovs/data?lovCode=SDAT.WB2_RISK_ITEM_DS_TYPE&_time=${Date.now()}`,
          method: 'GET',
          transformResponse: (data) => {
            // 处理数据
            const list = data ? JSON.parse(data) : [];
            return list.filter((item) => item.value !== 'CUS');
          },
        };
      },
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.indexCode`).d('指标编码'),
      name: 'dsRuleCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('dsType') === 'BIZ';
        },
      },
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.scope`).d('适用范围'),
      name: 'applyScope',
      type: 'string',
      lookupCode: 'SDAT.WB2_RISK_ITEM_SCOPE',
      required: true,
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.standardFlag`).d('是否标准'),
      name: 'standardFlag',
      type: 'string',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '0',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.scopeTenantList`).d('适用租户'),
      name: 'tenantList',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      noCache: true,
      ignore: 'always',
      multiple: true,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('standardFlag') === '0';
        },
      },
    },
    {
      name: 'tenantIds',
      bind: 'tenantList.tenantId',
    },
    {
      label: intl.get('sdat.riskItemConfig.model.service').d('服务'),
      name: 'serviceObj',
      type: 'object',
      lovCode: 'HADM.SERVICE',
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('dsType') === 'ITF';
        },
      },
    },
    {
      name: 'dsServiceCode',
      bind: 'serviceObj.serviceCode',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.interfaceAddress`).d('调用接口地址'),
      name: 'dsUrl',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('dsType') === 'ITF';
        },
      },
    },
  ],
  events: {},
});

export { RiskItemListDS, RiskMenuDetailDS, RiskDetailDS };
