import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `/sbdm/v1`;
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const baseInfoDS = ({ readOnly = false }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  selection: false,
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
      label: intl.get(`${commonPrompt}.budgetItemCode`).d('维度编码'),
      validator: value => {
        if (value) {
          const reg = /^[a-zA-Z][0-9a-zA-Z_]*$/;
          if (!reg.test(value)) {
            return intl
              .get(`${commonPrompt}.budgetItemVaildator`)
              .d('请输入字母开头，字母/数字/下划线组合的维度编码。');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      dynamicProps: {
        disabled: ({ record }) => !!record.get('budgetItemId'),
      },
    },
    {
      name: 'budgetItemName',
      type: 'intl',
      required: true,
      label: intl.get(`${commonPrompt}.budgetItemName`).d('维度名称'),
      dynamicProps: {
        disabled: () => readOnly,
      },
    },
    {
      name: 'enabledFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.FLAG',
      defaultValue: '1',
      label: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
      dynamicProps: {
        disabled: () => readOnly,
      },
    },
    {
      name: 'predefinedFlag',
      type: 'string',
      lookupCode: 'HPFM.FLAG',
      label: intl.get(`${commonPrompt}.predefinedFlag`).d('预定义维度标识'),
      defaultValue: '0',
      disabled: true,
    },
    {
      name: 'componentType',
      type: 'string',
      required: true,
      lookupCode: 'SBDM.BUDGET_COMPONENT_TYPE',
      label: intl.get(`${commonPrompt}.componentType`).d('组件类型'),
      dynamicProps: {
        disabled: ({ record }) => readOnly || record.get('predefinedFlag') === '1',
      },
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

        required: ({ record }) => {
          const componentType = record.get('componentType');
          return ['SELECT', 'LOV'].includes(componentType);
        },

        disabled: () => readOnly,
      },
    },
    {
      name: 'importTranslateScene',
      type: 'object',
      valueField: 'sceneCode',
      textField: 'sceneDescription',
      required: false,
      label: intl.get(`${commonPrompt}.importTranslateScene`).d('导入映射场景'),
      dynamicProps: {
        lovCode: () => {
          return 'SBDM.TRANSLATE_SCENE';
        },
        disabled: () => readOnly,
      },
      transformRequest: value => (value ? value.sceneCode : null),
      transformResponse(value, data) {
        if (value) {
          return {
            sceneCode: value,
            sceneDescription: data.importTranslateSceneDescription,
          };
        } else {
          return null;
        }
      },
    },
  ],
});

const mappingLineDS = ({ budgetItemId, readOnly = false }) => ({
  selection: readOnly ? false : 'multiple',
  autoQuery: false,
  autoLocateFirst: false,
  cacheSelection: true,
  cacheModified: true,
  dataToJSON: 'all',
  primaryKey: 'itemMappingId',
  pageSize: 20,
  transport: {
    read: () => {
      const url = `${prefix}/${tenantId}/budget-item/mapping/${budgetItemId}`;
      return {
        url,
        method: 'GET',
      };
    },

    destroy: ({ data }) => {
      const url = `${prefix}/${tenantId}/budget-item/mapping`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
  },
  fields: [
    {
      name: 'documentType',
      type: 'string',
      required: true,
      lookupCode: 'SBDM.DOCUMENT_TYPE',
      label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
    },
    {
      name: 'fieldName',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.fieldCode`).d('字段编码'),
    },
    {
      name: 'fieldNameDesc',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.fieldCodeDesc`).d('字段编码描述'),
    },
    {
      name: 'translateScene',
      type: 'object',
      valueField: 'sceneCode',
      textField: 'sceneDescription',
      lovCode: 'SBDM.TRANSLATE_SCENE',
      label: intl.get(`${commonPrompt}.translateScene`).d('映射场景'),
      transformRequest: value => (value ? value.sceneCode : null),
      transformResponse(value, data) {
        if (value) {
          return {
            sceneCode: value,
            sceneDescription: data.translateSceneDescription,
          };
        } else {
          return null;
        }
      },
    },
  ],
});

export { mappingLineDS, baseInfoDS };
