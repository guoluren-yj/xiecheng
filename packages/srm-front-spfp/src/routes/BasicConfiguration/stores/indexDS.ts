import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { isArray, isObject } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import moment from 'moment';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentUserId, isTenantRoleLevel } from 'utils/utils';
import { DimensionType } from '../utils/type';
import { fieldLovCodeMap } from '../utils/type';

const isPlat = !isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();
// 平台级结算策略需要调用的接口前缀为site
export const prefix = `/ssta/v1${isPlat ? '/site' : ''}/${organizationId}`;
const hmdePrefix = `/hmde/v1${isPlat ? '' : `/${organizationId}`}`;


const filterList = (list) =>
{
  return list.filter(item =>
  {

    delete item.__id;
    delete item._status;
    if (item.dimensionDefinitionId) delete item.dimensionDefinitionId;
    return Object.keys(item).length;
  });
};

export const enableDS = (): DataSetProps =>
{

  return {
    autoQuery: true,
    autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'rebateEnableFlag',
        type: FieldType.boolean,
        label: intl.get(`spfp.basicConfiguration.view.message.rebateRule`).d('返利规则'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'discountEnableFlag',
        type: FieldType.boolean,
        label: intl.get(`spfp.basicConfiguration.view.message.discountRule`).d('折扣规则'),
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${prefix}/base-document-definitions/list`,
          method: 'GET',
        };
      },
      submit: ({ data }) =>
      {

        const { discountEnableFlag, rebateEnableFlag, tenantId } = data[0] || {};
        const submitData = {
          discountEnableFlag: discountEnableFlag ? 1 : 0,
          rebateEnableFlag: rebateEnableFlag ? 1 : 0,
          tenantId,
        };
        return {
          url: `${prefix}/base-tenants/enable`,
          method: 'POST',
          data: submitData,
        };
      },
    },

  };
};

export const billDS = (): DataSetProps =>
{
  return {
    // autoQuery: true,
    fields: [

      {
        name: 'documentCodeLov',
        type: FieldType.object,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.combineDocumentCode').d('应用模型'),
        lovCode: 'SPFP.BASE_DOCUMENT',
        ignore: FieldIgnore.always,
        // textField: 'documentCode'
      },
      {
        name: 'documentCode',
        bind: 'documentCodeLov.documentCode',
      },
      {
        name: 'businessObjectName',
        bind: 'documentCodeLov.businessObjectName',
      },
      {
        name: 'combineBusinessObjectName',
        bind: 'documentCodeLov.combineBusinessObjectName',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.combineBusinessObjectName').d('应用单据'),
      },
      {
        name: 'fieldCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.fieldCode').d('单据字段'),
      },
      {
        name: 'displayFieldName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.displayFieldName').d('字段别名'),
      },
      {
        name: 'fieldLabel',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.fieldLabel').d('字段标签'),
        lookupCode: 'SPFP.BASE_DOCUMENT_FIELD_LABEL',
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.enableFlag').d('状态'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'action',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.action').d('操作'),
      },

    ],
    transport: {
      read: () =>
      {
        return {
          url: `${prefix}/base-document-definitions/list`,
          method: 'GET',
        };
      },


    },
  };
};

export const billAddDS = (type): DataSetProps =>
{

  return {
    fields: [
      {
        name: 'combineDocumentCodeLov',
        type: FieldType.object,
        lovCode: isPlat ? 'SPFP_BASE_COMBINE_DOCUMENT_P' : 'SPFP_BASE_COMBINE_DOCUMENT_T',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.combineDocumentCode').d('应用模型'),
        required: true,
      },
      {
        name: 'combineDocumentCode',
        bind: 'combineDocumentCodeLov.businessObjectCode',
      },
      {
        name: 'combineBusinessObjectName',
        bind: 'combineDocumentCodeLov.businessObjectName',
      },
      {
        name: 'documentCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.documentCode').d('应用单据'),
        textField: 'relBusinessObjectName',
        valueField: 'relateBusinessObjectCode',
        dynamicProps: {
          // options: ({ record }) =>
          // {
          //   console.log('sdfs', record.get('combineDocumentCode'))
          //   const optionsDS = optionDs(record.get('combineDocumentCode'));
          //   return record.get('combineDocumentCode') ? optionsDS : undefined;
          // },
          disabled: ({ record }) => !record.get('combineDocumentCodeLov'),
        },
      },
      {
        name: 'businessObjectName',
      },
      // {
      //   name: 'businessObjectName',
      //   bind: 'documentCode.relBusinessObjectName'
      // },
      {
        name: 'documentId',
      },
      { name: 'relBusinessObjectId' },

      { name: 'relateBusinessObjectCode' },
      {
        name: 'fieldCodelLov',
        type: FieldType.object,
        lovCode: isPlat ? 'SPFP_BASE_DOCUMENT_COLUMN_P' : 'SPFP_BASE_DOCUMENT_COLUMN_T',
        // textField: 'boFieldCode',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.fieldCodelLov').d('字段选择'),
        ignore: FieldIgnore.always,
        required: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            businessObjectId: record.get('relBusinessObjectId'),
            tenantId: getCurrentOrganizationId(),
          }),
          disabled: ({ record }) =>
          {
            return !record.get('relBusinessObjectId');
          },
        },
      },
      {
        name: 'fieldName',
        bind: 'fieldCodelLov.businessObjectFieldName',
      },
      {
        name: 'fieldCode',
        bind: `fieldCodelLov.businessObjectFieldCode`,
      },
      {
        name: 'displayFieldName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.displayFieldName').d('字段别名'),
      },
      {
        name: 'fieldLabel',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.fieldLabel').d('字段标签'),
        lookupCode: 'SPFP.BASE_DOCUMENT_FIELD_LABEL',
        required: true,
      },


    ],
    transport: {
      submit: ({ data, dataSet }) =>
      {
        const paramsObj = dataSet?.getState('paramsObj') || {};
        return {
          url: `${prefix}/base-document-definitions/${type}`,
          method: type === 'create' ? 'POST' : 'PUT',
          data: { ...data[0], ...paramsObj, tenantId: organizationId, enableFlag: type === 'create' ? 1 : undefined },
        };
      },

    },
  };
};

// 维度Ds

export const dimensionDS = (dimensionType): DataSetProps =>
{
  return {
    autoQuery: true,
    fields: [
      {
        name: 'documentCodeLov',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.documentDefinitionId').d('应用单据'),
        lovCode: 'SPFP.DIMENSION_CONFIG_DOCUMENT',
      },
      {
        name: 'documentCode',
        bind: 'documentCodeLov.documentCode',
      },
      {
        name: 'businessObjectName',
        bind: 'documentCodeLov.businessObjectName',
      },
      {
        name: 'codeType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionType').d('类型'),
        lookupCode: 'SPFP.BASE_DOCUMENT_FIELD_TYPE',
      },
      {
        name: 'dimensionCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionCode').d('维度编码'),
      },
      {
        name: 'dimensionName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionName').d('维度名称'),
      },
      {
        name: 'dimensionDefCombinationMeaning',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionDefCombination').d('维度组合'),
      },
      {
        name: 'dimensionDefCombination',
        type: FieldType.string,
      },
      {
        name: 'enableFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.enableFlag').d('状态'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'ruleType',
        type: FieldType.string,
        lookupCode: 'SPFP.BASE_PREFERENTIAL_TYPE',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.ruleType').d('规则类型'),
      },
      {
        name: 'action',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.action').d('操作'),
      },

    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-${dimensionType === DimensionType.reflex ? 'definitions' : 'configs'}/list`,
          method: 'GET',
          data: { ...data, dimensionType },
        };
      },

    },
  };
};



// 维度映射新增头DS
export const reflexHeaderAddDS = (): DataSetProps =>
{

  return {
    fields: [
      {
        name: 'dimensionCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionCode').d('维度编码'),
        required: true,
      },
      {
        name: 'dimensionName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionName').d('维度名称'),
        required: true,
      },
      {
        name: 'codeType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.codeType').d('单据字段类型'),
        required: true,
        lookupCode: 'SPFP.BASE_DOCUMENT_FIELD_TYPE',
      },
      {
        name: 'componentType',
        type: FieldType.string,
        lookupCode: 'SPFP.BASE_COMPONENT_TYPE',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.componentType').d('组件类型'),
        required: true,

      },
      {
        name: 'lovCodeLov',
        type: FieldType.object,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.lovCode').d('值集编码'),
        textField: 'lovCode',
        dynamicProps: {
          required: ({ record }) => record?.get('componentType') === 'LOV',
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'lovCode',
        bind: 'lovCodeLov.lovCode',
      },

    ],
    transport: {
      read: ({ data, dataSet }) =>
      {
        const dimensionDefinitionId = dataSet?.getState('dimensionDefinitionId');
        return {
          url: `${prefix}/base-dimension-definitions/detail/${dimensionDefinitionId}`,
          method: 'GET',
          data,
        };
      },
      submit: ({ data }) =>
      {
        const {
          dimensionDefinitionId,
          baseDimensionMappingList,
          // baseDimensionLovMappingList,
          // baseDimensionLovParamList
        } = data[0];

        const submitData = {
          ...data[0],
          baseDimensionMappingList: filterList(baseDimensionMappingList).map(item => ({
            ...item,
            dimensionDefinitionId: dimensionDefinitionId || 0,
          })),
          // baseDimensionLovMappingList: filterList(baseDimensionLovMappingList),
          // baseDimensionLovParamList: filterList(baseDimensionLovParamList),
        };

        return {
          url: `${prefix}/base-dimension-definitions/save`,
          method: 'PUT',
          data: filterNullValueObject(submitData),

        };
      },
    },

  };
};

// 映射关系DS
export const reflexRelationDS = (): DataSetProps =>
{

  return {
    autoQueryAfterSubmit: false,
    // primaryKey: 'dimensionMappingId',
    fields: [
      {
        name: 'sourceDocumentCodeLov',
        type: FieldType.object,
        textField: 'businessObjectName',
        lovCode: 'SPFP.BASE_DOCUMENT_DEFINATION_NEW',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.sourceDocumentCode').d('来源单据'),
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'combineBusinessObjectName',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.combineBusinessObjectName').d('来源单据'),
        bind: 'sourceDocumentCodeLov.combineBusinessObjectName',
      },
      {
        name: 'combineDocumentCode',
        bind: 'sourceDocumentCodeLov.combineDocumentCode',
      },
      {
        name: 'businessObjectName',
        bind: 'sourceDocumentCodeLov.businessObjectName',
      },
      {
        name: 'sourceDocumentCode',
        bind: 'sourceDocumentCodeLov.documentCode',
      },
      {
        name: 'fieldLabel',
        bind: 'sourceDocumentCodeLov.fieldLabel',
      },
      {
        name: 'sourceFieldCode',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.sourceFieldCode').d('来源单据字段'),
        bind: 'sourceDocumentCodeLov.fieldCode',
      },
      {
        name: 'sourceFieldName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.sourceDisplayFieldName').d('来源单据字段名'),
      },
      {
        name: 'action',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.action').d('操作'),
      },


    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-mappings/list`,
          method: 'GET',
          data: { dimensionDefinitionId: data.dimensionDefinitionId },

        };
      },
      destroy: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-mappings/delete`,
          data,
          method: 'DELETE',
        };
      },
      // create: ({ data }) =>
      // {
      //   return {
      //     url: `${prefix}/base-dimension-mappings/create`,
      //     method: 'POST',
      //     data: data[0]
      //   }
      // },
      // update: ({ data }) =>
      // {
      //   return {
      //     url: `${prefix}/base-dimension-mappings/update`,
      //     method: 'PUT',
      //     data: data[0]
      //   }
      // },


    },

  };
};

// 值集映射
export const lovReflexDS = (): DataSetProps =>
{

  return {
    autoQueryAfterSubmit: false,
    // primaryKey: 'lovMappingId',
    fields: [
      {
        name: 'targetDimensionCodeLov',
        type: FieldType.object,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.targetDimensionCode').d('维度映射编码'),
        lovCode: 'SPFP.BASE_DIMENSION_DEFINITION',
        // textField: 'documentCode',
        ignore: FieldIgnore.always,
      },
      {
        name: 'dimensionDefinitionId',
        bind: 'targetDimensionCodeLov.dimensionDefinitionId',
      },
      {
        name: 'targetDimensionCode',
        bind: 'targetDimensionCodeLov.dimensionCode',
      },
      {
        name: 'targetDimensionName',
        bind: 'targetDimensionCodeLov.dimensionName',
      },
      {
        name: 'fieldType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.fieldType').d('字段类型'),
        lookupCode: 'SPFP.BASE_DIMENSION_LOV_FIELD_TYPE',
        required: true,
      },
      {
        name: 'fieldName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.lovFieldName').d('值集对象字段名称'),
      },
      {
        name: 'fieldCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.lovFieldCode').d('值集对象字段编码'),
        required: true,
      },
      {
        name: 'displayFieldCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.displayFieldCode').d('值集对象字段显示名'),
      },
      {
        name: 'action',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.action').d('操作'),
      },



    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-lov-mappings/list`,
          method: 'GET',
          data: { dimensionDefinitionId: data.dimensionDefinitionId },
        };
      },
      destroy: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-lov-mappings/delete`,
          data,
          method: 'DELETE',
        };
      },
      // create: ({ data }) =>
      // {
      //   return {
      //     url: `${prefix}/base-dimension-lov-mappings/create`,
      //     method: 'POST',
      //     data: data[0]
      //   }
      // },
      // update: ({ data }) =>
      // {
      //   return {
      //     url: `${prefix}/base-dimension-lov-mappings/update`,
      //     method: 'PUT',
      //     data: data[0]
      //   }
      // },

    },
  };
};

// 值集参数
export const lovParamsDS = (): DataSetProps =>
{

  return {
    autoQueryAfterSubmit: false,
    // primaryKey: 'lovParamId',
    fields: [

      {
        name: 'paramName',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.paramName').d('参数名'),
        required: true,
      },
      {
        name: 'paramType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.paramType').d('参数类型'),
        lookupCode: 'SPFP.BASE_DIMENSION_LOV_PARAM_TYPE',
        required: true,
      },
      {
        name: 'paramCode',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.paramCode').d('参数值'),
        required: true,
        dynamicProps: {
          lookupCode: ({ record }) =>
          {
            const paramType = record.get('paramType');
            return ['CONTEXT'].includes(paramType) ? 'SPFP.BASE_DIMENSION_LOV_PARAM_CONTEXT' : undefined;

          },
        },
      },
      {
        name: 'applyQueryFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.applyQueryFlag').d('适用查询条件'),
        trueValue: 1,
        falseValue: 0,
        required: true,

      },
      {
        name: 'action',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.action').d('操作'),
      },

    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-lov-params/list`,
          method: 'GET',
          data: { dimensionDefinitionId: data.dimensionDefinitionId },
        };
      },
      destroy: ({ data }) =>
      {
        return {
          url: `${prefix}/base-dimension-lov-params/delete`,
          data,
          method: 'DELETE',
        };
      },

    },

  };
};

// 适用/累计维度新增DS
export const dimensionAddDS = (type, dimensionType): DataSetProps =>
{
  return {
    fields: [
      {
        name: 'ruleType',
        type: FieldType.string,
        lookupCode: 'SPFP.BASE_PREFERENTIAL_TYPE',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.ruleType').d('规则类型'),
        required: true,
      },
      {
        name: 'documentCodeLov',
        type: FieldType.object,
        lovCode: 'SPFP.DIMENSION_CONFIG_DOCUMENT',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.documentDefinitionId').d('应用单据'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => !record.get('ruleType'),
        },
      },
      {
        name: 'documentCode',
        bind: 'documentCodeLov.documentCode',
      },
      {
        name: 'businessObjectName',
        bind: 'documentCodeLov.businessObjectName',
      },
      {
        name: 'dimensionName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionName').d('维度名称'),
        required: true,
        dynamicProps: {
          disabled: ({ record }) => !record.get('ruleType'),
        },
      },
      {
        name: 'dimensionDefCombinationLov',
        type: FieldType.object,
        lovCode: 'SPFP.DIMENSION_DEF_COMBINATION',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.dimensionDefCombination').d('维度组合'),
        ignore: FieldIgnore.always,
        multiple: true,
        textField: 'dimensionName',
        required: true,
        dynamicProps: {
          lovPara: ({ record }) => ({ documentCode: record?.get('documentCode') }),
          disabled: ({ record }) => !record.get('ruleType'),
        },
      },
      {
        name: 'dimensionDefCombinationMeaning',
        bind: 'dimensionDefCombinationLov.dimensionName',
        transformRequest: (value) => isArray(value) ? value.join() : value,
        transformResponse: value => value ? value.split(',') : value,
      },
      {
        name: 'dimensionDefCombination',
        bind: 'dimensionDefCombinationLov.dimensionCode',
        transformRequest: (value) => isArray(value) ? value.join() : value,
        transformResponse: value => value ? value.split(',') : value,
      },
    ],
    transport: {
      submit: ({ data }) =>
      {

        return {
          url: `${prefix}/base-dimension-configs/${type}`,
          method: type === 'create' ? 'POST' : 'PUT',
          data: data.map(item => { return { ...item, dimensionType }; }),
        };
      },

    },
  };
};

export const sceneMenuDS = (): DataSetProps =>
{
  return {
    dataToJSON: DataToJSON.all,
    paging: false,
    fields: [
      {
        name: 'scenarioName',
        type: FieldType.intl,
        required: true,
      },
      {
        name: 'scenarioConfigIdLov',
        type: FieldType.object,
        lovCode: 'SPFP.RULE_SCENARIO_CONFIG ',
        ignore: FieldIgnore.always,
        // textField: 'scenarioName',
        multiple: true,
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${prefix}/base-scenario-configs/list`,
          method: 'GET',
          data: {},
        };
      },

      destroy: () =>
      {
        return {
          url: `${prefix}/base-scenario-configs/delete`,
          method: 'DELETE',
        };

      },

    },
  };
};

export const sceneMenuAddDS = (): DataSetProps =>
{
  return {
    dataToJSON: DataToJSON.all,
    paging: false,
    fields: [
      {
        name: 'scenarioName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.scenarioName').d('场景名称'),
        required: true,
      },
      {
        name: 'applicableBusiness',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.applicableBusiness').d('适用业务'),
      },
      {
        name: 'maintenanceInstructions',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.maintenanceInstructions').d('维护须知'),
      },
      {
        name: 'ruleType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.preferType').d('优惠类型'),
        lookupCode: 'SPFP.BASE_PREFERENTIAL_TYPE',
        required: true,
      },
    ],
    transport: {
      submit: ({ dataSet }) =>
      {
        const { submitData, submitType } = dataSet?.getState('submitParams') || {};
        return {
          url: `${prefix}/base-scenario-configs/${submitType}`,
          method: submitType === 'create' ? 'POST' : 'PUT',
          data: [submitData || {}],
        };
      },


    },
  };
};

// 字段定义 & 显示字段别名定义 & 显示字段默认值定义

export const fieldDefineDS = (): DataSetProps =>
{
  return {
    primaryKey: 'scenarioInfoId',
    dataToJSON: DataToJSON.all,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'scenarioInfoType',
        type: FieldType.string,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.scenarioInfoType').d('字段描述'),
        lookupCode: 'SPFP.BASE_SCENARIO_INFO_TYPE',
      },
      {
        name: 'displayFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.displayFlag').d('是否显示'),
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            return [
              // 每返利、返利从至表格禁用
              'FIXED_VALUE',
              'RESULT_VALUE',
              'RANGE_FROM_VALUE',
              'SIMULATION_BASE_VALUE',
              'SIMULATION_BASE_RATE',
              'SIMULATION_GIFT_PRICE',
              'SIMULATION_TAX_INCLUDED_AMOUNT',
              'SIMULATION_FAILED_REASON',
              'CUMULATIVE_DATE_TO',
              'CUMULATIVE_DATE_FROM',
              'RANGE_TO_VALUE',
              'SCENARIO_CONFIG_ID',
              'END_DATE',
              'START_DATE',
            ].includes(scenarioInfoType);
          },
        },
      },
      {
        name: 'requiredFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.requiredFlag').d('是否必输'),
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            return [
              'SOURCE_DOCUMENT_CODE',
              'TARGET_DOCUMENT_CODE',
              'APPLICATION_DIMENSION_RANGE',
              'APPLICATION_SPECIFIC_VALUE',
              'APPLICATION_DIMENSION_VALUE',
              'CUMULATIVE_MODE',
              'CUMULATIVE_RULE',
              'RULE_TYPE',
              // 每返利、返利从至表格禁用
              'FIXED_VALUE',
              'RESULT_VALUE',
              'RANGE_FROM_VALUE',
              'RANGE_TO_VALUE',
              'SIMULATION_BASE_VALUE',
              'SIMULATION_BASE_RATE',
              'SIMULATION_GIFT_PRICE',
              'SIMULATION_TAX_INCLUDED_AMOUNT',
              'SIMULATION_FAILED_REASON',
              'CUMULATIVE_DATE_TO',
              'CUMULATIVE_DATE_FROM',
              'RULE_NUM',
              'RULE_NAME',
              'SCENARIO_CONFIG_ID',
              'END_DATE',
              'START_DATE',
              'SOURCE_TYPE',
              'VERSION_NUMBER',
              'ORDERING_RULE',
              'CUMULATIVE_PERIOD_CLEAR_FLAG',
            ].includes(scenarioInfoType);
          },
          required: ({ record }) => ['RULE_TYPE'].includes(record.get('scenarioInfoType')),
        },
      },
      {
        name: 'editFlag',
        type: FieldType.boolean,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.editFlag').d('是否可编辑'),
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            return [
              // 每返利、返利从至表格禁用
              'FIXED_VALUE',
              'RESULT_VALUE',
              'RANGE_FROM_VALUE',
              'RANGE_TO_VALUE',
              'RULE_NUM',
              'RULE_NAME',
              'SCENARIO_CONFIG_ID',
              'END_DATE',
              'START_DATE',
              'SOURCE_TYPE',
              'VERSION_NUMBER',
            ].includes(scenarioInfoType);
          },
        },
      },
      {
        name: 'displayName',
        type: FieldType.intl,
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.displayName').d('显示别名'),
      },
      {
        name: 'bubblePrompt',
        type: FieldType.intl,
        label: intl.get(`spfp.basicConfiguration.model.basicConfiguration.bubbleTips`).d('气泡提示'),
      },
      {
        name: 'defaultValueMeaning',
      },
      {
        name: 'fieldLabel',
        type: FieldType.string,
      },
      {
        name: 'defaultValue',
        label: intl.get('spfp.basicConfiguration.model.basicConfiguration.defaultValue').d('默认值'),
        dynamicProps: {
          type: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            return ['CUMULATIVE_DATE_FROM', 'CUMULATIVE_DATE_TO'].includes(scenarioInfoType) ? FieldType.date : (fieldLovCodeMap[scenarioInfoType]?.lovCode ? FieldType.object : FieldType.string);

          },
          multiple: ({ record }) =>
          {
            return ['ORDERING_MERGE_DIMENSION', 'ORDERING_SUMMARY_DIMENSION'].includes(record.get('scenarioInfoType'));
          },
          lovCode: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            // 基础配置的来源单据字段和目标单据字段的值集与规则不同
            const lovCode = ['SOURCE_DOCUMENT_CODE'].includes(scenarioInfoType)
              ? 'SPFP.SOURCE_DOCUMENT_SCENARIO'
              : ['TARGET_DOCUMENT_CODE'].includes(scenarioInfoType)
                ? 'SPFP.TARGET_DOCUMENT_SCENARIO'
                : fieldLovCodeMap[scenarioInfoType]?.lovCode;
            return lovCode;
          },
          lovPara: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');

            const orderByLovParams = ['ORDERING_BY'].includes(scenarioInfoType)
              ? { organizationId: getCurrentOrganizationId(), userId: getCurrentUserId() }
              : {};
            return {
              documentType: scenarioInfoType === 'SOURCE_DOCUMENT_CODE'
                ? 'SOURCE_DOCEUMENT' :
                scenarioInfoType === 'TARGET_DOCUMENT_CODE'
                  ? 'TARGET_DOCEUMENT' :
                  undefined,
              ...orderByLovParams,

            };
          },
          lookupCode: ({ record }) =>
          {
            const scenarioInfoType = record.get('scenarioInfoType');
            return fieldLovCodeMap[scenarioInfoType]?.lookupCode;
          },
          disabled: ({ record }) =>
          {
            // const scenarioInfoType = record.get('scenarioInfoType');
            // const fieldLabel = dataSet.find(record => record.get('scenarioInfoType') === 'SOURCE_DOCUMENT_CODE')?.get('fieldLabel');
            // 特性值和维度值,维度范围没有默认值
            return [
              'APPLICATION_SPECIFIC_VALUE',
              'APPLICATION_DIMENSION_VALUE',
              'APPLICATION_DIMENSION_RANGE',
              'CUMULATIVE_SPECIFIC_VALUE',
              'CUMULATIVE_DIMENSION_VALUE',
              'CUMULATIVE_DIMENSION_RANGE',
              // 每返利、返利从至表格默认值禁用
              'FIXED_VALUE',
              'RESULT_VALUE',
              'RANGE_FROM_VALUE',
              'RANGE_TO_VALUE',
              'RULE_NUM',
              'SCENARIO_CONFIG_ID',
              'SOURCE_TYPE',
              'VERSION_NUMBER',
              'RULE_NAME',
              'END_DATE',
              'START_DATE',
            ].includes(record.get('scenarioInfoType'));
          },
          required: ({ record }) => ['RULE_TYPE'].includes(record.get('scenarioInfoType')),
          options: ({ record, dataSet }) =>
          {
            let otherParamsLookupDatas = [];
            // 动态渲染【其他参数】下拉框数据Ds
            const scenarioInfoType = record.get('scenarioInfoType');

            if (scenarioInfoType === 'CALCULATE_DIMENSION')
            {
              const cumulativeRule = dataSet.find(record => record.get('scenarioInfoType') === 'CUMULATIVE_RULE')?.get('defaultValue');
              const otherParamsALLLookupDatas = dataSet?.getField('defaultValue')?.getOptions(record)?.toData() || [];
              otherParamsLookupDatas = otherParamsALLLookupDatas.filter(option => cumulativeRule === 'GIFT'
                ? option.parentValue === 'QUANTITY'
                : option.parentValue === 'AMOUNT');
            }
            return ['CALCULATE_DIMENSION'].includes(scenarioInfoType)
              ? new DataSet({
                data: otherParamsLookupDatas || [],
              }) : undefined;
          },
        },
        transformRequest: (value, record) =>
        {
          const defaultValueField = record.getField('defaultValue');
          // 如果是值集，得给后端传valueField的值
          const valueField = defaultValueField?.get('valueField', record);
          const isMultiple = ['ORDERING_MERGE_DIMENSION', 'ORDERING_SUMMARY_DIMENSION'].includes(record.get('scenarioInfoType'));
          // 起止日期
          if (['CUMULATIVE_DATE_FROM'].includes(record.get('scenarioInfoType')) && value) return moment(value)?.format(DATETIME_MIN);
          else if (['CUMULATIVE_DATE_TO'].includes(record.get('scenarioInfoType')) && value) return moment(value)?.format(DATETIME_MAX);
          return isMultiple
            ? value?.join() || null
            : isObject(value)
              ? (value as { valueField })[valueField]
              : value;

        },
        transformResponse(value, object)
        {
          const {
            componentType,
            defaultValueField,
            defaultValueMeaningField,
            defaultValueMeaning,
            scenarioInfoType,
          } = object || {};
          const isMultiple = ['ORDERING_MERGE_DIMENSION', 'ORDERING_SUMMARY_DIMENSION'].includes(scenarioInfoType);
          // [{"对应值集中的valueField"： xxx, "对应值集中的displayField"： xxx},...]
          return componentType === 'LOV'
            ? {
              [defaultValueField]: value,
              [defaultValueMeaningField]: defaultValueMeaning,
            }
            : isMultiple
              ? value?.split(',') || []
              : value;
        },
      },

    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${prefix}/base-scenario-infos/list`,
          method: 'GET',
          data,
        };
      },
      submit: ({ data }) =>
      {
        return {
          url: `${prefix}/base-scenario-infos/update`,
          method: 'PUT',
          data,

        };
      },
    },
    events: {
      update: ({ record, dataSet }) =>
      {
        const { scenarioInfoType: currentScenarioInfoType, defaultValue } = record.get(['scenarioInfoType', 'defaultValue']);
        if (currentScenarioInfoType === 'SOURCE_DOCUMENT_CODE')
        {
          // 赋值fieldLable
          record.set('fieldLabel', defaultValue?.fieldLabel);
          // 清空【其他参数】
          const calculateDimensionRecord = dataSet.find(eachRecord => eachRecord?.get('scenarioInfoType') === 'CALCULATE_DIMENSION');
          // eslint-disable-next-line no-unused-expressions
          calculateDimensionRecord?.set('defaultValue', undefined);

        }
      },
    },
  };
};


export const modelTreeOptionDS = (): DataSetProps =>
{
  return ({
    // autoQuery: true,
    selection: DataSetSelection.single,
    idField: 'businessObjectRelationId',
    parentField: 'parentId',
    fields: [
      { name: 'businessObjectRelationId', type: FieldType.string },
      { name: 'parentId', type: FieldType.string },
      { name: 'relBusinessObjectName', type: FieldType.string },
      // {
      //   name: 'relBusinessObjectId', type: FieldType.string,
      // },
    ],
    transport: {
      read: ({ dataSet }) =>
      {
        const combineDocumentCode = dataSet?.getState('combineDocumentCode');
        return {
          url: `${hmdePrefix}/business-object-relations/tree`,
          method: 'GET',
          data: {
            businessObjectCode: combineDocumentCode,
            tenantId: organizationId,
          },
          transformResponse: (res) =>
          {
            let flatData: Array<Object> = [];
            try
            {
              const resParse = JSON.parse(res);
              const loopTreeData = (data) =>
              {
                flatData.push({ ...data, businessObjectRelationList: undefined });
                if (data.businessObjectRelationList)
                {
                  return data.businessObjectRelationList.forEach(i => loopTreeData(i));
                }
              };
              loopTreeData(resParse);
            } catch {
              flatData = [];
            }
            return flatData;
          },
        };
      },
    },
  });
};

// 场景导出值集Ds
// export const sceneExportLovDS = (): DataSetProps =>
// {
//   return {
//     fields: [{
//       name: 'scenarioConfigIdLov',
//       type: FieldType.object,
//       lovCode: 'SPFP.RULE_SCENARIO_CONFIG ',
//       ignore: FieldIgnore.always,
//       textField: 'scenarioName',
//       lovPara: {
//         ruleType: 'REBATE',
//       },
//     }],
//   };
// };




