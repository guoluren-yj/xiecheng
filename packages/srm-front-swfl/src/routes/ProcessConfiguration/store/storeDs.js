/**
 * store - 审批流配置ds
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import moment from 'moment';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId, getCurrentTenant, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';

const currentOrganizationId = getCurrentOrganizationId();
const currentOrganization = getCurrentTenant();
const isTenantRoleLevelFlag = isTenantRoleLevel();

function getProcessDocumentFields() {
  return [
    {
      label: intl.get(`hwfp.common.model.common.documentCode`).d('流程单据编码'),
      name: 'documentCode',
      type: 'string',
      required: true,
      format: 'uppercase',
    },
    {
      label: intl.get(`hwfp.common.model.common.documentDescription`).d('流程单据描述'),
      name: 'description',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      required: true,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'model',
      type: 'object',
      label: intl.get('hwfp.common.model.common.Modal').d('组合业务对象'),
      lovCode: 'HMDE.BUSINESS_COMBINE.LIST',
      ignore: 'always',
      lovPara: {
        tenantId: currentOrganizationId,
      },
    },
    {
      name: 'modelName',
      type: 'string',
      bind: 'model.businessObjectName',
    },
    {
      name: 'modelCode',
      type: 'string',
      bind: 'model.businessObjectCode',
    },
  ];
}

function getProcessCategoriesFields(createFlag) {
  return [
    {
      label: intl.get('hwfp.categories.model.categories.categoryCode').d('流程分类编码'),
      name: 'categoryCode',
      type: 'string',
      format: 'uppercase',
      required: true,
      computedProps: {
        disabled: ({ record }) => record.get('categoryId') || record.get('category'),
        bind: ({ record }) => (record.get('category') ? 'category.categoryCode' : ''),
      },
    },
    {
      label: intl.get('hwfp.categories.model.categories.description').d('流程分类描述'),
      name: createFlag ? 'categoryDescription' : 'description',
      type: 'intl',
      required: true,
      computedProps: {
        disabled: ({ record }) => record.get('category'),
        bind: ({ record }) => (record.get('category') ? 'category.description' : ''),
      },
    },
    {
      name: 'categoryId',
      computedProps: {
        bind: ({ record }) => (record.get('category') ? 'category.categoryId' : ''),
      },
    },
    {
      name: 'model',
      type: 'object',
      label: intl.get('hwfp.common.model.common.Modal').d('组合业务对象'),
      lovCode: 'HMDE.BUSINESS_COMBINE.LIST',
      ignore: 'always',
      lovPara: {
        tenantId: currentOrganizationId,
      },
    },
    {
      name: 'modelName',
      type: 'string',
      bind: 'model.businessObjectName',
    },
    {
      name: 'modelCode',
      type: 'string',
      bind: 'model.businessObjectCode',
    },
    {
      label: intl.get('hzero.common.status.enable').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      required: true,
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ];
}

export function getProcessDocumentConfig() {
  return {
    fields: [
      ...getProcessDocumentFields(),
      {
        label: intl.get('hwfp.common.model.common.cuszDocCode').d('单据样式编码'),
        name: 'cuszDoc',
        type: 'object',
        lovCode: 'HPFM.CUSZ.DOC_LIST',
        ignore: 'always',
      },
      {
        name: 'cuszDocCode',
        type: 'string',
        bind: 'cuszDoc.docCode',
      },
      {
        name: 'cuszDocName',
        type: 'string',
        bind: 'cuszDoc.docName',
      },
      {
        name: 'orderSeq',
        type: 'number',
        label: intl.get('hzero.common.view.orderSeq').d('排序号'),
        step: 1,
        min: 1,
        precision: 0,
      },
    ],
  };
}

export function getProcessCategoriesConfig() {
  return {
    fields: [
      {
        label: intl.get(`hwfp.common.model.common.documentCode`).d('流程单据编码'),
        name: 'documentCode',
        required: true,
        type: 'string',
        format: 'uppercase',
      },
      {
        label: intl.get(`hwfp.common.model.common.documentDescription`).d('流程单据描述'),
        name: 'description',
        required: true,
        type: 'intl',
      },
      {
        label: intl.get('hwfp.categories.model.categories.category').d('选择流程分类'),
        name: 'category',
        type: 'object',
        lovCode: 'HWFP.PROCESS_CATEGORY',
        lovPara: {
          tenantId: currentOrganizationId,
        },
      },
      {
        label: intl.get('hwfp.common.model.common.cuszDocCode').d('单据样式编码'),
        name: 'cuszDoc',
        type: 'object',
        lovCode: 'HPFM.CUSZ.DOC_LIST',
        ignore: 'always',
      },
      {
        name: 'cuszDocCode',
        type: 'string',
        bind: 'cuszDoc.docCode',
      },
      {
        name: 'cuszDocName',
        type: 'string',
        bind: 'cuszDoc.docName',
      },
      {
        name: 'orderSeq',
        type: 'number',
        label: intl.get('hzero.common.view.orderSeq').d('排序号'),
      },
      ...getProcessCategoriesFields(true),
    ],
  };
}

export function getProcessCategoriesEditConfig() {
  return {
    fields: getProcessCategoriesFields(false),
  };
}

export function getDocumentInfoFormConfig() {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    fields: [
      ...getProcessDocumentFields(),
      {
        name: 'sourceParentName',
        type: 'string',
        label: intl.get('hwfp.common.model.common.sourceParentName').d('复制自流程单据'),
      },
      {
        name: 'source',
        type: 'string',
        label: intl.get('hzero.common.source').d('来源'),
      },
      {
        label: intl.get('hwfp.common.model.common.cuszDocCode').d('单据样式编码'),
        name: 'cuszDoc',
        type: 'object',
        lovCode: 'HPFM.CUSZ.DOC_LIST',
        ignore: 'always',
      },
      {
        name: 'cuszDocCode',
        type: 'string',
        bind: 'cuszDoc.docCode',
      },
      {
        name: 'cuszDocName',
        type: 'string',
        bind: 'cuszDoc.docName',
      },
      {
        name: 'orderSeq',
        type: 'number',
        label: intl.get('hzero.common.view.orderSeq').d('排序号'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/process/documents/detail`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

export function getProcessVariableConfig() {
  return {
    autoQuery: false,
    autoCreate: false,
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get('hwfp.common.model.common.fieldType').d('字段来源'),
        name: 'fieldType',
        type: 'string',
        required: true,
        defaultValue: 'customize',
        transformResponse: (_, object) => {
          return object.modelCode ? 'model' : 'customize';
        },
        computedProps: {
          disabled: ({ record }) => !!record.get('variableId'),
        },
      },
      {
        label: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
        name: 'variableName',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
        name: 'description',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.variableType').d('字段类型'),
        name: 'variableType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.VARIABLE_TYPE',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.componentType').d('组件类型'),
        name: 'componentType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
        required: true,
        computedProps: {
          disabled: ({ record }) => {
            return !!(record.get('fieldType') === 'model');
          },
        },
      },
      {
        label: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
        name: 'sourceLov',
        type: 'object',
        lovCode: 'SPFM.LOV.LOV_VIEW_CODE.ORG',
        required: true,
        ignore: 'always',
        textField: 'lovCode',
        valueField: 'lovCode',
        computedProps: {
          disabled: ({ record }) => {
            return (
              record.get('fieldType') === 'model' ||
              (record.get('componentType') !== 'SINGLE_LOV' &&
                record.get('componentType') !== 'SINGLE_SELECT' &&
                record.get('componentType') !== 'RADIO')
            );
          },
          required: ({ record }) => {
            return (
              record.get('componentType') === 'SINGLE_LOV' ||
              record.get('componentType') === 'SINGLE_SELECT' ||
              record.get('componentType') === 'RADIO'
            );
          },
          lovCode: ({ record }) => {
            if (
              record.get('componentType') === 'SINGLE_SELECT' ||
              record.get('componentType') === 'RADIO'
            ) {
              return getCurrentOrganizationId === 0
                ? 'HPFM.LOV.LOV_DETAIL_CODE'
                : 'HPFM.LOV.LOV_DETAIL_CODE.ORG';
            } else {
              return 'SPFM.LOV.LOV_VIEW_CODE.ORG';
            }
          },
        },
      },
      {
        name: 'lovCode',
        bind: 'sourceLov.lovCode',
        type: 'string',
        label: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
      },
      {
        name: 'lovCodeMeaning',
        bind: 'sourceLov.lovCodeMeaning',
        type: 'string',
      },
      {
        label: intl.get(`hzero.common.status.requiredFlag`).d('是否必输'),
        name: 'requiredFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        required: true,
        defaultValue: 0,
      },
      {
        label: intl.get('hwfp.common.model.common.sourceView').d('所属业务对象'),
        name: 'modelName',
        type: 'string',
        disabled: true,
        computedProps: {
          required: ({ record }) => {
            return !!(record.get('fieldType') === 'model');
          },
        },
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
      {
        name: 'variablePath',
        type: 'string',
      },
      {
        name: 'businessObjectRelationFieldId',
        type: 'string',
      },
      {
        name: 'businessObjectCode',
        type: 'string',
      },
      {
        name: 'businessObjectFieldCode',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { documentId, sourceType = 'DOCUMENT' } = data;
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/process/variables/${documentId}/${sourceType}/list`,
          method: 'GET',
          data: {
            ...data,
            tenantId: currentOrganizationId,
          },
        };
      },
    },
    events: {
      update: ({ record, name }) => {
        if (name === 'fieldType') {
          record.set('variableName', '');
          record.set('description', '');
          record.set('variableType', '');
          record.set('componentType', '');
          record.set('lovCode', {});
          record.set('modelName', '');
        } else if (name === 'componentType') {
          record.set('sourceLov', {});
        }
      },
    },
  };
}

export function getProcessFormConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'checkValue',
        type: 'string',
        label: intl.get('hwfp.common.form.common.formSource').d('表单来源'),
        defaultValue: 'customize',
        transformResponse: (_, object) => {
          if (object && object.cuszStageCode) {
            return 'cuszStage';
          } else {
            return 'customize';
          }
        },
        computedProps: {
          disabled: ({ record }) => {
            return !record.get('cuszDocCode') || record.get('formId');
          },
        },
      },
      {
        name: 'formCode',
        label: intl.get('hwfp.common.model.common.formCode').d('表单编码'),
        type: 'string',
        format: 'uppercase',
        required: true,
        transformResponse: (value) => {
          return value ? (value.indexOf(':') > 0 ? value.split(':')[1] : value) : '';
        },
        transformRequest: (value, record) => {
          const formCodePrefix = record.get('formCodePrefix');
          return formCodePrefix ? `${formCodePrefix}:${value}` : value;
        },
      },
      {
        name: 'formCodePrefix',
        type: 'string',
        disabled: true,
        ignore: 'always',
        transformResponse: (value, object) => {
          return object.formCode && object.formCode.indexOf(':') > 0
            ? object.formCode.split(':')[0]
            : value || '';
        },
      },
      {
        name: 'description',
        label: intl.get('hwfp.common.model.common.formCodeDescription').d('表单描述'),
        type: 'string',
        required: true,
      },
      {
        name: 'formUrl',
        label: intl.get('hwfp.common.model.common.pcFormUrl').d('PC端表单URL'),
        type: 'string',
        required: true,
        transformResponse: (value) => {
          return value ? (value.indexOf('//') > 0 ? value.split('//')[1] : value) : '';
        },
        transformRequest: (value, record) => {
          const formUrlProtocol = record.get('formUrlProtocol');
          return `${formUrlProtocol}${value}`;
        },
      },
      {
        name: 'formUrlProtocol',
        type: 'string',
        ignore: 'always',
        disabled: true,
        transformResponse: (value, object) => {
          return object.formUrl && object.formUrl.indexOf('//') > 0
            ? `${object.formUrl.split('//')[0]}//`
            : 'include://';
        },
      },
      {
        name: 'mobileFormUrl',
        label: intl.get('hwfp.common.model.common.mobileFormUrl').d('移动端表单URL'),
        type: 'string',
      },
      {
        label: intl.get('hzero.common.batchFlag').d('启用批量审批'),
        name: 'batchFlag',
        type: 'boolean',
        trueValue: 1,
        required: true,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        required: true,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'cuszStage',
        type: 'object',
        label: intl.get('hwfp.common.model.common.cuszStageCode').d('单据样式阶段'),
        lovCode: 'HWFP.CUSZ_DOC_STAGE_VIEW_LOV',
        ignore: 'always',
        computedProps: {
          lovPara: ({ record }) => {
            return {
              docCode: record.get('cuszDocCode'),
            };
          },
          required: ({ record }) => {
            return record.get('checkValue') === 'cuszStage';
          },
        },
      },
      {
        name: 'cuszStageCode',
        type: 'string',
        bind: 'cuszStage.stageCode',
      },
      {
        name: 'cuszStageName',
        type: 'string',
        bind: 'cuszStage.stageName',
      },
      {
        name: 'cuszDocCode',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { documentId } = data;
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/forms/${documentId}`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

export function getEmailApproveFormConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.common.model.common.templateCode').d('模板编码'),
        name: 'templateCode',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.templateName').d('模板名称'),
        name: 'templateName',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.interfaceCode').d('数据来源'),
        name: 'interface',
        type: 'object',
        lovCode:
          currentOrganization === 0 ? 'HWFP.INTERFACE_DEFINE' : 'SWFP.INTERFACE_DEFINE_TENANT',
        ignore: 'always',
      },
      {
        name: 'interfaceId',
        type: 'string',
        bind: 'interface.interfaceId',
      },
      {
        name: 'interfaceCode',
        type: 'string',
        bind: 'interface.interfaceCode',
      },
      {
        label: intl.get('hwfp.common.model.common.templateRemark').d('模板描述'),
        name: 'templateRemark',
        type: 'string',
      },
      {
        label: intl.get('hwfp.common.model.common.templateContent').d('模板内容'),
        name: 'templateContent',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        required: true,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/mail-templates`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

export function getApprovalGroupConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    // paging: false,
    fields: [
      {
        label: intl.get('hwfp.common.model.common.defCode').d('编码'),
        name: 'defCode',
        type: 'string',
        required: true,
        computedProps: {
          disabled: ({ record }) => !!record.get('id'),
        },
      },
      {
        label: intl.get('hwfp.common.model.common.defName').d('名称'),
        name: 'defName',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.illustrate').d('说明'),
        name: 'description',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        type: 'boolean',
        required: true,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/approval-group-defs`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

export function getConditionFieldConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
        name: 'field',
        type: 'object',
        lovCode: 'HWFP.PROCESS_VARIABLE_LOV_VIEW',
        lovPara: {
          isIncludePredefineFlag: 'Y',
          predefineType: 'relTable',
          approvalGroupUseFlag: 1,
        },
        required: true,
        ignore: 'always',
      },
      {
        label: intl.get('hwfp.common.model.common.fieldCode').d('字段编码'),
        name: 'fieldCode',
        bind: 'field.variableName',
        type: 'string',
        disabled: true,
      },
      {
        name: 'fieldName',
        type: 'string',
        bind: 'field.description',
        label: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
      },
      {
        name: 'variableId',
        type: 'string',
        bind: 'field.variableId',
      },
      {
        label: intl.get('hwfp.common.model.categories.fieldComponentType').d('字段类型'),
        name: 'fieldComponentType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
        disabled: true,
        bind: 'field.componentType',
      },
      {
        label: intl.get('hwfp.documents.model.documents.lovCode').d('来源值集'),
        name: 'lovCode',
        type: 'string',
        bind: 'field.lovCode',
        disabled: true,
      },
      {
        label: intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件'),
        name: 'searchFlag',
        type: 'number',
        lookupCode: 'HPFM.ENABLED_FLAG',
        defaultValue: 0,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { queryParams = {} } = data;
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/approval-group-column-defs/list`,
          method: 'GET',
          data: {
            ...queryParams,
            ...params,
          },
        };
      },
    },
  };
}

export function getApprovalGroupFieldConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.common.model.common.fieldCode').d('字段编码'),
        name: 'fieldCode',
        type: 'string',
        disabled: true,
        transformResponse: (value) => {
          return `#${value}`;
        },
      },
      {
        label: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
        name: 'fieldName',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.common.outputType').d('输出类型'),
        name: 'outputType',
        type: 'string',
        lookupCode: 'HWFP.APPROVAL_GROUP_OUTPUT_TYPE',
        defaultValue: 'EMPLOYEE',
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.categories.fieldComponentType').d('字段类型'),
        name: 'fieldComponentType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
        defaultValue: 'SINGLE_LOV',
        disabled: true,
      },
      {
        label: intl.get('hwfp.documents.model.documents.lovCode').d('来源值集'),
        name: 'lovCode',
        type: 'string',
        defaultValue: 'HWFP.EMPLOYEE',
        disabled: true,
      },
      {
        label: intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件'),
        name: 'searchFlag',
        type: 'number',
        lookupCode: 'HPFM.ENABLED_FLAG',
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { queryParams = {} } = data;
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/approval-group-column-defs/list`,
          method: 'GET',
          data: {
            ...queryParams,
            ...params,
          },
        };
      },
    },
  };
}

export function getTotalSettingConfig() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.model.todoRemind.newTitle').d('待办定时提醒（SRM消息通知）'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'msgTabCloseFlag',
        defaultValue: 0,
      },
      {
        name: 'remindDate',
        type: 'time',
        format: 'HH:mm:ss',
        label: intl.get('hwfp.common.model.remind.everyDay').d('提醒时间(每天)'),
        required: true,
        transformResponse: (value) => {
          return moment().set({ hour: value, minute: 0, second: 0 }).format(); // 对时间处理使组件可以格式化
        },
        transformRequest: (value) => {
          return moment(value).hour(); // 专门获取小时
        },
        computedProps: {
          disabled: ({ record }) => !record.get('enabledFlag'),
        },
      },
      {
        name: 'remindIntervalTime',
        type: 'number',
        label: intl
          .get('hwfp.common.model.todoRemind.time.interval')
          .d('允许再次催办的间隔（小时）'),
        min: 0.5,
        precision: 1,
        step: 0.5,
      },
      {
        name: 'approvalFormMergeFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.model.approvalFormMergeFlag').d('合并审批表单和记录'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'autoApprovalFilterFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filter.auto').d('过滤自行审批或已审批自动同意'),
        trueValue: 1,
        falseValue: 0,
        required: true,
      },
      {
        name: 'noAssigneeApprovalFilterFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filtering.auto').d('过滤无审批人自动同意'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
        required: true,
      },
      {
        name: 'msgFormMenuDisplayFlag',
        type: 'boolean',
        label: intl
          .get('hwfp.common.model.msgFormMenuDisplayFlag.newTitle')
          .d('消息推送外部系统，跳转SRM展示表单'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'multiApprovalFilterFlag',
        type: 'boolean',
        label: intl
          .get('hwfp.common.filtering.multiApprovalFilterFlag')
          .d('过滤会签中未实际参与的审批人'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'approvalActionSeqDataMap',
        type: 'object',
      },
      {
        name: 'approved',
        type: 'intl',
        label: intl.get('hwfp.task.button.approvalAdopt').d('审批通过'),
      },
      {
        name: 'rejected',
        type: 'intl',
        label: intl.get('hzero.common.view.message.title.reject').d('审批拒绝'),
      },
      {
        name: 'delegate',
        type: 'intl',
        label: intl.get('hzero.common.message.delegate').d('转交'),
      },
      {
        name: 'rebut',
        type: 'intl',
        label: intl.get('hwfp.task.view.option.jumped', { name: '驳回' }).d('驳回'),
      },
      {
        name: 'addSign',
        type: 'intl',
        label: intl.get('hwfp.task.view.option.addUser', { name: '加签' }).d('加签'),
      },
      {
        name: 'approveAndAddSign',
        type: 'intl',
        label: intl
          .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并加签` })
          .d('同意并加签'),
      },
      {
        name: 'recall',
        type: 'intl',
        label: intl.get('hwfp.common.view.message.recall').d('撤回'),
      },
      {
        name: 'revoke',
        type: 'intl',
        label: intl.get('hzero.common.status.revoke').d('撤销'),
      },
      {
        name: 'carbonCopy',
        type: 'intl',
        label: intl.get('hzero.common.record.circulate').d('传阅'),
      },
      {
        name: 'remind',
        type: 'intl',
        label: intl.get('hwfp.common.view.message.remind').d('催办'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/notification`,
          method: 'POST',
        };
      },
    },
  };
}

// 流程配置列表ds
export function getProcessConfigTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    queryFields: [
      {
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
        name: 'key',
        type: 'string',
      },
      {
        label: intl.get('hwfp.common.model.process.name').d('流程名称'), // 流程定义
        name: 'name',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'processDefineSource',
        lookupCode: 'HPFM.PROCESS_DOCUMENT_SOURCE',
        type: 'string',
      },
    ],
    fields: [
      {
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
        name: 'key',
        type: 'string',
      },
      {
        label: intl.get('hwfp.common.model.process.name').d('流程名称'), // 流程定义
        name: 'name',
        type: 'string',
        required: true,
      },
      {
        label: intl
          .get('hwfp.processDefine.model.processDefine.messageTypeList')
          .d('SRM消息提醒配置'),
        name: 'messageTypeList',
        lookupCode: 'HWFP.MESSAGE_TYPE',
        type: 'string',
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.fireMsgFlag').d('消息推送状态'),
        name: 'fireMsgFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.batchFlag').d('批量审批'), // 支持批量审批
        name: 'batchFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.mobileFlag').d('启用移动端审批'), // 移动端审批
        name: 'mobileMsgFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'processDefineSource',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.lastVision').d('当前版本'),
        name: 'latestVersion',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/process/models`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

export function getQuotePredefinedConfig() {
  return {
    selection: 'single',
    autoQuery: true,
    autoCreate: false,
    fields: [...getProcessDocumentFields()],
    queryFields: [
      {
        label: intl.get(`hwfp.common.model.common.documentCode`).d('流程单据编码'),
        name: 'documentCode',
        type: 'string',
        format: 'uppercase',
      },
      {
        label: intl.get(`hwfp.common.model.common.documentDescription`).d('流程单据描述'),
        name: 'description',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/process/documents`,
          method: 'GET',
          data: {
            ...data,
            processDocumentSource: 'PREDEFINED',
          },
        };
      },
    },
  };
}

// 流程配置表单ds
export function getProcessConfigForm(type = '') {
  const fileFields =
    type === 'import'
      ? [
          {
            label: intl.get('hwfp.common.model.process.file').d('BPMN定义文件'),
            name: 'file',
            type: 'string',
            required: true,
          },
        ]
      : [];
  return {
    fields: [
      {
        label: intl.get('hwfp.common.model.process.code').d('流程编码'),
        name: 'key',
        type: 'string',
        validator: (value) => {
          const pattern = /^[A-Z][A-Z0-9-_.]*$/;
          if (!pattern.test(value)) {
            return intl
              .get('hzero.common.validation.codeUpperBegin.noSlash')
              .d('全大写及数字，必须以字母开头，可包含“-”、“_”、“.”');
          }
        },
        required: true,
      },
      {
        label: intl.get('hwfp.common.model.documents.defaultFormId').d('默认审批表单'),
        name: 'defaultFormObj',
        type: 'object',
        required: true,
        ignore: 'always',
        lovCode: 'HWFP.PROCESS_FROM',
        textField: 'description',
        valueField: 'formId',
        lovPara: { ignoreCuszFlag: 1, tenantId: currentOrganizationId, enabledFlag: 1 },
      },
      {
        label: intl.get('hwfp.common.model.documents.defaultFormId').d('默认审批表单'),
        name: 'defaultFormId',
        bind: 'defaultFormObj.formId',
        type: 'string',
        required: true,
      },
      {
        name: 'defaultFormDescription',
        bind: 'defaultFormObj.description',
        type: 'string',
      },
      {
        label: intl.get('hwfp.common.model.process.name').d('流程名称'), // 流程定义
        name: 'name',
        type: 'string',
        required: true,
      },
      {
        // label: intl
        //   .get('hwfp.processDefine.model.processDefine.messageTypeList')
        //   .d('SRM消息提醒配置'),
        name: 'messageTypeList',
        lookupCode: 'HWFP.MESSAGE_TYPE',
        multiple: true,
        type: 'string',
      },
      {
        // label: intl
        //   .get('hwfp.processDefine.model.processDefine.pushMessageEnabled')
        //   .d('待办消息推送外部系统'), // 消息推送外部系统
        name: 'fireMsgFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.pushMessageType').d('推送类型'), // 消息推送外部系统
        name: 'pushMessageType',
        type: 'string',
        multiple: true,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.batchFlag').d('批量审批'),
        name: 'batchFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hwfp.processDefine.model.processDefine.mobileFlag').d('启用移动端审批'),
        name: 'mobileMsgFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      ...fileFields,
    ],
  };
}

export function getVariableConfigConfig() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'orderSeq',
        type: 'number',
        label: intl.get('hwfp.serviceDefinition.model.param.orderNumber').d('序号'),
        required: true,
      },
      {
        name: 'variable',
        type: 'object',
        lovCode: 'SWFL.PROCESS_ASSIGN_VARIABLE',
        label: intl.get('swfl.processAppoint.model.variableConfig.variableName').d('变量名称'),
        ignore: 'always',
        required: true,
        computedProps: {
          lovPara: ({ dataSet }) => {
            const procAssignConfId = dataSet.getQueryParameter('procAssignConfId');
            return {
              procAssignConfId,
            };
          },
        },
      },
      {
        name: 'variableName',
        type: 'string',
        bind: 'variable.variableName',
      },
      {
        name: 'variableId',
        type: 'string',
        bind: 'variable.variableId',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('swfl.processAppoint.model.variableConfig.variableDescribe').d('变量描述'),
        bind: 'variable.description',
        disabled: true,
      },
      {
        name: 'variableFieldType',
        type: 'string',
        label: intl.get('swfl.processAppoint.model.variableConfig.variableType').d('字段类型'),
        lookupCode: 'SWFL.FIELD_TYPE',
        required: true,
      },
      {
        name: 'variableValueSourceLov',
        type: 'object',
        label: intl.get('swfl.processAppoint.model.variableConfig.variableSource').d('数据来源'),
        ignore: 'always',
        computedProps: {
          lovCode: ({ record }) => {
            return record.get('variableFieldType') === 'LOV'
              ? 'SPFM.LOV.LOV_VIEW_CODE.ORG'
              : 'HPFM.LOV.LOV_DETAIL_CODE.ORG';
          },
          disabled: ({ record }) => {
            return !['LOV', 'SELECT'].includes(record.get('variableFieldType'));
          },
        },
      },
      {
        name: 'variableValueSource',
        type: 'string',
        computedProps: {
          bind: ({ record }) => {
            return record.get('variableFieldType') === 'LOV'
              ? 'variableValueSourceLov.viewCode'
              : 'variableValueSourceLov.lovCode';
          },
        },
      },
      {
        name: 'variableValueSourceName',
        type: 'string',
        bind: 'variableValueSourceLov.viewName',
        computedProps: {
          bind: ({ record }) => {
            return record.get('variableFieldType') === 'LOV'
              ? 'variableValueSourceLov.viewName'
              : 'variableValueSourceLov.lovName';
          },
        },
      },
      {
        name: 'variableColumnWidth',
        type: 'number',
        label: intl.get('swfl.processAppoint.model.variableConfig.variableWidth').d('宽度'),
        required: true,
        defaultValue: 120,
        min: 80,
        step: 1,
        max: 400,
      },
      {
        label: intl.get('hwfp.common.model.categories.isQueryFlag').d('是否作为查询条件'),
        name: 'searchFlag',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/process-assign-variable/${data.procAssignConfId}`,
          method: 'GET',
        };
      },
    },
  };
}

// 服务配置列表ds
export function getServiceConfigTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    queryFields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
        name: 'serviceCode',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'), // 服务名称
        name: 'description',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceTypeMeaning').d('服务类别'),
        name: 'serviceType',
        lookupCode: 'HWFP.SERVICE_TYPE',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceModeMeaning').d('服务方式'),
        name: 'serviceMode',
        lookupCode: 'HWFP.SERVICE_MODE',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'serviceDefinitionSource',
        lookupCode: 'HPFM.PROCESS_DOCUMENT_SOURCE',
        type: 'string',
      },
    ],
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
        name: 'serviceCode',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'), // 服务名称
        name: 'description',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceTypeMeaning').d('服务类别'),
        name: 'serviceType',
        lookupCode: 'HWFP.SERVICE_TYPE',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceModeMeaning').d('服务方式'),
        name: 'serviceMode',
        lookupCode: 'HWFP.SERVICE_MODE',
        type: 'string',
      },
      {
        label: intl.get('hzero.common.status').d('状态'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'serviceDefinitionSource',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/service/approve-flow/new-page`,
          method: 'GET',
          data,
        };
      },
    },
  };
}

// 服务配置表单ds
export function getServiceConfigForm() {
  return {
    fields: [
      {
        label: intl.get('hzero.common.model.tenantName').d('租户'),
        name: 'tenantObj',
        type: 'object',
        lovCode: 'HPFM.TENANT',
        // required: true,
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.categoryDescription').d('流程分类'),
        name: 'categoryObj',
        type: 'object',
        lovCode: 'HWFP.PROCESS_CATEGORY',
        disabled: true,
        ignore: 'always',
      },
      {
        name: 'categoryId',
        type: 'string',
        bind: 'categoryObj.categoryId',
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceCode').d('服务编码'),
        name: 'serviceCode',
        type: 'string',
        required: true,
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.description').d('服务描述'), // 服务名称
        name: 'description',
        type: 'intl',
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceTypeMeaning').d('服务类别'),
        name: 'serviceType',
        lookupCode: 'HWFP.SERVICE_TYPE',
        type: 'string',
        required: true,
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.serviceModeMeaning').d('服务方式'),
        name: 'serviceMode',
        lookupCode: 'HWFP.SERVICE_MODE',
        type: 'string',
        required: true,
        computedProps: {
          disabled: ({ record }) => record.get('serviceId') || !record.get('serviceType'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.documentId').d('流程单据'),
        name: 'documentObj',
        type: 'object',
        ignore: 'always',
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
        },
      },
      {
        name: 'documentId',
        type: 'string',
        bind: 'documentObj.value',
      },
      {
        name: 'documentDescription',
        type: 'string',
        bind: 'documentObj.meaning',
      },
      {
        label: intl.get('hpfm.valueList.lovSetting.title.lovSetting').d('值集视图'),
        name: 'viewCodeObj',
        type: 'object',
        lovCode: 'SPFM.LOV_VIEW_ORG',
        textField: 'viewName',
        valueField: 'viewCode',
        ignore: 'always',
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
        },
      },
      {
        name: 'viewCode',
        type: 'string',
        bind: 'viewCodeObj.viewCode',
      },
      {
        name: 'viewName',
        type: 'string',
        bind: 'viewCodeObj.viewName',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.interfaceCode').d('接口定义编码'),
        name: 'interfaceObj',
        type: 'object',
        textField: 'interfaceCode',
        valueField: 'interfaceId',
        lovCode: 'HWFP.INTERFACE',
        ignore: 'always',
        computedProps: {
          disabled: ({ record }) => record.get('serviceId'),
          lovPara: () => {
            if (isTenantRoleLevelFlag) {
              return { organizationId: currentOrganizationId };
            }
          },
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.interfaceCode').d('接口定义编码'),
        name: 'interfaceCode',
        disabled: true,
        ignore: 'always',
      },
      {
        name: 'interfaceId',
        type: 'string',
        bind: 'interfaceObj.interfaceId',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.scriptCode').d('脚本'),
        name: 'scriptCodeObj',
        type: 'object',
        lovCode: 'SADA_ORG_MARMOT_SCRIPT_LIBRARY_VIEW',
        ignore: 'always',
        computedProps: {
          lovPara: ({ record }) => {
            const tenantNum = record.get('tenantNum') || currentOrganization.tenantNum;
            return {
              quickType: 'workflow',
              tenantNum,
            };
          },
          disabled: ({ record }) => record.get('serviceId'),
          required: ({ record }) => record.get('serviceMode') === 'SCRIPT',
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.scriptCode').d('脚本'),
        name: 'scriptCode',
        type: 'string',
        bind: 'scriptCodeObj.code',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.approvalGroup').d('审批组'),
        name: 'approvalGroupDefCode',
        type: 'string',
        computedProps: {
          disabled: ({ record }) =>
            record.get('serviceId') ||
            !(record.get('documentId') && record.get('serviceMode') === 'APPROVAL_GROUP'),
          required: ({ record }) => record.get('serviceMode') === 'APPROVAL_GROUP',
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.simpleExpression').d('表达式'),
        name: 'simpleExpression',
        type: 'string',
        computedProps: {
          disabled: ({ record }) => !record.get('serviceMode') === 'EXPRESSION',
          required: ({ record }) => record.get('serviceMode') === 'EXPRESSION',
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.interface.expression').d('执行表达式'),
        name: 'expression',
        type: 'string',
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.interface.resultSimpleExpression')
          .d('审批结果表达式'),
        name: 'simpleApproveResultExpression',
        type: 'string',
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.interface.resultExpression')
          .d('审批结果执行表达式'),
        name: 'approveResultExpression',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.requestConstants').d('脚本常量参数'),
        name: 'requestConstants',
        type: 'string',
        disabled: true,
      },
      {
        label: intl.get('hzero.common.status.enable').d('启用'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'serviceDefinitionSource',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'serviceType') {
          record.set('serviceMode', null);
        }
        if (name === 'documentObj') {
          record.set('approvalGroupDefCode', null);
        }
      },
    },
  };
}

// 分类属性表单ds
export function getCategoryAttributeForm() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'tenantId',
        type: 'object',
        label: intl.get('hzero.common.model.tenantName').d('租户'),
      },
      {
        name: 'categoryCode',
        type: 'string',
        label: intl.get('hwfp.categories.model.categories.categoryCode').d('流程分类编码'),
      },
      {
        name: 'description',
        type: 'intl',
        label: intl.get('hwfp.categories.model.categories.description').d('流程分类描述'),
      },
      {
        label: intl.get(`hzero.common.status.enable`).d('启用'),
        name: 'enabledFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hzero.common.source').d('来源'),
        name: 'serviceDefinitionSource',
        type: 'string',
      },
      {
        name: 'document',
        type: 'string',
        label: intl.get(`hwfp.common.view.message.title.document`).d('流程单据'),
      },

      {
        name: 'documentForm',
        type: 'string',
        label: intl.get(`hwfp.common.view.message.title.variable`).d('流程变量'),
      },
    ],
  };
}

// 分类属性流程变量列表ds
export function getCategoryAttributeDetailTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'variableName',
        type: 'string',
        label: intl.get('hwfp.common.model.common.variableCode').d('字段编码'),
      },
      {
        name: 'variableType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.VARIABLE_TYPE',
        label: intl.get('hwfp.common.model.categories.variableType').d('字段类型'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('hwfp.categories.model.categories.variableName').d('字段名称'),
      },
      {
        name: 'componentType',
        type: 'string',
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
        label: intl.get('hwfp.common.model.common.componentType').d('组件类型'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('hwfp.common.model.common.lovCode').d('来源值集'),
      },
      {
        label: intl.get(`hzero.common.status.requiredFlag`).d('是否必输'),
        name: 'requiredFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
  };
}

// 外部审批配置ds
export function getExternalSystemApproveConfigDs() {
  return {
    autoCreate: false,
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'linkCode',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { categoryId, documentId, ...others } = data;
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/export-workflow-config-details/query/detail?categoryId=${categoryId}&documentId=${documentId}`,
          method: 'GET',
          data: others,
        };
      },
    },
  };
}

// 外部审批配置ds
export function getExternalSystemApproveConfigLineDs(initParams) {
  return {
    autoCreate: false,
    autoQuery: false,
    paging: false,
    data: initParams.initData,
    fields: [
      {
        name: 'approvedAction',
        type: 'string',
        label: intl.get('hwfp.common.model.common.approvedAction').d('审批动作'),
        lookupCode: 'HWFP.EXPORT_WORKFLOW_APPROVED_ACTION',
        required: true,
      },
      {
        name: 'service',
        type: 'object',
        label: intl.get('hwfp.common.model.common.serviceCode').d('调用服务'),
        lovCode: 'HWFP.EXPORT_WORKFLOW_SERVICE_DEF',
        ignore: 'always',
        textField: 'serviceCode',
        lovPara: initParams.lovPara,
        required: true,
      },
      {
        name: 'serviceId',
        type: 'string',
        bind: 'service.serviceId',
      },
      {
        name: 'serviceCode',
        type: 'string',
        bind: 'service.serviceCode',
      },
    ],
  };
}
