import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC, PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

const organizationId = getCurrentOrganizationId();

const headerDS = ({ modelId }) => {
  return {
    primaryKey: 'modelId',
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'modelCode',
        label: intl.get('spc.priceModel.model.priceModel.modelCode').d('价格模型编码'),
      },
      {
        name: 'modelName',
        label: intl.get('spc.priceModel.model.priceModel.modelName').d('模型名称'),
      },
      {
        name: 'modelRemark',
        label: intl.get('spc.priceModel.model.priceModel.modelRemark').d('模型说明'),
      },
      {
        name: 'modelStatusMeaning',
        label: intl.get('spc.priceModel.model.priceModel.modelStatus').d('状态'),
      },
      {
        name: 'appDimensionCode',
        label: intl.get('spc.priceModel.model.priceModel.appDimensionCode').d('适用维度'),
        lookupCode: 'SPC.PRICE_MODEL.APP_DIMENSION',
      },
      {
        name: 'appScopesLov',
        type: 'object',
        label: intl.get('spc.priceModel.model.priceModel.appScopes').d('适用范围'),
        ignore: 'always',
        multiple: true,
        dynamicProps: {
          lovCode: ({ record }) =>
            record.get('appDimensionCode') === 'ITEM'
              ? 'SPC.PRICE_MODEL.APP_DIMENSION_ITEM'
              : 'SPC.PRICE_MODEL.APP_DIMENSION_CATEGORY',
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
      },
      {
        name: 'needConfirmFlag',
        label: intl.get('spc.priceModel.model.priceModel.needConfirmFlag').d('是否需要供应商确认'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'triggerRule',
        label: intl.get('spc.priceModel.model.priceModel.triggerRule').d('触发规则'),
        lookupCode: 'SPC.PRICE_MODEL.TRIGGER_RULE',
      },
      {
        name: 'targetPriceTemplateCodeMeaning',
        label: intl.get('spc.priceModel.model.priceModel.targetPriceTemplateCode').d('写入价格库'),
      },
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

const columnTableDS = ({ modelId }) => ({
  primaryKey: 'columnId',
  selection: false,
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.columnCode`).d('列编码'),
      name: 'columnCode',
      trim: 'both',
      type: 'string',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.columnName`).d('列名称'),
      name: 'columnName',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowLine`).d('列顺序(从左到右)'),
      name: 'columnSeq',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.components`).d('组件'),
      name: 'componentType',
      lookupCode: 'SPC.PRICE_MODEL.COMPONANT_TYPE',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.batchs`).d('值集'),
      name: 'lovCode',
    },
    {
      name: 'calculateType',
      label: intl.get('spc.priceModel.model.priceModel.calculateType').d('取值类型'),
      lookupCode: 'SPC.PRICE_MODEL.COLUMN.CALCULATE_TYPE',
    },
    {
      name: 'calculateRule',
      label: intl.get('spc.priceModel.model.priceModel.calculateRule').d('取值规则'),
    },
    {
      name: 'calculateFlag',
      label: intl.get('spc.priceModel.model.priceModel.calculateFlag').d('参与计算列'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],

  events: {
    load: ({ dataSet }) => {
      // 已经加载过
      dataSet.setState('hasColumnQueriedFlag', true);
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
  },
});

const lineTableDS = ({ modelId }) => ({
  primaryKey: 'rowId',
  selection: false,
  fields: [
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowCode`).d('行编码'),
      name: 'rowCode',
      trim: 'both',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.configName`).d('行名称'),
      name: 'rowName',
    },
    {
      label: intl.get(`spc.priceModel.model.priceModel.rowSeq`).d('行顺序(从上到下)'),
      name: 'rowSeq',
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
  },
});

// 其他参数
const otherParameterDS = ({ modelId }) => {
  return {
    primaryKey: 'paramId',
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'paramCode',
        label: intl.get('spc.priceModel.model.priceModel.paramCode').d('参数编码'),
        trim: 'both',
        type: 'string',
      },
      {
        name: 'paramName',
        label: intl.get('spc.priceModel.model.priceModel.paramName').d('参数名称'),
      },
      {
        name: 'componentType',
        label: intl.get('spc.priceModel.model.priceModel.componentType').d('组件'),
        lookupCode: 'SPC.PRICE_MODEL.COMPONANT_TYPE',
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

const priceLibTableDS = ({ modelId }) => {
  return {
    autoQuery: true,
    primaryKey: 'modelDimId',
    selection: false,
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
      },
      {
        name: 'logicDetail',
        label: intl.get('spc.priceModel.model.priceModel.logicDetail').d('逻辑明细'),
        dynamicProps: (config) => {
          const { record = {} } = config || {};
          const { fieldWidget, bucketName, bucketDirectory, writeLogic } = record.get([
            'fieldWidget',
            'bucketName',
            'bucketDirectory',
            'writeLogic',
          ]);
          if (writeLogic === 'DEFAULT') {
            if (fieldWidget === 'UPLOAD') {
              return {
                type: 'attachment',
                bucketName: bucketName || PRIVATE_BUCKET,
                bucketDirectory,
                readOnly: true,
                viewMode: 'popup',
                ...(ChunkUploadProps || {}),
              };
            }
          }
        },
      },
    ],
    transport: {
      read: {
        url: `${SRM_SPC}/v1/${organizationId}/price-model-price-lib-dims/list`,
        method: 'GET',
        data: { modelId },
      },
    },
  };
};

export { headerDS, otherParameterDS, columnTableDS, lineTableDS, priceLibTableDS };
