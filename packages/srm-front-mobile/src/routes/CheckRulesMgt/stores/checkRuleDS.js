/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';
import { fetFieldsList, fetchVisibleRoleList } from '@/services/checkRuleService';

const organizationId = getCurrentOrganizationId();

/**
 * 去除文本中的 fieldPrefix 部分
 * @param {string} text - 原始文本
 * @param {Array} fieldsList - 字段列表
 * @returns {string} 处理后的文本
 */
const removeFieldPrefix = (text) => {
  // 不再移除 prefix，以保留 fieldPrefix_fieldCode 供高亮匹配使用，避免同名字段歧义
  return text;
};

const formatQueryList = (list, alertFields) => {
  if (list && list.length && alertFields && alertFields.length) {
    // 处理规则数据，不再去除 ruleScope 和 ruleDetail 中的 fieldPrefix
    list.forEach((record) => {
      if (record) {
        // 处理 ruleScope
        if (record.ruleScope) {
          const processedRuleScope = removeFieldPrefix(record.ruleScope);
          record.ruleScope = processedRuleScope;
        }

        // 处理 ruleDetail
        if (record.ruleDetail) {
          const processedRuleDetail = removeFieldPrefix(record.ruleDetail);
          record.ruleDetail = processedRuleDetail;
        }
      }
    });
  }
  return list;
};

/**
 * 流程单据表单
 * @returns
 */
const ProcessDocDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/document-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-document`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-document`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  forceValidate: true,
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.processDocCode`).d('流程单据编码'),
      name: 'documentCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z][A-Z0-9._]*$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocName`).d('流程单据名称'),
      name: 'documentName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocDesc`).d('流程单据描述'),
      name: 'documentDesc',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocBindObj`).d('绑定业务对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
      // required: true,
    },
    // {
    //   label: intl.get(`smbl.checkRules.model.processDocBindObj`).d('绑定业务对象'),
    //   name: 'processDocBindObj',
    //   type: 'object',
    //   lovCode: 'HMDE.BUSINESS_OBJECT',
    //   ignore: 'always',
    //   noCache: true,
    //   required: true,
    // },
    // {
    //   name: 'businessObjectId',
    //   bind: 'processDocBindObj.businessObjectId',
    // },
    {
      name: 'tenantId',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'number',
      step: 1,
    },
    {
      label: intl.get(`smbl.checkRules.model.moduleCode`).d('单据所属模块'),
      name: 'moduleCode',
      type: 'string',
      lookupCode: 'SMBL_AI_CHECK_SERVICE',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return organizationId !== 0 && record.get('preDefine') === 1;
        },
      },
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 流程分类表单
 * @returns
 */
const ProcessCategoryDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/category-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
        transformResponse: async (res) => {
          const obj = getResponse(res) || {};
          const roleRes = await fetchVisibleRoleList({ ids: obj?.roleId });
          const { content = [] } = roleRes || {};
          const roleIds = obj?.roleId?.split(',') || [];

          const roleObj = [];
          if (content?.length && roleIds?.length) {
            content.forEach((item) => {
              roleIds.forEach((id) => {
                if (id === item.id) {
                  roleObj.push({
                    id: item.id,
                    roleName: item.roleName,
                  });
                }
              });
            });
          }

          const newObj = { ...obj, roleIds, roleObj };

          return { ...newObj };
        },
      };
    },
    create: ({ data }) => {
      const obj = data[0] || {};
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-category`,
        data: { ...obj, roleId: obj?.roleIds?.join(',') },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const obj = data[0] || {};
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-category`,
        data: { ...obj, roleId: obj?.roleIds?.join(',') },
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.processCategoryCode`).d('流程分类编码'),
      name: 'categoryCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z][A-Z0-9._]*$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.processCategoryName`).d('流程分类名称'),
      name: 'categoryName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.scopeTitleDef`).d('审核范围定义'),
      name: 'scopeTitle',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.scopeTitleDef`).d('审核范围定义'),
      name: 'scopeTitleStr',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.visibleRoleList`).d('可见角色清单'),
      name: 'roleObj',
      type: 'object',
      lovCode: 'SMBL_PURCHASE_ENABLE_ROLE',
      noCache: true,
      multiple: true,
    },
    {
      name: 'roleIds',
      bind: 'roleObj.id',
    },
    {
      label: intl.get(`smbl.checkRules.model.sortNumber`).d('排序号'),
      name: 'sort',
      type: 'number',
      step: 1,
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 流程变量
 * @returns
 */
const ProcessParamsDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/delete`,
      data,
      method: 'POST',
    }),
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
      name: 'fieldName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.objectName`).d('所属对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldSource`).d('字段来源'),
      name: 'fieldType',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
    },
    {
      label: intl.get(`smbl.checkRules.model.source`).d('来源'),
      name: 'tenantId',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`smbl.checkRules.model.fieldNameOrCode`).d('字段名称或编码'),
      name: 'keyword',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.objectName`).d('所属对象'),
      name: 'fieldType',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
      name: 'fieldName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.createTime`).d('创建时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
  ],
  events: {},
});

/**
 * 流程变量表单
 * @returns
 */
const ProcessParamsFormDS = () => ({
  transport: {
    // read: ({ data, params }) => {
    //   return {
    //     url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/risk-define/supplier-list`,
    //     params: {
    //       ...data,
    //       ...params,
    //     },
    //     method: 'GET',
    //   };
    // },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/add`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/update`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.fieldSource`).d('字段来源'),
      name: 'fieldType',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
      name: 'fieldName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.objectName`).d('所属对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') !== 'CUSTOM';
        },
      },
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') === 'CUSTOM';
        },
      },
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCodeSelect',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') !== 'CUSTOM';
        },
      },
    },

    {
      label: intl.get(`smbl.checkRules.model.fieldValueSet`).d('字段值集'),
      name: 'fieldValueSetObj',
      type: 'object',
      lovCode: 'SPFM.LOV.LOV_DETAIL.ORG',
      noCache: true,
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldProperty') === 'LOV';
        },
      },
    },
    {
      name: 'lovCode',
      bind: 'fieldValueSetObj.lovCode',
    },
    {
      name: 'lovType',
      bind: 'fieldValueSetObj.lovTypeCode',
    },
    {
      name: 'lovName',
      bind: 'fieldValueSetObj.lovName',
    },
    {
      name: 'fieldPrefix',
    },
    {
      label: intl.get(`hzero.common.fieldType`).d('字段类型'),
      name: 'fieldProperty',
      type: 'string',
      required: true,
      lookupCode: 'SMBL.CHECK_RULES_FIELD_PROPERTY',
      defaultValue: 'NORMAL',
    },
    {
      label: intl.get(`smbl.checkRules.model.batchQueryFlag`).d('是否批量查询'),
      name: 'batchQueryFlag',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldProperty') === 'LOV';
        },
      },
      lookupCode: 'HPFM.FLAG.NEW',
      defaultValue: '0',
      help: intl
        .get(`smbl.checkRules.model.batchQueryFlag.helpMsg`)
        .d('开启进行批量查询，值集本身需支持批量查询'),
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 规则列表
 * @returns
 */
const RulesListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const { documentCode = '' } = data;
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
        transformResponse: async (value) => {
          let dataObj = {};
          try {
            dataObj = JSON.parse(value);
          } catch (error) {
            dataObj = {};
          }

          const { content = [] } = dataObj;
          let alertFieldsList = [];

          const res = await fetFieldsList({
            documentCode,
          });

          if (getResponse(res)) {
            const fields = res?.content ?? [];

            const formatFields = fields.map((item) => ({
              ...item,
              label: item?.fieldCode,
              value: item?.fieldName,
            }));

            alertFieldsList = [...formatFields];
          }

          const newContent = formatQueryList(content, alertFieldsList);
          return {
            ...dataObj,
            content: newContent,
          };
        },
      };
    },
  },
  pageSize: 20,
  selection: 'multiple',
  autoQuery: false,
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
      name: 'ruleCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
      name: 'ruleTarget',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_TARGET',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围'),
      name: 'ruleScope',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetailStr',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`smbl.checkRules.model.ruleNameOrCode`).d('规则名称或编码'),
      name: 'keyword',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
      name: 'ruleCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.createTime`).d('创建时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
      name: 'ruleTarget',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_TARGET',
    },
    {
      label: intl.get(`smbl.checkRules.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
  ],
  events: {},
});

/**
 * 规则表单
 * @returns
 */
const RuleFormDS = () => ({
  transport: {
    // read: ({ data, params }) => {
    //   return {
    //     url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/risk-define/supplier-list`,
    //     params: {
    //       ...data,
    //       ...params,
    //     },
    //     method: 'GET',
    //   };
    // },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/add-rule`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/update-rule`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
      name: 'ruleCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z][A-Z0-9._]*$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
      name: 'ruleTarget',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_TARGET',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围'),
      name: 'ruleScope',
      type: 'string',
      // required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetailStr',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.referFileFlag`).d('审核附件'),
      name: 'referFileFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      help: intl
        .get(`smbl.checkRules.model.referFileFlagHelp`)
        .d('开启表示审核附件，关闭表示不审核附件'),
    },
  ],
  queryFields: [
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 可见角色列表
 * @returns
 */
const VisibleRoleListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/delete`,
      data,
      method: 'POST',
    }),
  },
  pageSize: 10,
  paging: false,
  // primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.tenantName`).d('角色名称'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'SMBL_PURCHASE_ENABLE_ROLE',
      noCache: true,
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.tenantCode`).d('角色编码'),
      name: 'roleCode',
      type: 'string',
      bind: 'tenantObj.roleCode',
    },
    {
      name: 'roleName',
      bind: 'tenantObj.roleName',
    },
    {
      name: 'roleId',
      bind: 'tenantObj.id',
    },
  ],
  queryFields: [],
  events: {},
});

export {
  ProcessDocDS,
  ProcessCategoryDS,
  ProcessParamsDS,
  ProcessParamsFormDS,
  RulesListDS,
  RuleFormDS,
  VisibleRoleListDS,
};
