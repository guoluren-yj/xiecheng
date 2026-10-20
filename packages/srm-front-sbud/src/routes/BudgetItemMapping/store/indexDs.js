import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const tenantId = getCurrentOrganizationId();

export default () => {
  return {
    autoQuery: true,
    autoCreate: false,
    dataToJSON: 'all',
    selection: false,
    pageSize: 20,
    transport: {
      read: {
        url: `/sbdm/v1/${tenantId}/budget-item/list?customizeUnitCode=SBUD_BUDGET_MAPPING.LIST,SBUD_BUDGET_MAPPING.SEARCH`,
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
        label: intl.get(`${commonPrompt}.status`).d('是否启用'),
      },
      {
        name: 'predefinedFlag',
        type: 'string',
        lookupCode: 'SBUD.PREDEFINED_FLAG',
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
        name: 'importTranslateSceneDescription',
        type: 'string',
        label: intl.get(`${commonPrompt}.importTranslateScene`).d('导入映射场景'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get(`${commonPrompt}.operation`).d('操作'),
      },
    ],
    // queryFields: [
    //   {
    //     name: 'budgetItemCode',
    //     type: 'string',
    //     label: intl.get(`${commonPrompt}.budgetItemCode`).d('维度编码'),
    //   },
    //   {
    //     name: 'lovCode',
    //     type: 'string',
    //     label: intl.get(`${commonPrompt}.contactLovCode`).d('关联值集'),
    //   },
    //   {
    //     name: 'enabledFlag',
    //     lookupCode: 'HPFM.FLAG',
    //     label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    //     type: 'string',
    //   },
    //   {
    //     name: 'predefinedFlag',
    //     lookupCode: 'HPFM.FLAG',
    //     label: intl.get(`${commonPrompt}.predefinedFlag`).d('预定义维度标识'),
    //     type: 'string',
    //   },
    // ],
  };
};
