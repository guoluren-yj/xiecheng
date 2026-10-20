/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

const isJSON = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * 风险定义 列表 DS
 * @returns
 */
const DefineListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'defineId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.status`).d('状态'),
      name: 'enabledFlag',
      type: 'number',
      width: 100,
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.operation`).d('操作'),
      name: 'operation',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.schemeCode`).d('方案编码'),
      name: 'planNumber',
      type: 'string',
    },
    {
      name: 'autoFlag',
      label: intl.get(`sdat.riskScanConfig.model.scanningMethod`).d('扫描方式'),
      type: 'string',
      lookupCode: 'SDAT.WB2_SCAN_PLAN_TRIGGER_MODE',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.planCompanyType`).d('方案企业类型'),
      name: 'planCompanyType',
      type: 'string',
      lookupCode: 'SDAT.WB2_MONITOR_PLAN_TYPE',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.schemeName`).d('方案标题'),
      name: 'planName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.chargePerson`).d('负责人'),
      name: 'chargePerson',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.stakeholder`).d('干系人'),
      name: 'stakeholder',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.strategyConfig1`).d('策略配置'),
      name: 'planStrategy',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.applicationScope`).d('适用范围'),
      name: 'scanScopeType',
      type: 'string',
      lookupCode: 'SDAT.WB2_SCAN_SCOPE_TYPE',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.addType`).d('扫描对象添加方式'),
      name: 'scanObjectType',
      type: 'string',
      lookupCode: 'SDAT.WB2_SCAN_OBJECT_TYPE',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.strategyConfig`).d('扫描策略配置'),
      name: 'autoFrequency',
      type: 'string',
      lookupCode: 'SDAT.WB2_SCAN_PLAN_FREQUENCY_TYPE',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.scanFrequency`).d('扫描频率'),
      name: 'frequencyValue',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.yearConsumption`).d('预计年消耗额'),
      name: 'yearConsumption',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.lastUpdateUser`).d('最后更新人'),
      name: 'lastUpdatedUserName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.lastUpdateTime`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
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
        data.forEach(item => {
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
        data.forEach(item => {
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
      label: intl.get(`sdat.riskScanConfig.model.levelOne`).d('一级分类'),
      name: 'oneCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.levelTwo`).d('二级分类'),
      name: 'twoCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.levelThere`).d('三级分类'),
      name: 'threeCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.levelFour`).d('四级分类'),
      name: 'fourCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.riskLevel`).d('风险等级'),
      name: 'executeExpression',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.configItem`).d('配置项'),
      name: 'processConfig',
      type: 'string',
      lookupCode: 'SDAT.PROCESS_ACTION',
      multiple: true,
      optionsProps: dsProps => {
        const arr = dsProps?.data?.map(item => {
          return {
            description: item.description,
            meaning: item.meaning,
            orderSeq: item.orderSeq,
            value: item.value,
          };
        });
        const filters = arr?.filter(item => item?.value !== 'AUTO_RELEGATION');

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

/**
 * 基础信息
 * @returns
 */
const BasicInfoDS = () => ({
  transport: {},
  pageSize: 20,
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.schemeCode`).d('方案编码'),
      name: 'planNumber',
      type: 'string',
      pattern: '^[a-zA-Z][a-zA-Z0-9_]*$',
      maxLength: 30,
      required: true,
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.schemeName`).d('方案标题'),
      name: 'planName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.planCompanyType`).d('方案企业类型'),
      name: 'planCompanyType',
      type: 'string',
      required: true,
      lookupCode: 'SDAT.WB2_MONITOR_PLAN_TYPE',
      defaultValue: 'DOMESTIC',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.chargePerson`).d('负责人'),
      name: 'chargeList',
      type: 'object',
      lovCode: 'SDAT.RISK_SCAN_CONFIG_V2_USER_LIST',
      ignore: 'always',
      noCache: true,
      multiple: true,
      required: true,
      dynamicProps: {
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging?asyncCountFlag=1`,
            method: 'POST',
          };
        },
      },
    },
    {
      name: 'chargeUserId',
      bind: 'personObj.id',
    },
    {
      name: 'chargeRealName',
      bind: 'personObj.realName',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.stakeholder`).d('干系人'),
      name: 'stakeholderList',
      type: 'object',
      lovCode: 'SDAT.RISK_SCAN_CONFIG_V2_USER_LIST',
      ignore: 'always',
      noCache: true,
      multiple: true,
      dynamicProps: {
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging?asyncCountFlag=1`,
            method: 'POST',
          };
        },
      },
    },
    {
      name: 'stakeholder',
      bind: 'stakeholderObj.id',
    },
    {
      name: 'stakeholderRealName',
      bind: 'personObj.realName',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.notifyFlag`).d('生成事件时通知负责人'),
      name: 'notifyFlag',
      type: 'string',
      lookupCode: 'SDAT.WB2_NOTIFY_CHARGE',
    },
  ],
  events: {},
});

const ScanSchemeDS = () => ({
  transport: {},
  pageSize: 20,
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.addType`).d('扫描对象添加方式'),
      name: 'scanObjectType',
      type: 'string',
      lookupCode: 'SDAT.WB2_SCAN_OBJECT_TYPE',
      required: true,
    },
  ],
  events: {},
});

/**
 * 添加类型，供应商树形
 * @returns
 */
const SupplierTreeListDS = () => ({
  transport: {
    // read: ({ data, params }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/supplier-list?tenantId=${getCurrentOrganizationId()}`,
    //     params: {
    //       ...data,
    //       ...params,
    //     },
    //     method: 'GET',
    //   };
    // },
  },
  pageSize: 20,
  primaryKey: 'categoryId',
  autoQuery: true,
  selectable: 'multiple',
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeCode`).d('供应商分类编码'),
      name: 'supplierTypeCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
      name: 'supplierTypeName',
      type: 'string',
    },
    {
      name: 'categoryId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeCode`).d('供应商分类编码'),
      name: 'supplierTypeCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
      name: 'supplierTypeName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 添加类型，供应商树形
 * @returns
 */
const PurchaserDS = () => ({
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
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.accountCode`).d('子账户编码'),
      name: 'accountCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.name`).d('名称'),
      name: 'name',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 供应商分类-查看供应商
 * @returns
 */
const TypeSupplierListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/query-category-supplier`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
    //     data,
    //     method: 'POST',
    //   };
    // },
  },
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeCode`).d('供应商分类编码'),
      name: 'supplierCategoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
      name: 'supplierCategoryDescription',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
      name: 'supplierCompanyNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'unifiedSocialCode',
      type: 'string',
    },
    {
      name: 'companyId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
      name: 'supplierTypeName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.creationTime`).d('创建时间'),
      name: 'creationTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 已合作供应商列表
 * @returns
 */
// const CooperatedListDS = () => ({
//   transport: {
//     read: ({ data, params }) => {
//       return {
//         url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define`,
//         params: {
//           ...data,
//           ...params,
//         },
//         method: 'GET',
//       };
//     },
//     destroy: ({ data }) => {
//       return {
//         url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
//         data,
//         method: 'POST',
//       };
//     },
//   },
//   selection: false,
//   pageSize: 20,
//   fields: [
//     {
//       label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
//       name: 'companyCode',
//       type: 'string',
//     },
//     {
//       label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
//       name: 'companyName',
//       type: 'string',
//     },
//     {
//       label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
//       name: 'socialCode',
//       type: 'string',
//     },
//   ],
//   queryFields: [],
//   events: {},
// });

const AccountListDS = () => ({
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
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.purchaser`).d('采购员'),
      name: 'purchaser',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.purchaser`).d('采购员'),
      name: 'purchaser',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.creationTime`).d('创建时间'),
      name: 'creationTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

const HandListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/risk-plan-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
        transformResponse: dataObj => {
          const obj = dataObj && isJSON(dataObj) ? JSON.parse(dataObj) : dataObj;
          const { wb2RiskPlanObjectPage = {} } = obj || {};
          return {
            content: [],
            ...wb2RiskPlanObjectPage,
            originData: { ...obj },
          };
        },
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
    //     data,
    //     method: 'POST',
    //   };
    // },
  },
  pageSize: 20,
  fields: [
    { name: 'scanObjectId' },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
      name: 'supplierCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeCode`).d('供应商分类编码'),
      name: 'categoryCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierTypeName`).d('供应商分类名称'),
      name: 'categoryName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  events: {},
});

const SelectHandListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/query-supplier`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
    //     data,
    //     method: 'POST',
    //   };
    // },
  },
  pageSize: 20,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
      name: 'supplierCompanyNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'unifiedSocialCode',
      type: 'string',
    },
  ],
  events: {},
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'unifiedSocialCode',
      type: 'string',
    },
  ],
});

const OuterListDS = () => ({
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
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.businessName`).d('企业名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  events: {},
});

const LevelTableDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.riskScanConfig.model.riskLevel').d('风险等级'),
      name: 'riskLevel',
      type: 'string',
    },
    {
      label: intl.get('sdat.riskScanConfig.model.scoreRange').d('分值范围'),
      name: 'scoreRange',
      type: 'number',
      range: ['startScore', 'endScore'],
      min: 0,
      max: 100,
      step: 1,
    },
    {
      label: intl.get('sdat.riskScanConfig.model.levelDesc').d('等级说明'),
      name: 'levelDescription',
      type: 'string',
    },
  ],
  events: {},
});

const SelectScopeListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/risk-plan-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
        transformResponse: dataObj => {
          const obj = dataObj && isJSON(dataObj) ? JSON.parse(dataObj) : dataObj;
          const { wb2RiskPlanScopePage } = obj || {};
          return {
            content: [],
            ...wb2RiskPlanScopePage,
            originData: { ...obj },
          };
        },
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: 'multiple',
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyCode`).d('公司编码'),
      name: 'companyNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      name: 'scopeObjectId',
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
        // url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/company-list?tenantId=${getCurrentOrganizationId()}`,
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/risk-plan-scope-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'POST',
      };
    },
  },
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'companyId',
  selectable: 'multiple',
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyCode`).d('公司编码'),
      name: 'companyNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      name: 'companyId',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyCode`).d('公司编码'),
      name: 'companyNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
  ],
  events: {},
});

const RatioFormDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'id',
  autoCreate: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.greaterOrEqual`).d('大于等于'),
      name: 'equal',
      type: 'number',
      min: 0,
      max: 'lessThan',
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('sdat.riskScanConfig.validate.message.lessThenAfter')
          .d('当前值必须小于后值'),
      },
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.lessThan`).d('小于'),
      name: 'lessThan',
      type: 'number',
      min: 'equal',
      max: 100,
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('sdat.riskScanConfig.validate.message.largeThanBefore')
          .d('当前值必须大于前值'),
      },
    },
  ],
  events: {},
});

const SupplierListDS = () => ({
  transport: {},
  pageSize: 20,
  primaryKey: 'companyId',
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierCode`).d('供应商编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.supplierName`).d('供应商名称'),
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
 * 监控对象列表
 * @returns
 */
const BusinessListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/monitor-plan-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      name: 'companyId',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.isEnabled`).d('是否有效'),
      name: 'effectiveFlag',
      type: 'string',
      lookupCode: 'HPFM.EFFECTIVE_FLAG',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 监控对象添加列表
 * @returns
 */
const BusinessAddDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-plans/tenant-monitor-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.companyCode`).d('公司编码'),
      name: 'companyCode',
      type: 'string',
    },
    {
      name: 'companyId',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskScanConfig.model.companyName`).d('公司名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.uscc`).d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
  ],
  events: {},
});

export {
  DefineListDS,
  ConfigListDS,
  BasicInfoDS,
  ScanSchemeDS,
  SupplierTreeListDS,
  PurchaserDS,
  TypeSupplierListDS,
  AccountListDS,
  HandListDS,
  SelectHandListDS,
  OuterListDS,
  LevelTableDS,
  SelectScopeListDS,
  CompanyLovDS,
  RatioFormDS,
  SupplierListDS,
  BusinessListDS,
  BusinessAddDS,
};
