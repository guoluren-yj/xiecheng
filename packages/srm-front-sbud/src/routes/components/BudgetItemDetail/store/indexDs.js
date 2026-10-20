import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const prefix = `/sbdm/v1`;
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const baseInfoDS = ({ isTenant, disabled = false }) => ({
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
        disabled: () => disabled,
      },
    },
    {
      name: 'enabledFlag',
      type: 'string',
      required: true,
      lookupCode: 'HPFM.ENABLED_FLAG',
      defaultValue: '1',
      label: intl.get('hzero.common.status').d('状态'),
      dynamicProps: {
        disabled: () => disabled,
      },
    },
    {
      name: 'predefinedFlag',
      type: 'string',
      lookupCode: 'SBUD.PREDEFINED_FLAG',
      label: intl.get(`hzero.common.source`).d('来源'),
      dynamicProps: {
        defaultValue: isTenant ? '1' : '0',
      },
      disabled: true,
    },
    {
      name: 'componentType',
      type: 'string',
      required: true,
      lookupCode: 'SBDM.BUDGET_COMPONENT_TYPE',
      label: intl.get(`${commonPrompt}.componentType`).d('组件类型'),
      dynamicProps: {
        disabled: ({ record }) => disabled || (record.get('predefinedFlag') === '1' && isTenant),
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
            ? isTenant
              ? 'HPFM.LOV.VIEW.LOV_IDP'
              : 'HPFM.LOV.VIEW.LOV_IDP.SITE'
            : isTenant
            ? 'HPFM.LOV.VIEW.ORG'
            : 'HPFM.LOV_VIEW';
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

        disabled: () => disabled,
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
          return isTenant ? 'SBDM.TRANSLATE_SCENE' : 'SBDM.TRANSLATE_SCENE_SITE';
        },
        disabled: () => disabled,
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

const mappingLineDS = ({ isTenant, headrId, disabled = false }) => ({
  selection: disabled ? false : 'multiple',
  autoQuery: false,
  autoLocateFirst: false,
  cacheSelection: true,
  cacheModified: true,
  dataToJSON: 'all',
  primaryKey: 'itemMappingId',
  pageSize: 20,
  transport: {
    read: () => {
      const url = isTenant
        ? `${prefix}/${tenantId}/budget-item/mapping/${headrId}`
        : `${prefix}/budget-item-pre/mapping/${headrId}`;
      return {
        url,
        method: 'GET',
      };
    },

    destroy: ({ data }) => {
      const url = isTenant
        ? `${prefix}/${tenantId}/budget-item/mapping`
        : `${prefix}/budget-item-pre/mapping`;
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
      label: intl.get(`${commonPrompt}.translateScene`).d('映射场景'),
      dynamicProps: {
        lovCode: () => {
          return isTenant ? 'SBDM.TRANSLATE_SCENE' : 'SBDM.TRANSLATE_SCENE_SITE';
        },
      },
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
