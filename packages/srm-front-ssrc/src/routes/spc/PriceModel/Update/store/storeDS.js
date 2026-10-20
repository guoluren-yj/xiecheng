import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';

import { logicDetailPropsRender } from '../../../utils/utils';

const organizationId = getCurrentOrganizationId();

const headerDS = ({ modelId }) => {
  return {
    primaryKey: 'modelId',
    autoQuery: true,
    paging: false,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        name: 'modelCode',
        label: intl.get('spc.priceModel.model.priceModel.modelCode').d('价格模型编码'),
        disabled: true,
      },
      {
        name: 'modelName',
        label: intl.get('spc.priceModel.model.priceModel.modelName').d('模型名称'),
        disabled: true,
      },
      {
        name: 'modelRemark',
        label: intl.get('spc.priceModel.model.priceModel.modelRemark').d('模型说明'),
        disabled: true,
      },
      {
        name: 'modelStatusMeaning',
        label: intl.get('spc.priceModel.model.priceModel.modelStatus').d('状态'),
        disabled: true,
      },
      {
        name: 'appDimensionCode',
        label: intl.get('spc.priceModel.model.priceModel.appDimensionCode').d('适用维度'),
        lookupCode: 'SPC.PRICE_MODEL.APP_DIMENSION',
        required: true,
      },
      {
        name: 'appScopesLov',
        type: 'object',
        label: intl.get('spc.priceModel.model.priceModel.appScopes').d('适用范围'),
        ignore: 'always',
        multiple: true,
        required: true,
        lovPara: {
          asyncCountFlag: 'Y',
          modelId,
        },
        dynamicProps: {
          lovCode: ({ record }) =>
            record.get('appDimensionCode') === 'ITEM'
              ? 'SPC.PRICE_MODEL.APP_DIMENSION_ITEM'
              : 'SPC.PRICE_MODEL.APP_DIMENSION_CATEGORY',
          optionsProps({ record }) {
            const appDimensionCode = record.get('appDimensionCode');
            if (appDimensionCode === 'CATEGORY') {
              // 返回直接是树形
              return {
                paging: 'server',
                idField: 'dataId',
                parentField: 'parentDataId',
              };
            }
          },
        },
      },
      {
        name: 'appScope',
        type: 'string',
        bind: 'appScopesLov.dataId',
        multiple: ',',
      },
      {
        name: 'appScopeMeaning',
        type: 'string',
        bind: 'appScopesLov.dataName',
        multiple: ',',
      },
      {
        name: 'needApprovalFlag',
        label: intl.get('spc.priceModel.model.priceModel.needApprovalFlag').d('是否需要审批'),
        lookupCode: 'HPFM.FLAG',
        required: true,
      },
      {
        name: 'needConfirmFlag',
        label: intl.get('spc.priceModel.model.priceModel.needConfirmFlag').d('是否需要供应商确认'),
        lookupCode: 'HPFM.FLAG',
        required: true,
      },
      {
        name: 'triggerRule',
        label: intl.get('spc.priceModel.model.priceModel.triggerRule').d('触发规则'),
        lookupCode: 'SPC.PRICE_MODEL.TRIGGER_RULE',
        required: true,
      },
      {
        name: 'targetPriceTemplateCodeLov',
        type: 'object',
        ignore: 'always',
        label: intl.get('spc.priceModel.model.priceModel.targetPriceTemplateCode').d('写入价格库'),
        lovCode: 'SSRC.PRICE_LIB_TEMPLATE',
        required: true,
      },
      {
        name: 'targetPriceTemplateCode',
        type: 'string',
        bind: 'targetPriceTemplateCodeLov.templateCode',
      },
      {
        name: 'targetPriceTemplateCodeMeaning',
        type: 'string',
        bind: 'targetPriceTemplateCodeLov.templateName',
      },
      {
        name: 'calculateFormula',
      },
      {
        name: 'calculateFormulaMeaning',
      },
    ],
    events: {
      update: ({ name, value, record }) => {
        if (name === 'appDimensionCode') {
          // 切换取值类型，清空取值规则
          if (value && record.get('appScope')) {
            record.set({
              appScope: null,
              appScopeMeaning: null,
              appScopesLov: null,
            });
          }
        }
      },
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-models/detail`,
          method: 'GET',
          data: {
            modelId,
            latestFlag: 'P',
          },
        };
      },
    },
  };
};

const moduleFormDS = ({ modelId }) => ({
  primaryKey: 'moduleId',
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.moduleName`).d('模块名称'),
      name: 'moduleName',
      required: true,
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.moduleCode`).d('模块代码'),
      name: 'moduleCode',
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('moduleCode'))) {
          return intl.get(`spc.priceModel.validation.moduleCode`).d('模块代码不能为中文');
        }
        return true;
      },
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-modules/save`,
        data: data.map((item) => ({
          ...item,
          modelId,
        })),
        method: 'POST',
      };
    },
    destroy: {
      url: `${SRM_SPC}/v1/${organizationId}/price-model-modules`,
      method: 'DELETE',
    },
  },
});

const columnTableDS = ({ modelId }) => ({
  primaryKey: 'columnId',
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.columnCode`).d('列编码'),
      name: 'columnCode',
      required: true,
      trim: 'both',
      type: 'string',
      validator: (value, _, record) => {
        const reg = /^[a-z]+$/i;
        if (!reg.test(record.get('columnCode'))) {
          return intl.get(`spc.priceModel.validation.columnCode`).d('列编码只能由英文字母组成');
        }
        return true;
      },
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.columnName`).d('列名称'),
      name: 'columnName',
      required: true,
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowLine`).d('列顺序(从左到右)'),
      name: 'columnSeq',
      type: 'number',
      required: true,
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.components`).d('组件'),
      name: 'componentType',
      lookupCode: 'SPC.PRICE_MODEL.COMPONANT_TYPE',
      required: true,
      clearButton: false,
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.batchs`).d('值集'),
      name: 'lovCodeLov',
      type: 'object',
      ignore: 'always',
      lovPara: { enabledFlag: 1, lovQueryFlag: 1, tenantId: organizationId },
      dynamicProps: {
        lovCode: ({ record }) =>
          record.get('componentType') === 'Lov'
            ? 'HPFM.LOV.VIEW.ORG'
            : 'HPFM.LOV.LOV_DETAIL_CODE.ORG',
        disabled: ({ record }) =>
          record.get('componentType') !== 'ValueList' && record.get('componentType') !== 'Lov',
        required: ({ record }) =>
          record.get('componentType') === 'ValueList' || record.get('componentType') === 'Lov',
        textField: ({ record }) => (record.get('componentType') === 'Lov' ? 'viewCode' : 'lovCode'),
        lovQueryAxiosConfig: ({ record }) => {
          if (record.get('componentType') === 'ValueList') {
            return {
              url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-headers`,
              method: 'GET',
              params: { enabledFlag: 1 },
            };
          } else if (record.get('componentType') === 'Lov') {
            return {
              url: `/hpfm/v1/${getCurrentOrganizationId()}/lov-view-headers`,
              method: 'GET',
            };
          }
        },
      },
    },
    {
      name: 'lovId',
      bind: 'lovCodeLov.lovId',
    },
    {
      name: 'lovCode',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('componentType') === 'Lov' ? 'lovCodeLov.viewCode' : 'lovCodeLov.lovCode',
      },
    },
    {
      name: 'calculateType',
      label: intl.get('spc.priceModel.model.priceModel.calculateType').d('取值类型'),
      lookupCode: 'SPC.PRICE_MODEL.COLUMN.CALCULATE_TYPE',
      required: true,
    },
    {
      name: 'calculateRule',
      label: intl.get('spc.priceModel.model.priceModel.calculateRule').d('取值规则'),
      dynamicProps: {
        required: ({ record }) => record.get('calculateType') !== 'MANUAL',
      },
    },
    {
      name: 'calculateFlag',
      label: intl.get('spc.priceModel.model.priceModel.calculateFlag').d('参与计算列'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => record.get('componentType') !== 'InputNumber',
      },
    },
  ],

  events: {
    update: ({ name, value, record, oldValue }) => {
      if (name === 'calculateType') {
        // 切换取值类型，清空取值规则
        if (value) {
          record.set('calculateRule', null);
        }
      }
      if (name === 'componentType') {
        // 只有数值类型才能参与计算列
        if (value !== 'InputNumber' && oldValue === 'InputNumber') {
          record.set('calculateFlag', 0);
        }
        // 清空值集数据
        if (value !== 'Lov' || (value !== 'ValueList' && record.get('lovCodeLov'))) {
          record.set({
            lovId: null,
            lovCode: null,
            lovCodeLov: null,
          });
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-columns/list`,
        method: 'GET',
        data: {
          modelId,
          moduleId: dataSet.getState('moduleId'),
        },
      };
    },
    destroy: {
      url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-columns`,
      method: 'DELETE',
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-columns/save`,
        data,
        method: 'POST',
      };
    },
  },
});

const lineTableDS = ({ modelId }) => ({
  primaryKey: 'rowId',
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowCode`).d('行编码'),
      name: 'rowCode',
      required: true,
      trim: 'both',
      type: 'string',
      validator: (value, _, record) => {
        const reg = /([a-zA-Z]+[0-9]*)/;
        if (!reg.test(record.get('rowCode'))) {
          return intl
            .get(`spc.priceModel.validation.rowCode`)
            .d('行编码只能输入英文和数字且不能是纯数字');
        }
        return true;
      },
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.configName`).d('行名称'),
      name: 'rowName',
      required: true,
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowSeq`).d('行顺序(从上到下)'),
      name: 'rowSeq',
      type: 'number',
      required: true,
      precision: 0,
      min: 0,
    },
  ],

  events: {
    load: ({ dataSet }) => {
      // 初始load设置firstLoadFlag
      if (!dataSet.getState('firstLoadFlag')) {
        dataSet.setState('firstLoadFlag', true);
      } else if (dataSet.getState('firstLoadFlag')) {
        // 保存删除后的load，触发更新数据引用
        const fetchParamsAll = dataSet.getState('fetchParamsAll');
        fetchParamsAll();
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-rows/list`,
        method: 'GET',
        data: {
          modelId,
          moduleId: dataSet.getState('moduleId'),
        },
        transformResponse: (res) => {
          const result = JSON.parse(res);
          const response = getResponse(result);
          if (response) {
            const { content = [], ...pages } = response;
            const data = content.map((item) => {
              const { priceModelQuoRowColumns = [], ...otherItem } = item;
              let elementValue = {};
              // eslint-disable-next-line no-unused-expressions
              priceModelQuoRowColumns?.forEach?.((elementItem) => {
                elementValue = {
                  ...elementValue,
                  [elementItem.columnId]: elementItem.value,
                  [`${elementItem.columnId}Meaning`]: elementItem.valueMeaning,
                };
              });
              return {
                ...otherItem,
                ...elementValue,
                priceModelQuoRowColumns,
              };
            });
            return { ...pages, content: data };
          }
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-rows`,
        method: 'DELETE',
      };
    },
    submit: ({ data, dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-rows/save`,
        data: data.map((item) => {
          const { priceModelQuoRowColumns = [], ...otherItems } = item;
          const newQuotationColumns = priceModelQuoRowColumns.map((i) => {
            const newObj = {
              ...i,
              value: otherItems[i.columnId],
              valueMeaning: otherItems[`${i.columnId}Meaning`],
            };
            // 删除不必要的字段
            delete otherItems[i.columnId];
            delete otherItems[`${i.columnId}Meaning`];
            return newObj;
          });
          return {
            ...otherItems,
            modelId,
            moduleId: dataSet.getState('moduleId'),
            priceModelQuoRowColumns: newQuotationColumns,
          };
        }),
        method: 'POST',
      };
    },
  },
});

// 其他参数
const otherParameterDS = ({ modelId }) => {
  return {
    primaryKey: 'paramId',
    dataToJSON: 'all',
    autoQuery: true,
    fields: [
      {
        name: 'paramCode',
        label: intl.get('spc.priceModel.model.priceModel.paramCode').d('参数编码'),
        required: true,
        trim: 'both',
        type: 'string',
        validator: (value, _, record) => {
          const reg = /([a-zA-Z]+[0-9]*)/;
          if (!reg.test(record.get('paramCode'))) {
            return intl
              .get(`spc.priceModel.validation.paramCode`)
              .d('参数编码只能输入英文和数字且不能是纯数字');
          }
          return true;
        },
      },
      {
        name: 'paramName',
        label: intl.get('spc.priceModel.model.priceModel.paramName').d('参数名称'),
        required: true,
      },
      {
        name: 'componentType',
        label: intl.get('spc.priceModel.model.priceModel.componentType').d('组件'),
        lookupCode: 'SPC.PRICE_MODEL.COMPONANT_TYPE',
        required: true,
        defaultValue: 'InputNumber',
        disabled: true,
      },
      {
        name: 'calculateType',
        label: intl.get('spc.priceModel.model.priceModel.calculateType').d('取值类型'),
        lookupCode: 'SPC.PRICE_MODEL.PARAM.CALCULATE_TYPE',
        required: true,
      },
      {
        name: 'calculateRule',
        label: intl.get('spc.priceModel.model.priceModel.calculateRule').d('取值规则'),
        required: true,
        dynamicProps: {
          required: ({ record }) => record.get('calculateType') !== 'MANUAL',
        },
      },
    ],
    events: {
      load: ({ dataSet }) => {
        // 初始load设置firstLoadFlag
        if (!dataSet.getState('firstLoadFlag')) {
          dataSet.setState('firstLoadFlag', true);
        } else if (dataSet.getState('firstLoadFlag')) {
          // 保存删除后的load，触发更新数据引用
          dataSet.getState('fetchParamsAll')();
        }
      },
      update: ({ record, name, value }) => {
        if (name === 'calculateType') {
          // 切换取值类型，清空取值规则
          if (value) {
            record.set('calculateRule', null);
          }
        }
      },
    },
    transport: {
      read: () => ({
        url: `${SRM_SPC}/v1/${organizationId}/price-model-params/list`,
        method: 'GET',
        data: {
          modelId,
        },
      }),
      destroy: () => ({
        url: `${SRM_SPC}/v1/${organizationId}/price-model-params`,
        method: 'DELETE',
      }),
      submit: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-model-params/save`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

const priceLibTableDS = ({ modelId }) => {
  return {
    autoQuery: true,
    primaryKey: 'modelDimId',
    selection: false,
    dataToJSON: 'all',
    pageSize: 100,
    fields: [
      {
        name: 'dimensionName',
        label: intl.get('spc.priceModel.model.priceModel.dimensionName').d('价格库字段'),
      },
      {
        name: 'dimensionCode',
        label: intl.get('spc.priceModel.model.priceModel.dimensionCode').d('字段代码'),
      },
      {
        name: 'fieldRequired',
        label: intl.get('spc.priceModel.model.priceModel.fieldRequired').d('必填性'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'fieldWidgetMeaning',
        label: intl.get('spc.priceModel.model.priceModel.fieldWidget').d('字段类型'),
      },
      {
        name: 'sourceCode',
        label: intl.get('spc.priceModel.model.priceModel.sourceCode').d('值集编码'),
      },
      {
        name: 'writeLogic',
        label: intl.get('spc.priceModel.model.priceModel.writeLogic').d('写入逻辑'),
        lookupCode: 'SPC.PRICE_MODEL.WRITE_LOGIC',
        dynamicProps: {
          required: ({ record }) => record.get('fieldRequired') === 1,
        },
      },
      {
        name: 'logicDetailObject',
        label: intl.get('spc.priceModel.model.priceModel.logicDetail').d('逻辑明细'),
        dynamicProps: (config) => {
          const { record = {} } = config || {};
          const { writeLogic } = record?.get(['writeLogic']) || {};
          if (writeLogic === 'DEFAULT') {
            return logicDetailPropsRender(record);
          }
          return {};
        },
      },
      {
        name: 'logicDetail',
        dynamicProps: (config) => {
          const { record = {} } = config || {};
          const { writeLogic, fieldWidget, priceLibDimMaps, dimensionCode } =
            record?.get([
              'fieldWidget',
              'writeLogic',
              'priceLibDimMaps',
              'dimensionCode',
              'sourceCode',
            ]) || {};
          if (writeLogic === 'DEFAULT' && fieldWidget === 'LOV') {
            const valueField = priceLibDimMaps?.find((n) => n.targetDimensionCode === dimensionCode)
              ?.sourceFromFieldName;
            return {
              bind: `logicDetailObject.${valueField || record.get('valueField')}`,
            };
          }
          return {};
        },
      },
      {
        name: 'logicDetailMeaning',
        dynamicProps: (config) => {
          const { record = {} } = config || {};
          const { writeLogic, fieldWidget, priceLibDimMaps, dimensionCode } =
            record?.get(['fieldWidget', 'writeLogic', 'priceLibDimMaps', 'dimensionCode']) || {};
          if (writeLogic === 'DEFAULT' && fieldWidget === 'LOV') {
            const displayField = priceLibDimMaps?.find(
              (n) => n.targetDimensionCode === dimensionCode
            )?.sourceFromFieldMeaning;
            return {
              bind: `logicDetailObject.${displayField || record.get('displayField')}`,
            };
          }
          return {};
        },
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'writeLogic') {
          record.set({
            logicDetailObject: null,
            logicDetail: null,
            logicDetailMeaning: null,
          });
        }
      },
    },
    transport: {
      read: {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-price-lib-dims/list`,
        method: 'GET',
        data: { modelId },
      },
      submit: {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-price-lib-dims/save`,
        method: 'POST',
      },
    },
  };
};

// 预览行信息
const previewLineTableDS = ({ modelId }) => ({
  primaryKey: 'rowId',
  selection: false,
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowCode`).d('行编码'),
      name: 'rowCode',
      type: 'string',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.configName`).d('行名称'),
      name: 'rowName',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-quo-rows/list`,
        method: 'GET',
        data: {
          modelId,
          moduleId: dataSet.getState('moduleId'),
        },
        transformResponse: (res) => {
          const result = JSON.parse(res);
          const response = getResponse(result);
          if (response) {
            const { content = [], ...pages } = response;
            const data = content.map((item) => {
              const { priceModelQuoRowColumns = [], ...otherItem } = item;
              let elementValue = {};
              // eslint-disable-next-line no-unused-expressions
              priceModelQuoRowColumns?.forEach((elementItem) => {
                elementValue = {
                  ...elementValue,
                  [elementItem.columnId]: elementItem.value,
                  [`${elementItem.columnId}Meaning`]: elementItem.valueMeaning,
                };
              });
              return {
                ...otherItem,
                ...elementValue,
                priceModelQuoRowColumns,
              };
            });
            return { ...pages, content: data };
          }
        },
      };
    },
  },
});

// 预览其他参数
const previewOtherParameterDS = ({ modelId }) => {
  return {
    primaryKey: 'paramId',
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'paramCode',
        label: intl.get('spc.priceModel.model.priceModel.paramCode').d('参数编码'),
      },
      {
        name: 'paramName',
        label: intl.get('spc.priceModel.model.priceModel.paramName').d('参数名称'),
      },
      {
        name: 'componentTypeMeaning',
        label: intl.get('spc.priceModel.model.priceModel.componentType').d('组件'),
      },
      {
        name: 'calculateType',
        label: intl.get('spc.priceModel.model.priceModel.calculateType').d('取值类型'),
        lookupCode: 'SPC.PRICE_MODEL.PARAM.CALCULATE_TYPE',
      },
      {
        name: 'calculateRule',
        label: intl.get('spc.priceModel.model.priceModel.calculateRule').d('取值规则'),
      },
    ],
    transport: {
      read: () => ({
        url: `${SRM_SPC}/v1/${organizationId}/price-model-params/list`,
        method: 'GET',
        data: {
          modelId,
        },
      }),
    },
  };
};

const previewHeaderDS = ({ modelId }) => {
  return {
    primaryKey: 'modelId',
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'calculateFormula',
      },
      {
        name: 'calculateFormulaMeaning',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-models/detail`,
          method: 'GET',
          data: {
            modelId,
            latestFlag: 'P',
          },
        };
      },
    },
  };
};

export {
  headerDS,
  otherParameterDS,
  columnTableDS,
  lineTableDS,
  moduleFormDS,
  priceLibTableDS,
  previewLineTableDS,
  previewOtherParameterDS,
  previewHeaderDS,
};
