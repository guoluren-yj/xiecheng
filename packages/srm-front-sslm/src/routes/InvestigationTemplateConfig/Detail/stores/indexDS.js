import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

// 详情-模板头Ds
const templateHeaderDS = () => ({
  paging: false,
  fields: [
    {
      name: 'templateCode',
      label: intl
        .get('sslm.investTempConfig.model.investTempConfig.investTemplateCode')
        .d('调查表模板编码'),
      disabled: true,
    },
    {
      name: 'templateName',
      label: intl
        .get('sslm.investDefOrg.model.investDefOrg.investTemplateName')
        .d('调查表模板名称'),
      type: 'intl',
      computedProps: {
        required: ({ dataSet }) => dataSet.getState('isEdit'),
      },
    },
    {
      name: 'investigateType',
      label: intl.get(`sslm.investDefOrg.model.investDefOrg.investigateType`).d('调查表类型'),
      lookupCode: 'SSLM.INVESTIGATE_TYPE',
      computedProps: {
        required: ({ dataSet }) => dataSet.getState('isEdit'),
      },
    },
    {
      name: 'industryId',
      type: 'object',
      label: intl.get(`sslm.investTempConfig.model.investTempConfig.industry`).d('行业'),
      lovCode: 'SPFM.INDUSTRYS',
      noCache: true,
      transformResponse: (value, data) => {
        const { industryId, industryMeaning } = data || {};
        return {
          industryId,
          industryName: industryMeaning,
        };
      },
      transformRequest: value => value && value.industryId,
    },
    {
      name: 'remark',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`hzero.common.creationDate`).d('创建时间'),
      disabled: true,
    },
    {
      name: 'reserveFlag',
      type: 'Boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl
        .get('sslm.investTempConfig.model.investTempConfig.reserveFlag')
        .d('跨模板或跨版本时预留字段自动带值'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { investigateTemplateId } = data;
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/investigate-templates/${investigateTemplateId}`,
        method: 'GET',
        params,
        data: { ...data, customizeUnitCode: 'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.HEADER_INFO' },
      };
    },
  },
});

// 模板配置页签表格Ds
const getTempTabTableDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'fieldCode',
      type: 'string',
      label: intl.get(`spfm.investigationDefinition.model.definition.fieldCode`).d('字段编码'),
    },
    {
      name: 'fieldDescription',
      type: 'intl',
      required: true,
      label: intl.get(`spfm.investigationDefinition.model.definition.fieldDesc`).d('字段描述'),
    },
    {
      name: 'visualFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.model.definition.visualFlag`).d('启用'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.model.definition.requiredFlag`).d('要求必输'),
    },
    {
      name: 'editableFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('sslm.investTempConfig.model.investTempConfig.allowEdit').d('允许编辑'),
    },
    {
      name: 'orderSeq',
      label: intl.get(`spfm.investigationDefinition.model.definition.orderSeq`).d('排序'),
    },
    {
      name: 'componentTypeLov',
      type: 'object',
      lovCode: 'SPFM.INVESTIGATE_COMPONENTS',
      lovPara: {
        enabledFlag: 1,
      },
      label: intl.get(`spfm.investigationDefinition.model.definition.component`).d('组件'),
      noCache: true,
      computedProps: {
        disabled: ({ record }) => {
          const customFlag = record.get('customFlag');
          const flag = customFlag === 1;
          return !flag;
        },
        required: ({ record }) => {
          const visualFlag = record.get('visualFlag');
          const flag = visualFlag === 1;
          return flag;
        },
      },
      // transformResponse: (value, data) => {
      //   const { componentType, componentTypeMeaning } = data || {};
      //   return {
      //     componentType,
      //     componentDescription: componentTypeMeaning,
      //   };
      // },
      // transformRequest: (value) => value && value.componentType,
    },
    {
      name: 'componentType',
      // required: true,
      bind: 'componentTypeLov.componentType',
    },
    {
      name: 'componentTypeMeaning',
      bind: 'componentTypeLov.componentDescription',
    },
    {
      name: 'lovCodeLov',
      type: 'object',
      lovCode: 'SPFM.LOV.LOV_DETAIL.ORG',
      lovPara: {
        lovQueryFlag: 1,
      },
      label: intl.get(`spfm.investigationDefinition.model.definition.lovCode`).d('值集'),
      noCache: true,
      textField: 'lovCode',
      valueField: 'lovCode',
      ignore: 'always',
      computedProps: {
        disabled: ({ record }) => {
          const { componentType, customFlag } = record.get(['componentType', 'customFlag']);
          const editField = customFlag === 1;
          const editType =
            componentType === 'TransferLov' ||
            componentType === 'ValueList' ||
            componentType === 'Lov';
          const editFalg = editField && editType;
          return !editFalg;
        },
        required: ({ record }) => {
          const componentType = record.get('componentType');
          const flag =
            componentType === 'TransferLov' ||
            componentType === 'ValueList' ||
            componentType === 'Lov';
          return flag;
        },
      },
    },
    {
      name: 'lovCode',
      bind: 'lovCodeLov.lovCode',
      computedProps: {
        required: ({ record }) => {
          const componentType = record.get('componentType');
          const flag =
            componentType === 'TransferLov' ||
            componentType === 'ValueList' ||
            componentType === 'Lov';
          return flag;
        },
      },
    },
    // {
    //   name: 'lovName',
    //   bind: 'lovCodeLov.lovName',
    // },
    {
      name: 'attrs',
      label: intl.get(`spfm.investigationDefinition.model.definition.attrs`).d('组件属性'),
    },
    {
      name: 'customFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.model.definition.customFlag`).d('预留字段'),
    },
    {
      name: 'colspan',
      lookupCode: 'SSLM_INVESTG_COLSPAN',
      label: intl.get(`spfm.investigationDefinition.model.definition.colspan`).d('跨列'),
    },
    {
      name: 'fixedCol',
      lookupCode: 'SSLM_INVESTG_LOCK_COL',
      label: intl.get(`spfm.investigationDefinition.model.definition.lock`).d('固定列'),
    },
    {
      name: 'colWidth',
      type: 'number',
      min: 0,
      step: 1,
      label: intl.get(`spfm.investigationDefinition.model.definition.colWidth`).d('列宽'),
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'componentTypeLov') {
        record.set({
          lovCodeLov: null,
        });
      }
    },
  },
});

// 模板配置页签头DS
const getTempTabHeaderDS = ({ configName, isEdit } = {}) => ({
  selection: false,
  fields: [
    {
      name: 'investigateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.view.message.notActive`).d('调查当前页签信息'),
    },
    {
      name: 'atLeastOneFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`spfm.investigationDefinition.view.message.leastOne`).d('填写至少一行'),
    },
    {
      name: 'requiredCount',
      type: 'number',
      pattern: /^\d+$/,
      min: 0,
      precision: 0,
      step: 1,
      label: intl
        .get('sslm.investTempConfig.modal.investTempConfig.requiredCount')
        .d('至少填写行数'),
    },
    {
      name: 'contactRequiredCount',
      type: 'number',
      pattern: /^\d+$/,
      min: 0,
      precision: 0,
      step: 1,
      label: intl
        .get('sslm.investTempConfig.modal.investTempConfig.requiredCount')
        .d('至少填写行数'),
    },
    {
      name: 'customerRequiredCount',
      type: 'number',
      pattern: /^\d+$/,
      min: 0,
      precision: 0,
      step: 1,
      label: intl
        .get('sslm.investTempConfig.modal.investTempConfig.requiredCount')
        .d('至少填写行数'),
    },
    {
      name: 'remark',
      type: 'intl',
      label: intl.get(`spfm.investigationDefinition.view.message.writeExplain`).d('填写说明'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      label: intl.get(`spfm.investigationDefinition.view.message.order`).d('排序'),
    },
    {
      name: 'configDescription',
      type: 'intl',
      label: intl.get('spfm.investigationDefinition.model.definition.tagName').d('页签名称'),
      required: true,
    },
    {
      name: 'attWirteMethod',
      required: isEdit && configName === 'sslmInvestgAttachment',
      lookupCode: 'SSLM_INVESTG_ATT_WRITE_METHOD',
      defaultValue: '0',
      label: intl
        .get('spfm.investigationDefinition.model.definition.attWirteMethod')
        .d('调查表附件回写更新主数据方式'),
    },
    {
      name: 'restrictDataStatus',
      lookupCode: 'SSLM.RESTRICT_DATA_STATUS',
      label: intl.get('sslm.common.model.field.restrictDataStatus').d('限制数据状态'),
    },
  ],
  transport: {},
});

// 引用模板-平台级
const getReferencSiteTempDS = () => ({
  selection: 'single',
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'templateCode',
      label: intl.get(`sslm.referTemp.model.referTemp.preTemplateCode`).d('预置模板代码'),
    },
    ...commonFields(),
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/investigate-templates`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.SITE.SEARCH_BAR,SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_SITE_LIST',
          enabledFlag: 1,
        },
      };
    },
  },
});

// 引用模板-租户级
const getReferencOrgTempDS = () => ({
  selection: 'single',
  dataToJSON: 'selected',
  pageSize: 20,
  fields: [
    {
      name: 'templateCode',
      label: intl.get(`sslm.referTemp.model.referTemp.templateCode`).d('模板代码'),
    },
    ...commonFields(),
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate-templates/real`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.ORG.SEARCH_BAR,SSLM.INVESTIGATION_TEMP_CONFIG.DETAIL.REF_ORG_LIST',
          enabledFlag: 1,
        },
      };
    },
  },
});

const commonFields = () => [
  {
    name: 'templateName',
    label: intl.get(`sslm.referTemp.model.referTemp.templateName`).d('模板名称'),
  },
  {
    name: 'investigateTypeMeaning',
    label: intl.get(`sslm.referTemp.model.referTemp.investigateTypeMeaning`).d('调查表类型'),
  },
  {
    name: 'industryMeaning',
    label: intl.get(`sslm.referTemp.model.referTemp.industryMeaning`).d('行业'),
  },
  {
    name: 'remark',
    label: intl.get(`hzero.common.remark`).d('备注'),
  },
  {
    name: 'templateDetail',
    label: intl.get(`sslm.referTemp.model.referTemp.templateDetail`).d('模板明细'),
  },
  {
    name: 'creationDate',
    type: 'dateTime',
    label: intl.get(`hzero.common.date.creation`).d('创建日期'),
  },
];

// 引用模板-租户级 org
export {
  templateHeaderDS,
  getTempTabHeaderDS,
  getTempTabTableDS,
  getReferencSiteTempDS,
  getReferencOrgTempDS,
};
