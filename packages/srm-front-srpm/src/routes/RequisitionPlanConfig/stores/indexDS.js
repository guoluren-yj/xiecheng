import intl from 'utils/intl';
import moment from 'moment';
import { SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'srpm.common.model.common';

const listLineDS = () => ({
  pageSize: 20,
  primaryKey: 'containerId',
  autoLocateFirst: false,
  cacheSelection: true,
  cacheModified: true,
  selection: false,
  fields: [
    {
      name: 'containerStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'operator',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'containerCode',
      label: intl.get(`${commonPrompt}.containerCode`).d('需求计划编码'),
    },
    {
      name: 'containerName',
      label: intl.get(`${commonPrompt}.requisitionPlanName`).d('需求计划名称'),
    },
    // {
    //   name: 'templateType',
    //   lookupCode: 'SRPM.TEMPLATE_TYPE',
    //   label: intl.get(`${commonPrompt}.templateType`).d('模版类型'),
    // },
    {
      name: 'version',
      type: 'number',
      label: intl.get(`${commonPrompt}.version`).d('版本号'),
    },
    {
      name: 'enabledFlag',
      label: intl.get(`hzero.common.model.common.enableFlag`).d('是否启用'),
    },
    {
      name: 'defaultCheckFlag',
      label: intl.get(`${commonPrompt}.defaultCheckFlag`).d('是否默认'),
    },
    {
      name: 'effectiveTime',
      min: moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.effectiveTime`).d('有效期'),
      range: ['effectiveTimeFrom', 'effectiveTimeTo'],
      type: 'date',
      transformResponse: (_, record) => {
        const { effectiveTimeFrom, effectiveTimeTo } = record;
        return { effectiveTimeFrom, effectiveTimeTo };
      },
    },
    {
      name: 'creationDate',
      disabled: true,
      label: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
      type: 'dateTime',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan-container/list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          customizeUnitCode: 'SRPM.RP_CONFIG_LIST.SEARCHBAR,SRPM.RP_CONFIG_LIST.TABLE',
        }),
      };
    },
  },
});

const baseInfoDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'containerCode',
      required: false,
      label: intl.get(`${commonPrompt}.containerCode`).d('需求计划编码'),
      disabled: true,
    },
    {
      name: 'containerName',
      required: true,
      type: 'intl',
      label: intl.get(`${commonPrompt}.requisitionPlanName`).d('需求计划名称'),
    },
    // {
    //   name: 'templateType',
    //   required: true,
    //   label: intl.get(`${commonPrompt}.templateType`).d('模版类型'),
    //   lookupCode: 'SRPM.TEMPLATE_TYPE',
    // },
    {
      name: 'containerStatus',
      disabled: true,
      label: intl.get(`hzero.common.status`).d('状态'),
      defaultValue: 'NEW',
      lookupCode: 'SRPM.CONTAINER_STATUS',
    },
    {
      name: 'effectiveTime',
      min: moment('1970-01-01'),
      label: intl.get(`${commonPrompt}.effectiveTime`).d('有效期'),
      range: ['effectiveTimeFrom', 'effectiveTimeTo'],
      type: 'dateTime',
      ignore: 'always',
      required: true,
      transformResponse: (_, record) => {
        const { effectiveTimeFrom, effectiveTimeTo } = record;
        return { effectiveTimeFrom, effectiveTimeTo };
      },
    },
    { name: 'effectiveTimeFrom', type: 'dateTime', bind: 'effectiveTime.effectiveTimeFrom' },
    { name: 'effectiveTimeTo', type: 'dateTime', bind: 'effectiveTime.effectiveTimeTo' },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      label: intl.get(`hzero.common.date.creationDate`).d('创建日期'),
      type: 'dateTime',
    },
    {
      name: 'enabledFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      label: intl.get(`hzero.common.model.common.enableFlag`).d('是否启用'),
    },
    {
      name: 'version',
      disabled: true,
      label: intl.get(`${commonPrompt}.version`).d('版本号'),
    },
    {
      name: 'defaultCheckFlag',
      required: true,
      defaultValue: 0,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${commonPrompt}.defaultCheckFlag`).d('是否默认'),
      // lookupCode: 'HPFM.FLAG',
      help: intl
        .get(`${commonPrompt}.defaultCheckFlagHelp`)
        .d('当配置为是时，首次进入需求计划执行工作台则默认取当前需求计划'),
      // dynamicProps: {
      //   disabled: ({ record }) => record.get('containerStatus') !== 'NEW',
      // },
    },
    {
      name: 'versionControlFlag',
      required: true,
      defaultValue: 0,
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${commonPrompt}.versionControlFlag`).d('是否启用版本控制'),
      // lookupCode: 'HPFM.FLAG',
      dynamicProps: {
        help: ({ record }) => {
          if (record.get('containerStatus') === 'NEW') {
            return intl
              .get(`${commonPrompt}.versionControlHelp`)
              .d('需求计划发布之后，是否启用版本字段不可修改！');
          }
        },
        disabled: ({ record }) => record.get('containerStatus') !== 'NEW',
      },
    },
    {
      name: 'appointorId',
      label: intl.get(`${commonPrompt}.appointorId`).d('指定审批人'),
      lovCode: 'SPCM.ACCEPT_USER',
      lovPara: { tenantId: organizationId },
      textField: 'userName',
      // valueField: 'userId',
      // required: true,
      type: 'object',
      transformResponse(value, data) {
        if (value) {
          return {
            userId: value,
            userName: data.appointorName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.userId,
    },
    {
      name: 'appointorName',
      bind: 'appointorId.userName',
    },
  ],
});

const splitHeaderDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'splitNode',
      type: 'string',
      label: intl.get(`${commonPrompt}.splitNode`).d('拆分节点'),
      lookupCode: 'SRPM.SPLIT_NODE',
      defaultValue: 'NOT_SPLIT',
    },
    {
      name: 'splitMode',
      type: 'string',
      label: intl.get(`${commonPrompt}.splitMode`).d('拆分方式'),
      lookupCode: 'SRPM.SPLIT_MODE',
      dynamicProps: {
        required: ({ record }) => record.get('splitNode') === 'BALANCE_SPLIT',
      },
    },
    {
      name: 'splitQuantityControlRule',
      type: 'string',
      label: intl.get(`${commonPrompt}.splitQuantityControlRule`).d('拆分数量控制规则'),
      lookupCode: 'SRPM.SPLIT_QUANTITY_CONTR_RULE',
      dynamicProps: {
        required: ({ record }) =>
          ['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(record.get('splitNode')),
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (name === 'splitNode') {
        record.set({
          splitMode: null,
          splitQuantityControlRule: null,
        });
      }
    },
  },
});

const mergeHeaderDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'mergeQuantityControlRule',
      required: true,
      type: 'string',
      label: intl.get(`${commonPrompt}.mergeQuantityControlRule`).d('合并数量控制规则'),
      lookupCode: 'SRPM.MERGE_QUANTITY_CONTR_RULE',
      defaultValue: 'NOT_CONTROL',
    },
  ],
});

const balanceHeaderDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'balanceQuantityControlRule',
      required: true,
      type: 'string',
      label: intl.get(`${commonPrompt}.balanceQuantityControlRule`).d('平衡数量控制规则'),
      lookupCode: 'SRPM.BALANCE_QUANTITY_CONTR_RULE',
      defaultValue: 'NOT_CONTROL',
    },
  ],
});

const splitLineDS = ({ containerId }) => ({
  autoQuery: false,
  autoLocateFirst: false,
  cacheSelection: true,
  primaryKey: 'configId',
  pageSize: 20,
  fields: [
    {
      name: 'dimensionType',
      required: true,
      lookupCode: 'SRPM.CONTAINER_CONFIG_DIMENSION',
      label: intl.get(`${commonPrompt}.dimensionType`).d('类型'),
    },
    {
      name: 'dimensionField',
      type: 'object',
      required: true,
      lovCode: 'SADA.SIMPLE_ENTITY_FIELD_VIEW',
      valueField: 'name',
      textField: 'description',
      label: intl.get(`${commonPrompt}.dimension`).d('维度'),
      dynamicProps: {
        lovPara: ({ record }) => ({
          entityCode:
            record.get('dimensionType') === 'HEADER' ? 'SRM_SRPM_RP_HEADER' : 'SRM_SRPM_RP_LINE',
          templateId: -1,
          target: false,
        }),
      },
      transformResponse(value, data) {
        if (value) {
          return {
            name: value,
            userName: data.dimensionFieldMeaning,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.name,
    },
    {
      name: 'dimensionFieldMeaning',
      bind: 'dimensionField.description',
    },
    {
      name: 'editFlag',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.detailDimension`).d('明细维度'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan-container/lines/${containerId}`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          configType: 'SPLIT',
        }),
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan-container/lines`,
        method: 'DELETE',
        data,
      };
    },
  },
  events: {
    update: ({ name, record }) => {
      if (name === 'dimensionType') {
        record.set({
          dimensionField: null,
        });
      }
    },
  },
});

const mergeLineDS = ({ containerId }) => ({
  autoQuery: false,
  autoLocateFirst: false,
  cacheSelection: true,
  primaryKey: 'configId',
  pageSize: 20,
  fields: [
    {
      name: 'dimensionType',
      lookupCode: 'SRPM.CONTAINER_CONFIG_DIMENSION',
      required: true,
      label: intl.get(`${commonPrompt}.dimensionType`).d('类型'),
    },
    {
      name: 'dimensionField',
      type: 'object',
      required: true,
      lovCode: 'SADA.SIMPLE_ENTITY_FIELD_VIEW',
      valueField: 'name',
      textField: 'description',
      label: intl.get(`${commonPrompt}.dimension`).d('维度'),
      transformResponse(value, data) {
        if (value) {
          return {
            name: value,
            userName: data.dimensionFieldMeaning,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.name,
      dynamicProps: {
        lovPara: ({ record }) => ({
          entityCode:
            record.get('dimensionType') === 'HEADER' ? 'SRM_SRPM_RP_HEADER' : 'SRM_SRPM_RP_LINE',
          templateId: -1,
          target: false,
        }),
      },
    },
    {
      name: 'dimensionFieldMeaning',
      bind: 'dimensionField.description',
    },
    {
      name: 'mergeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.mergeFlagCondition`).d('该维度是否为合并一致性校验条件'),
    },
    {
      required: true,
      name: 'dimensionConfig',
      lookupCode: 'SPRM.MERGE_DIMENSION_CONFIG_TYPE',
      defaultValue: 'MANUAL',
      dynamicProps: {
        required: ({ record }) => {
          return ![1, '1'].includes(record.get('mergeFlag'));
        },
        disabled: ({ record }) => {
          return [1, '1'].includes(record.get('mergeFlag'));
        },
      },
      label: intl.get(`${commonPrompt}.conflictMergeRule`).d('合并后冲突字段默认处理逻辑'),
    },
    {
      required: true,
      name: 'mergeAfterEditFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`${commonPrompt}.mergeAfterEditFlag`).d('合并后是否允许修改'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan-container/lines/${containerId}`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          configType: 'MERGE',
        }),
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan-container/lines`,
        method: 'DELETE',
        data,
      };
    },
  },
  events: {
    update: ({ name, record, value }) => {
      if (name === 'mergeFlag' && value) {
        record.set({
          dimensionConfig: null,
        });
      }

      if (name === 'dimensionType') {
        record.set({
          dimensionField: null,
        });
      }
    },
  },
});

const copyDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'containerCode',
      required: true,
      label: intl.get(`${commonPrompt}.containerCode`).d('需求计划编码'),
    },
  ],
});
export {
  listLineDS,
  baseInfoDS,
  splitHeaderDS,
  mergeHeaderDS,
  balanceHeaderDS,
  splitLineDS,
  mergeLineDS,
  copyDS,
};
