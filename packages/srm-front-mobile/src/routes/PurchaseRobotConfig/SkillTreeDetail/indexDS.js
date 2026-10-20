import { SRM_SMBL } from '_utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const basicInfoDS = (skillId, view, taskLineDataSet) => ({
  autoQuery: !!skillId,
  autoCreate: !skillId,
  primaryKey: 'robotSkill',
  children: {
    robotTaskList: taskLineDataSet,
  },
  data: [
    {
      tenantId: organizationId,
      skillStatus: 'NEW',
    },
  ],
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/skill/${skillId}`,
      method: 'GET',
    },
    submit: ({ data: dataList }) => {
      const data = dataList && dataList instanceof Array && dataList.length ? dataList[0] : {};
      return {
        url: `/smbl/v1/${organizationId}/robot/skill/save`,
        method: 'post',
        data,
      };
    },
  },
  events: {
    beforeLoad: ({ data }) => {
      if (view) {
        const baseInfo = data && data[0];
        view.setState({
          baseInfo,
        });
      }
    },
  },
  fields: [
    {
      name: 'skillName',
      label: intl.get('smbl.purchaseRobotConfig.model.skillName').d('技能名称'),
      type: 'intl',
      dynamicProps: {
        required: ({ record }) => record.get('skillStatus') !== 'ONLINE',
      },
    },
    {
      name: 'skillCode',
      label: intl.get('smbl.purchaseRobotConfig.model.skillCode').d('技能编码'),
      format: 'uppercase',
      dynamicProps: {
        required: ({ record }) => record.get('skillStatus') !== 'ONLINE',
      },
    },
    {
      name: 'skillObjectLov',
      label: intl.get('smbl.purchaseRobotConfig.model.skillObject').d('技能对象'),
      required: true,
      type: 'object',
      lookupCode: 'SMBL.ROBOT_SKILL_OBJECT',
    },
    {
      name: 'skillObjectMeaning',
      bind: 'skillObjectLov.meaning',
      label: intl.get('smbl.purchaseRobotConfig.model.skillObject').d('技能对象'),
    },
    {
      name: 'skillObject',
      bind: 'skillObjectLov.value',
    },
    {
      name: 'skillTypeLov',
      label: intl.get('smbl.purchaseRobotConfig.model.skillType').d('技能类型'),
      required: true,
      type: 'object',
      lookupCode: 'SMBL.ROBOT_SKILL_TYPE',
    },
    {
      name: 'skillTypeMeaning',
      bind: 'skillTypeLov.meaning',
      label: intl.get('smbl.purchaseRobotConfig.model.skillType').d('技能类型'),
    },
    {
      name: 'skillType',
      bind: 'skillTypeLov.value',
    },
    {
      name: 'remark',
      type: 'intl',
      label: intl.get('smbl.purchaseRobotConfig.model.skillRemark').d('技能说明'),
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.purchaseRobotConfig.model.skillSource').d('数据来源'),
    },
  ],
});

const taskLineDS = (skillId) => ({
  autoQuery: true,
  exportMode: 'client',
  primaryKey: 'robotSkill',
  pageSize: 10,
  cacheSelection: false,
  cacheModified: true,
  dataToJSON: 'all',
  transport: {
    read: () => {
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/task/list/${skillId}`,
        method: 'GET',
      };
    },
    submit: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/task/save/${skillId}`,
      method: 'POST',
    },
    destroy: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/task/delete`,
      method: 'DELETE',
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((ele) => {
        const record = ele;
        const selectable = record.get('taskStatus') !== 'ONLINE';
        record.selectable = selectable;
      });
    },
  },
  fields: [
    {
      name: 'taskCode',
      label: intl.get('smbl.purchaseRobotConfig.model.taskCode').d('任务编码'),
      format: 'uppercase',
      required: true,
    },
    {
      name: 'taskStatusMeaning',
      label: intl.get('smbl.purchaseRobotConfig.model.taskStatus').d('状态'),
    },
    {
      name: 'taskName',
      label: intl.get('smbl.purchaseRobotConfig.model.taskName').d('任务名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'filterObject',
      label: intl.get('smbl.purchaseRobotConfig.model.filterObject').d('筛选对象'),
    },
    {
      name: 'importTemplateLov',
      label: intl.get('smbl.purchaseRobotConfig.model.importTemplate').d('关联导入模板'),
      type: 'object',
      lovCode: 'SMBL.ROBOT_IMPORT_TEMPLATE_VIEW',
      textField: 'templateName',
      valueField: 'id',
    },
    {
      name: 'importTemplateId',
      bind: 'importTemplateLov.id',
    },
    {
      name: 'importTemplateCode',
      bind: 'importTemplateLov.templateCode',
    },
    {
      name: 'importTemplateName',
      bind: 'importTemplateLov.templateName',
    },
    {
      name: 'firstUrl',
      // label: intl.get('smbl.purchaseRobotConfig.model.dataRuleType').d('数据源规则类型'),
      label: intl.get('smbl.purchaseRobotConfig.model.firstUrl').d('入口请求地址'),
      // lookupCode: 'SMBL.ROBOT_RULE_TYPE',
      // required: true,
      type: 'string',
    },
    // {
    //   name: 'ruleType',
    //   bind: 'ruleTypeLov.value',
    // },
    // {
    //   name: 'ruleTypeMeaning',
    //   bind: 'ruleTypeLov.meaning',
    // },
    {
      name: 'ruleStatement',
      label: intl.get('smbl.purchaseRobotConfig.model.ruleStatement').d('规则语句'),
    },
    {
      name: 'ruleJsUuid',
      label: intl.get('smbl.purchaseRobotConfig.model.ruleStatement').d('规则语句'),
    },
    {
      name: 'taskMarmotCode',
      label: intl.get('smbl.purchaseRobotConfig.model.taskMarmotCode').d('规则脚本编码'),
    },
    {
      name: 'msgTemplate',
      label: intl.get('smbl.purchaseRobotConfig.model.msgTemplate').d('消息模板'),
      type: 'object',
      fieldType: 'LOV',
      lovCode: 'SMBL.ROBOT_MSG_TMPL_LIST',
      required: true,
    },
    {
      name: 'msgTemplateId',
      bind: 'msgTemplate.templateId',
    },
    {
      name: 'msgTemplateName',
      bind: 'msgTemplate.templateName',
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.taskRemark').d('任务说明'),
      type: 'intl',
    },
    {
      name: 'sort',
      label: intl.get('smbl.purchaseRobotConfig.model.taskSort').d('优先级'),
      type: 'number',
      required: true,
    },
    {
      name: 'taskLineAction',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
  ],
});

const customFilterLineDS = (taskId, saveCallback) => ({
  autoQuery: true,
  pageSize: 10,
  primaryKey: 'filterObject',
  selection: 'multiple',
  paging: false,
  dataKey: 'jsonFilterObject',
  dataToJSON: 'all',
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/task/filter/${taskId}`,
      method: 'GET',
    },
    submit: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/task/filter/save/${taskId}`,
      method: 'POST',
    },
    destroy: ({ dataSet }) => {
      const data = dataSet.toData();
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/task/filter/save/${taskId}`,
        method: 'POST',
        data,
      };
    },
  },
  events: {
    submitSuccess: () => {
      if (saveCallback) {
        saveCallback();
      }
    },
  },
  fields: [
    {
      name: 'fieldName',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.feildName').d('字段名'),
      type: 'intl',
    },
    {
      name: 'fieldCode',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.fieldCode').d('字段编码'),
      type: 'string',
    },
    {
      name: 'lineNumber',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.lineNumber').d('行号'),
    },
    {
      name: 'lovQueryParamObject',
      type: 'object',
      lovCode: 'SMBL.LOV_QUERY_FIELDS',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.lovQueryField').d('查询字段'),
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            code: record.get('lovCode'),
          };
        },
      },
    },
    {
      name: 'lovQueryParam',
      bind: 'lovQueryParamObject.field',
    },
    {
      name: 'lovQueryParamMeaning',
      bind: 'lovQueryParamObject.display',
    },
    {
      name: 'covertFilterParam',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.selectQueryFilter').d('转化自'),
    },
    {
      name: 'fieldSourceType',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.fieldSourceType').d('字段来源'),
    },
    {
      type: 'boolean',
      name: 'needAgentCovert',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.needAgentCovert').d('是否代理'),
    },
    {
      name: 'agentFieldName',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.agentFieldName').d('代理字段'),
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.remark').d('备注'),
      type: 'intl',
    },
  ],
});

// 来源筛选器的行列表
const filterObjectLineDS = (unitId) => ({
  autoQuery: true,
  pageSize: 20,
  selection: 'multiple',
  paging: false,
  dataKey: 'configFields',
  transport: {
    read: {
      url: `${SRM_SMBL}/v1/${organizationId}/robot/task/customize-unit/detail/${unitId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'fieldName',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.feildName').d('字段名'),
      type: 'string',
    },
    {
      name: 'fieldAlias',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.fieldCode').d('字段编码'),
      type: 'string',
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.filter.remark').d('备注'),
      type: 'string',
    },
  ],
});

const ruleStatementCodeDS = (taskId) => {
  return {
    autoQuery: true,
    paging: false,
    autoCreate: true,
    data: [{ ruleJs: '' }],
    autoLocateFirst: true,
    transport: {
      submit: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/rule/save/${taskId}`,
        method: 'POST',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/rule/delete`,
        method: 'DELETE',
      },
    },
    fields: [
      {
        name: 'ruleJs',
      },
    ],
  };
};

const ruleStatementDS = (taskId, saveCallback) => {
  return {
    autoQuery: true,
    paging: false,
    autoCreate: false,
    selection: 'multiple',
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/rule/query/${taskId}`,
        method: 'GET',
      },
      submit: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/rule/save/${taskId}`,
        method: 'POST',
      },
      destroy: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/rule/delete`,
        method: 'DELETE',
      },
    },
    events: {
      submitSuccess: () => {
        if (saveCallback) {
          saveCallback();
        }
      },
    },
    fields: [
      {
        name: 'sort',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.sort').d('排序'),
        type: 'number',
        required: true,
      },
      {
        name: 'url',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.api').d('API'),
        type: 'string',
        required: true,
      },
      {
        name: 'httpMethodLov',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.httpMethod').d('请求方式'),
        type: 'object',
        required: true,
        lookupCode: 'SMBL.HTTP_METHOD',
      },
      {
        name: 'httpMethod',
        bind: 'httpMethodLov.value',
      },
      {
        name: 'httpMethod',
        bind: 'httpMethodLov.meaning',
      },
    ],
  };
};

const constantObjRuleStatementDS = (taskId, ruleType) => {
  return {
    autoQuery: false,
    paging: false,
    autoCreate: false,
    selection: 'multiple',
    transport: {},
    events: {
      update: ({ record, name }) => {
        if (name === 'fieldTypeLov') {
          record.set('value', null);
        }
      },
    },
    fields: [
      {
        name: 'fieldCode',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.fieldCode').d('字段编码'),
        type: 'string',
        required: ruleType === 'CONSTANT_OBJECT',
      },
      {
        name: 'fieldName',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.feildName').d('字段名'),
        type: 'string',
        required: ruleType === 'CONSTANT_OBJECT',
      },
      {
        name: 'fieldTypeLov',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.feildType').d('字段类型'),
        type: 'object',
        lookupCode: 'SMBL.ROBOT_RULE_FIELD_TYPE',
        required: ruleType === 'CONSTANT_OBJECT',
      },
      {
        name: 'fieldType',
        bind: 'fieldTypeLov.value',
      },
      {
        name: 'fieldTypeMeaning',
        bind: 'fieldTypeLov.meaning',
      },
      {
        name: 'value',
        label: intl.get('smbl.purchaseRobotConfig.model.rule.value').d('字段值'),
        type: 'string',
        required: ruleType === 'CONSTANT_OBJECT',
      },
    ],
  };
};

const filterObjectHeaderDS = (taskId) => {
  return {
    autoQuery: true,
    primaryKey: 'filterObject',
    pageSize: 10,
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/task/filter/${taskId}`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'filterNameLov',
        type: 'object',
        lovCode: 'SMBL.ROBOT_TASK_SEARCHBAR_VIEW',
        label: intl.get('smbl.purchaseRobotConfig.view.title.filterName').d('筛选器名称'),
        textField: 'unitName',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              customizeUnitCodes: record.data.customizeUnitCodes,
            };
          },
        },
      },
      {
        name: 'unitName',
        bind: 'filterNameLov.unitName',
      },
      {
        name: 'unitCode',
        bind: 'filterNameLov.unitCode',
      },
      {
        name: 'selectField',
      },
    ],
  };
};

const taskRuleStatemetApiUrlPathDS = () => {
  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'urlPath',
        type: 'string',
        label: 'url',
        required: true,
      },
    ],
  };
};

const taskRuleStatemetApiUrlParamDS = () => {
  return {
    autoQuery: false,
    paging: false,
    events: {
      beforeDelete: () => true,
    },
    fields: [
      {
        name: 'key',
        type: 'string',
        label: 'key',
        required: true,
      },
      {
        name: 'value',
        type: 'string',
        label: 'value',
        required: true,
      },
    ],
  };
};

const taskRuleStatemetApiBodyParamDS = () => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'jsonBody',
        type: 'string',
      },
    ],
  };
};

export {
  basicInfoDS,
  taskLineDS,
  customFilterLineDS,
  filterObjectLineDS,
  ruleStatementDS,
  constantObjRuleStatementDS,
  filterObjectHeaderDS,
  taskRuleStatemetApiUrlPathDS,
  taskRuleStatemetApiUrlParamDS,
  taskRuleStatemetApiBodyParamDS,
  ruleStatementCodeDS,
};
