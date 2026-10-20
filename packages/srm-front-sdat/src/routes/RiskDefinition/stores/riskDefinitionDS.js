/* eslint-disable no-param-reassign */
/**
 * 风险定义页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-07
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 风险定义 列表 DS
 * @returns
 */
const DefinitionListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  // selection: false,
  // paging: false,
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
      width: 120,
    },
    {
      label: intl.get(`sdat.riskDefinition.model.operation`).d('操作'),
      name: 'operation',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.defineName`).d('风险定义标题'),
      name: 'defineName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.applicationScope`).d('适用范围'),
      name: 'scope',
      type: 'string',
      lookupCode: 'SDAT.RISK_DEFINITION_SCOPE',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.applicationCompany`).d('适用公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.externalRiskItems`).d('外部风险项'),
      name: 'outerCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.businessRiskItems`).d('业务风险项'),
      name: 'businessCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.disasterRiskItems`).d('灾害风险项'),
      name: 'disasterCount',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lastUpdateUser`).d('最后更新人'),
      name: 'updateName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lastUpdateTime`).d('最后更新时间'),
      name: 'updateTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 外部风险 比率 Form 表单
 * @returns
 */
const RatioFormDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.greaterOrEqual`).d('大于等于'),
      name: 'equal',
      type: 'number',
      min: 0,
      max: 'lessThan',
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('sdat.riskDefinition.validate.message.lessThenAfter')
          .d('当前值必须小于后值'),
      },
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lessThan`).d('小于'),
      name: 'lessThan',
      type: 'number',
      min: 'equal',
      max: 100,
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('sdat.riskDefinition.validate.message.largeThanBefore')
          .d('当前值必须大于前值'),
      },
    },
  ],
  events: {},
});

/**
 * 天数指标表单
 * @returns
 */
const RatioDayFormDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.greaterOrEqual`).d('大于等于'),
      name: 'equal',
      type: 'number',
      min: 0,
      max: 'lessThan',
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('sdat.riskDefinition.validate.message.lessThenAfter')
          .d('当前值必须小于后值'),
      },
    },
    {
      label: intl.get(`sdat.riskDefinition.model.lessThan`).d('小于'),
      name: 'lessThan',
      type: 'number',
      min: 'equal',
      max: 9999,
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('sdat.riskDefinition.validate.message.largeThanBefore')
          .d('当前值必须大于前值'),
      },
    },
  ],
  events: {},
});

/**
 * 子账户选择列表
 * @returns
 */
const AccountListDS = () => ({
  pageSize: 20,
  primaryKey: 'id',
  cacheSelection: true,
  transport: {
    read: ({ data, params }) => {
      delete data.companyObj;
      delete params.companyObj;
      return {
        url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging`,
        params: {
          ...data,
          ...params,
        },
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 子账户展示列表
 * @returns
 */
const AccountViewListDS = () => ({
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define-theme-person/query-person`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.realName`).d('名称'),
      name: 'personName',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.realName`).d('名称'),
      name: 'personName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 配置列表
 * @returns
 */
const ConfigListDS = () => ({
  pageSize: 20,
  primaryKey: 'id',
  // selection: false,
  paging: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-event/process-rule-detail-by-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      if (data.length) {
        data.forEach((item) => {
          item.processAction =
            item.processConfig && Array.isArray(item.processConfig)
              ? item.processConfig.join(',')
              : '';
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-event/save-data`,
        data,
        method: 'POST',
      };
    },
    update: ({ data }) => {
      if (data.length) {
        data.forEach((item) => {
          item.processAction =
            item.processConfig && Array.isArray(item.processConfig)
              ? item.processConfig.join(',')
              : '';
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-event/save-data`,
        data,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskDefinition.model.levelOne`).d('一级分类'),
      name: 'oneCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.levelTwo`).d('二级分类'),
      name: 'twoCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.levelThere`).d('三级分类'),
      name: 'threeCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.levelFour`).d('四级分类'),
      name: 'fourCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.riskLevel`).d('风险等级'),
      name: 'executeExpression',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskDefinition.model.configItem`).d('配置项'),
      name: 'processConfig',
      type: 'string',
      lookupCode: 'SDAT.PROCESS_ACTION',
      multiple: true,
      optionsProps: (dsProps) => {
        const arr = dsProps?.data?.map((item) => {
          return {
            description: item.description,
            meaning: item.meaning,
            orderSeq: item.orderSeq,
            value: item.value,
          };
        });
        const filters = arr?.filter((item) => item?.value !== 'AUTO_RELEGATION');

        return {
          ...dsProps,
          data: [...filters],
        };
      },
    },
    {
      name: 'processAction',
    },
  ],
  queryFields: [],
  events: {},
});

export {
  DefinitionListDS,
  RatioFormDS,
  AccountListDS,
  AccountViewListDS,
  ConfigListDS,
  RatioDayFormDS,
};
