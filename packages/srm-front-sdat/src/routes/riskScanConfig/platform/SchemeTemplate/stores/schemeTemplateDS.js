/**
 * 供应商找关系页面
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2022-09-06
 * @Copyright: Copyright (c) 2022, Zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const tenantId = getCurrentOrganizationId();

/**
 * 监控列表DS
 * @returns
 */
const TemplateListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/wb2-risk-plans`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'riskPlanId',
  selection: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('sdat.schemeTemplate.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'number',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.schemeCode').d('方案编码'),
      name: 'planNumber',
      type: 'string',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.schemeDesc').d('方案标题'),
      name: 'planName',
      type: 'string',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.tenantCode').d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.chargePerson').d('负责人'),
    //   name: 'chargePerson',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.stakeholder').d('干系人'),
    //   name: 'stakeholder',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.scanFrequency').d('扫描频率'),
    //   name: 'scanFrequency',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.strategyConfig').d('扫描策略配置'),
    //   name: 'strategyConfig',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.scope').d('适用范围'),
    //   name: 'scope',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.schemeTemplate.model.yearConsumption').d('预计年消耗额'),
    //   name: 'yearConsumption',
    //   type: 'number',
    // },
    {
      label: intl.get('sdat.schemeTemplate.model.updateUser').d('最后更新人'),
      name: 'lastUpdatedUserName',
      type: 'string',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.updateTime').d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
    {
      name: 'tenantId',
    },
  ],
  events: {},
});

const LevelTableDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.riskLevelDefine.model.riskLevel').d('风险等级'),
      name: 'riskLevel',
      type: 'string',
    },
    {
      label: intl.get('sdat.riskLevelDefine.model.scoreRange').d('分值范围'),
      name: 'scoreRange',
      type: 'number',
      range: ['startScore', 'endScore'],
      min: 0,
      max: 100,
      step: 1,
    },
    {
      label: intl.get('sdat.riskLevelDefine.model.levelDesc').d('等级说明'),
      name: 'levelDescription',
      type: 'string',
    },
  ],
  events: {},
});

const BasicInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.schemeTemplate.model.tenantObj').d('租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      noCache: true,
      ignore: 'always',
      required: true,
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      name: 'tenantNum',
      bind: 'tenantObj.tenantNum',
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
    {
      label: intl.get('sdat.schemeTemplate.model.schemaCode').d('方案编码'),
      name: 'planNumber',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get('sdat.schemeTemplate.model.schemaDesc').d('方案描述'),
      name: 'planName',
      type: 'intl',
      required: true,
    },
  ],
  events: {},
});

const RatioFormDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'id',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskLevelDefine.model.greaterOrEqual`).d('大于等于'),
      name: 'equal',
      type: 'number',
      min: 0,
      max: 'lessThan',
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('sdat.riskLevelDefine.validate.message.lessThenAfter')
          .d('当前值必须小于后值'),
      },
    },
    {
      label: intl.get(`sdat.riskLevelDefine.model.lessThan`).d('小于'),
      name: 'lessThan',
      type: 'number',
      min: 'equal',
      max: 100,
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('sdat.riskLevelDefine.validate.message.largeThanBefore')
          .d('当前值必须大于前值'),
      },
    },
  ],
  events: {},
});

export { TemplateListDS, LevelTableDS, BasicInfoDS, RatioFormDS };
