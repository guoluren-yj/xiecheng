import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_INTERFACE_CONFIG, SRM_INTERFACE } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRole = isTenantRoleLevel();
const prefix = 'sitf.interfaceDef';

const tableData = () => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'interfaceCategoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCategoryName`).d('接口类型'),
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCode`).d('接口代码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceName`).d('接口名称'),
    },
    {
      name: 'interfaceTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceTypeMeaning`).d('接口类型'),
    },
    {
      name: 'pushFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.pushFlag`).d('主动推送'),
    },
    {
      name: 'handleFunction',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.handleFunction`).d('接口处理方法'),
    },
    {
      name: 'enabledFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.enabledFlag`).d('状态'),
    },
    {
      name: 'abnormalAlarmFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.abnormalAlarmFlag`).d('异常告警'),
    },
    {
      name: 'individualFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.individualFlag`).d('二开'),
    },
    {
      name: 'rerunErrorFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.rerunErrorFlag`).d('错误重跑'),
    },
    {
      name: 'asyncFlag',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.asyncFlag`).d('异步'),
    },
    {
      name: 'comments',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.comments`).d('备注'),
    },
    {
      name: 'blacklistFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.blacklistFlag`).d('黑名单标识'),
      trueValue: 1,
      falseValue: 0,
    },
  ],

  queryFields: [
    organizationRole && {
      name: 'applicationGroupCode',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceDef.applicationGroupCode`).d('应用组'),
      lovCode: 'SIFC.APPLICATION_GROUPS',
      textField: 'applicationGroupName',
      transformRequest: value => value && value.applicationGroupCode,
    },
    {
      name: 'interfaceCategoryCode',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCategoryCode`).d('接口类别'),
      lovCode: organizationRole ? 'SITF.INTERFACE_CATEGORY' : 'SITF.INTERFACE_CATEGORY_SITE',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: value => value && value.interfaceCategoryCode,
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCode`).d('接口代码'),
      format: 'uppercase',
      pattern: '^[a-zA-Z0-9_]{0,}',
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceName`).d('接口名称'),
    },
    {
      name: 'interfaceType',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceType`).d('接口类型'),
      lookupCode: 'SITF.INTERFACE_TYPE',
    },
    {
      name: 'individualFlag',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.individualFlag`).d('是否二开'),
      lookupCode: 'SITF.INDIVIDUAL_FLAG',
    },
  ],

  transport: {
    read: () => {
      return {
        url: organizationRole
          ? `${SRM_INTERFACE}/v1/${organizationId}/interfaces`
          : `${SRM_INTERFACE_CONFIG}/v1/interfaces`,
        method: 'GET',
      };
    },
  },
});

const modalData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'interfaceCategoryCodeLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCategoryCode`).d('接口类别'),
      lovCode: organizationRole ? 'SITF.INTERFACE_CATEGORY' : 'SIFC.INTERFACE_CATEGORY',
      textField: 'interfaceCategoryName',
      required: true,
      ignore: 'always',
    },
    {
      name: 'interfaceCategoryName',
      bind: 'interfaceCategoryCodeLov.interfaceCategoryName',
    },
    {
      name: 'interfaceCategoryCode',
      bind: 'interfaceCategoryCodeLov.interfaceCategoryCode',
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCode`).d('接口代码'),
      required: true,
    },
    {
      name: 'interfaceName',
      type: 'intl',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceName`).d('接口名称'),
      required: true,
    },
    {
      name: 'interfaceType',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceType`).d('接口类型'),
      lookupCode: 'SITF.INTERFACE_TYPE',
      required: true,
      defaultValue: 'IMPORT',
    },
    {
      name: 'handleFunction',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.handleFunction`).d('接口处理方法'),
    },
    {
      name: 'comments',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.comments`).d('备注'),
    },
    {
      name: 'orderSeq',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.orderSeq`).d('排序'),
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.enabledFlag`).d('启用'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'individualFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.individualFlag`).d('二开'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'rerunErrorFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.rerunErrorFlag`).d('错误重跑'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'asyncFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.asyncFlag`).d('异步标识'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'batchMaxCount',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.batchMaxCount`).d('批次数量'),
    },
    {
      name: 'pushFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.pushFlag`).d('是否主动推送数据'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'abnormalAlarmFlag',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.abnormalAlarmFlag`).d('异常告警'),
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
    {
      name: 'alarmReceiverTypeCodeLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceDef.alarmReceiverTypeCode`).d('告警接收组'),
      lovCode: 'SITF.RECEIVER',
      lovPara: { tenantId: organizationId },
      computedProps: {
        required: ({ record }) => {
          return organizationRole && record.get('abnormalAlarmFlag') === '1' && record.get('multiReceiverTypeFlag') !== 1;
        },
      },
      ignore: 'always',
    },
    {
      name: 'alarmReceiverTypeCode',
      bind: 'alarmReceiverTypeCodeLov.typeCode',
    },
    {
      name: 'alarmReceiverTypeMeaning',
      bind: 'alarmReceiverTypeCodeLov.typeName',
    },
    {
      name: 'multiReceiverTypeFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.multiReceiverTypeFlag`).d('多告警接收组'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
});

const keywordExtractionData = () => ({
  selection: false,
  fields: [
    {
      name: 'reservedField',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.reservedField`).d('预留字段'),
      lookupCode: 'SITF.INTERFACE_KEYWORD_RESERVED_FIELD',
      required: true,
    },
    {
      name: 'fieldDesc',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.fieldDesc`).d('字段描述'),
      required: true,
    },
    {
      name: 'mappingField',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.mappingField`).d('映射字段'),
      required: true,
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.enabledFlag`).d('是否启用'),
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'orderSeq',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.orderSeq`).d('排序号'),
      required: true,
      defaultValue: 0,
    },
  ],

  transport: {
    read: () => {
      return {
        url: organizationRole
          ? `${SRM_INTERFACE}/v1/${organizationId}/keyword-configs`
          : `${SRM_INTERFACE_CONFIG}/v1/keyword-configs`,
        method: 'GET',
      };
    },
  },
});

const formData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceCode`).d('接口代码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.interfaceName`).d('接口名称'),
    },
  ],
});

const marmotData = () => ({
  fields: [
    {
      name: 'marmotCode',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceDef.marmotCode`).d('埋点脚本'),
      lovCode: 'SITF.ITF_DEF_REL_MARMOT_TENANT',
      lovPara: { tenantId: organizationId },
      required: true,
      transformRequest: value => value && value.taskCode,
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.description`).d('备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get(`${prefix}.model.interfaceDef.enabledFlag`).d('启用'),
      defaultValue: 1,
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'orderSeq',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceDef.orderSeq`).d('排序号'),
      defaultValue: 0,
      required: true,
    },
  ],

  transport: {
    read: () => {
      return {
        url: organizationRole
          ? `${SRM_INTERFACE}/v1/${organizationId}/itf-def-rel-marmots`
          : `${SRM_INTERFACE_CONFIG}/v1/itf-def-rel-marmots`,
        method: 'GET',
      };
    },
  },
});

const filterConditionDs = parmas => ({
  autoQuery: true,
  forceValidate: true,
  fields: [
    {
      name: 'orderSeq',
      label: intl.get(`${prefix}.model.interfaceDef.orderSeq`).d('序号'),
    },
    {
      name: 'conditionCode',
      label: intl.get(`${prefix}.model.interfaceDef.conditionName`).d('属性'),
      lookupCode: 'SITF.FILTER_CONDITION_CODE',
      required: true,
    },
    {
      name: 'conditionRelation',
      label: intl.get(`${prefix}.model.interfaceDef.conditionRelation`).d('关系'),
      lookupCode: 'SITF.FILTER_CONDITION_RELATION',
      required: true,
    },
    {
      name: 'conditionValue',
      label: intl.get(`${prefix}.model.interfaceDef.conditionValue`).d('值'),
      required: true,
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${prefix}.model.interfaceDef.enabledFlag`).d('启用'),
      lookupCode: 'HPFM.ENABLED_FLAG',
      required: true,
      defaultValue: '1',
    },
  ],

  transport: {
    read: ({ data }) => {
      return {
        url: `/sitf/v1/${organizationId}/itf-def-err-msg-filter-cond`,
        method: 'GET',
        data: {
          ...data,
          ...parmas,
        },
      };
    },
    create: ({ data }) => {
      const dataC = data.map(item => ({ ...item, ...parmas }));
      return {
        url: `/sitf/v1/${organizationId}/itf-def-err-msg-filter-cond`,
        method: 'POST',
        dataC,
      };
    },
    update: ({ data }) => {
      const dataC = data.map(item => ({ ...item, ...parmas }));
      return {
        url: `/sitf/v1/${organizationId}/itf-def-err-msg-filter-cond`,
        method: 'POST',
        dataC,
      };
    },
    submit: ({ data }) => {
      const dataC = data.map(item => ({ ...item, ...parmas }));
      return {
        url: `/sitf/v1/${organizationId}/itf-def-err-msg-filter-cond`,
        method: 'POST',
        dataC,
      };
    },
    destroy: ({ data }) => {
      const dataC = data.map(item => ({ ...item, ...parmas }));
      return {
        url: `/sitf/v1/${organizationId}/itf-def-err-msg-filter-cond`,
        method: 'DELETE',
        dataC,
      };
    },
  },
});

const multiReceiverData = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'receiverTypeCodeLov',
      label: intl.get(`${prefix}.model.interfaceDef.receiverTypeCode`).d('告警接收组'),
      type: 'object',
      lovCode: "SITF.RECEIVER",
      textField: 'typeName',
      lovPara: { tenantId: organizationId},
      ignore: 'always',
      required: true,
    },
    {
      name: 'receiverTypeCode',
      bind: 'receiverTypeCodeLov.typeCode',
    },
    {
      name: 'receiverTypeMeaning',
      bind: 'receiverTypeCodeLov.typeName',
    },
    {
      name: 'conditionExpression',
      multiple: ',',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.conditionExpression`).d('条件表达式'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `/sitf/v1/${organizationId}/itf-def-multi-alarm-receiver`,
        method: 'GET',
      };
    },
    submit: () => {
      return {
        url: `/sitf/v1/${organizationId}/itf-def-multi-alarm-receiver`,
        method: 'POST',
      };
    },
    destroy: () => {
      return {
        url: `/sitf/v1/${organizationId}/itf-def-multi-alarm-receiver`,
        method: 'DELETE',
      };
    },
  },
});

const conditionLineVOListData = () => ({
  forceValidate: true,
  fields: [
    {
      name: 'leftValue',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.leftValue`).d('左参数'),
      lookupCode: 'SITF.ITF_DEF_COND_PARAM_KEY',
      required: true,
    },
    {
      name: 'operator',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.operator`).d('操作符'),
      lookupCode: 'SITF.ITF_DEF_COND_OP',
      required: true,
    },
    {
      name: 'rightValue',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceDef.rightValue`).d('右参数'),
      required: true,
    },
  ],
});

export { tableData, modalData, keywordExtractionData, formData, marmotData, filterConditionDs, multiReceiverData, conditionLineVOListData };
