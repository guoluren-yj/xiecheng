import intl from 'utils/intl';
// import { SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

const prefix = `/sbdm/v1`;

const organizationId = getCurrentOrganizationId();
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const baseInfoDS = () => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  dataToJSON: 'all',
  fields: [
    {
      name: 'budgetTemplateCode',
      label: intl.get(`${commonPrompt}.budgetTemplateCode`).d('预算模板编码'),
      disabled: true,
    },
    {
      name: 'budgetTemplateDesc',
      required: true,
      type: 'intl',
      label: intl.get(`${commonPrompt}.budgetTemplateDesc`).d('预算模板描述'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      required: true,
      defaultValue: '1',
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('templateStatus') === 'UNRELEASED' || record.status === 'add';
        },
      },
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    },
    {
      name: 'templateStatus',
      disabled: true,
      label: intl.get(`hzero.common.status`).d('状态'),
      // defaultValue: 'NEW',
      lookupCode: 'SRPM.CONTAINER_STATUS',
    },
    {
      name: 'templateStatusMeaning',
      disabled: true,
      label: intl.get(`hzero.common.status`).d('状态'),
      // defaultValue: 'NEW',
      // lookupCode: 'SRPM.CONTAINER_STATUS',
    },
    {
      name: 'createdByName',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'creationDate',
      disabled: true,
      format: getDateTimeFormat(),
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'version',
      disabled: true,
      label: intl.get(`${commonPrompt}.version`).d('版本'),
    },
    {
      name: 'lastUpdateDate',
      disabled: true,
      format: getDateTimeFormat(),
      label: intl.get(`${commonPrompt}.updateDate`).d('更新时间'),
      type: 'dateTime',
    },
  ],
});

const dimensionGroupLineDS = ({ budgetTemplateId, selection = 'multiple' }) => ({
  autoQuery: false,
  autoLocateFirst: false,
  cacheSelection: true,
  cacheModified: true,
  selection,
  dataToJSON: 'all',
  primaryKey: 'budgetItemCode',
  pageSize: 20,
  fields: [
    {
      name: 'budgetItemCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.budgetItemCode`).d('维度编码'),
    },
    {
      name: 'budgetItemName',
      type: 'string',
      label: intl.get(`${commonPrompt}.budgetItemName`).d('维度名称'),
    },
    {
      name: 'gridSeq',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
      label: intl.get(`${commonPrompt}.gridSeq`).d('位置'),
      help: intl
        .get(`${commonPrompt}.gridSeqHelpTip`)
        .d(
          '用以控制预算编制功能下，预算详情页面，以及预算行列表页面预算维度字段的相对位置。预算维度位于行预算说明和预算总额之间，按数字大小从小到大排列。'
        ),
    },
    {
      name: 'gridWidth',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
      label: intl.get(`${commonPrompt}.gridWidth`).d('宽度'),
      help: intl
        .get(`${commonPrompt}.gridWidthHelpTip`)
        .d('用以控制预算编制功能下，预算详情页面，以及预算行列表页面预算维度字段的列宽。'),
    },
    {
      name: 'requiredFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.required`).d('必输'),
      help: intl
        .get(`${commonPrompt}.requiredFlagHelpTip`)
        .d('用以控制预算编制时，预算维度字段是否必输。'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.query`).d('作为查询条件'),
      help: intl
        .get(`${commonPrompt}.queryFlagHelpTip`)
        .d('用以控制预算编制功能下，预算详情页面，以及预算行列表页面预算维度是否作为查询条件。'),
    },
    {
      name: 'multipleFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.multiple`).d('多选'),
      help: intl
        .get(`${commonPrompt}.multipleFlagHelpTip`)
        .d('用以控制预算编制时，预算维度字段是否允许多选。'),
      dynamicProps: {
        disabled: ({ record }) => record.get('componentType') === 'TEXT',
      },
    },
    // {
    //   name: 'encryptFlag',
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    //   defaultValue: 0,
    //   required: true,
    //   label: intl.get(`${commonPrompt}.encryptFlag`).d('是否强制加密'),
    // },
    {
      name: 'budgetFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      required: true,
      label: intl.get(`${commonPrompt}.budgetCheckDimension`).d('作为预算校验维度'),
      help: intl
        .get(`${commonPrompt}.budgetFlagHelpTip`)
        .d(
          '1、用以进行预算编制唯一性校验：在预算编制时，同一预算模板下，预算校验维度+预算有效期+预算币种，值组合唯一；2、用以进行预算匹配：在预算校验、占用、更新时，将业务字段映射为预算维度后，取值预算校验维度值+预算币种+预算校验时间，组合后匹配唯一的预算行。'
        ),
    },
    {
      name: 'inheritFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.records.forEach(record => {
        if (record.get('inheritFlag') === 1) {
          record.selectable = false;
        }
      });
    },
  },
  transport: {
    read: ({ data }) => {
      return {
        url: `${prefix}/${organizationId}/budget-template/items/${budgetTemplateId}`,
        method: 'GET',
        data,
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${prefix}/${organizationId}/budget-template/batch`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const dimensionLineDS = ({ budgetTemplateId }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  cacheSelection: true,
  cacheModified: true,
  primaryKey: 'budgetItemCode',
  pageSize: 20,
  transport: {
    read: {
      url: `/sbdm/v1/${organizationId}/budget-item/list-with-site${
        budgetTemplateId !== 'new' ? `?budgetTemplateId=${budgetTemplateId}` : ''
      }`,
      method: 'GET',
    },
  },
  events: {
    update: ({ name, record }) => {
      if (name === 'componentType') {
        record.set({
          lovCode: null,
        });
      }
    },
  },
  fields: [
    {
      name: 'budgetItemCode',
      type: 'string',
      required: true,
      pattern: /^[a-zA-Z][0-9a-zA-Z_]*$/,
      label: intl.get(`${commonPrompt}.budgetItemCode`).d('维度编码'),
      dynamicProps: {
        disabled: ({ record }) => !!record.get('budgetItemId'),
      },
    },
    {
      name: 'budgetItemName',
      type: 'intl',
      required: true,
      label: intl.get(`${commonPrompt}.budgetItemName`).d('维度名称'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.ENABLED_FLAG',
      defaultValue: '1',
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    },
    {
      name: 'predefinedFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get(`hzero.common.source`).d('来源'),
      disabled: true,
    },
    {
      name: 'componentType',
      type: 'string',
      required: true,
      lookupCode: 'SBDM.BUDGET_COMPONENT_TYPE',
      label: intl.get(`${commonPrompt}.componentType`).d('组件类型'),
    },
    {
      name: 'lovCode',
      type: 'object',
      required: true,
      label: intl.get(`${commonPrompt}.lovCode`).d('值集'),
      transformResponse(value, data) {
        if (value) {
          if (data.componentType === 'SELECT') {
            return {
              lovCode: value,
            };
          } else {
            return {
              viewCode: value,
            };
          }
        } else {
          return null;
        }
      },
      transformRequest: (value, record) =>
        record.get('componentType') === 'SELECT' ? value?.lovCode : value?.viewCode,
      dynamicProps: {
        lovCode: ({ record }) => {
          return record.get('componentType') === 'SELECT'
            ? 'HPFM.LOV.VIEW.LOV_IDP'
            : 'HPFM.LOV.VIEW.ORG';
        },

        textField: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'viewCode';
          }
          if (componentType === 'SELECT') {
            return 'lovCode';
          }
        },

        valueField: ({ record }) => {
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            return 'viewCode';
          }
          if (componentType === 'SELECT') {
            return 'lovCode';
          }
        },
      },
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get(`${commonPrompt}.operation`).d('操作'),
    },
  ],
  record: {
    dynamicProps: {
      selectable: record => Number(record.get('enabledFlag')) === 1,
    },
  },
});

export { dimensionGroupLineDS, dimensionLineDS, baseInfoDS };
