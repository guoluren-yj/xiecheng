import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { isArray, isString } from 'lodash';
import { SRM_ADAPTOR } from '_utils/config';

const organizationId = getCurrentOrganizationId();
export function getTableDs() {
  return {
    // autoQuery: true,
    pageSize: 20,
    queryFields: [
      {
        name: 'templateCode',
        type: 'string',
        format: 'uppercase',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.templateCode').d('模板编码'),
        display: true,
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.templateName').d('模板名称'),
        display: true,
      },
      {
        name: 'sceneCode',
        type: 'object',
        lovCode: 'SADA.SCENE_VIEW',
        lovPara: { tenantId: organizationId },
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.relate').d('关联场景'),
        display: true,
        lovParamProps: {
          searchMatcher: undefined,
          searchFieldProps: {
            multiple: false,
            onPaste: undefined,
          },
          paramMatcher: undefined,
          onSearchMatcherChange: undefined,
        },
      },
      {
        name: 'sourceCode',
        type: 'object',
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.source').d('来源单据'),
        display: true,
      },
      {
        name: 'targetCode',
        type: 'object',
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.target').d('转入单据'),
        display: true,
      },
    ],
    fields: getFormDs().fields,
    transport: {
      read: () => {
        return {
          url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/list`,
          method: 'POST',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/cnf-menu-trees`,
          method: 'DELETE',
          data: data[0],
        };
      },
    },
  };
}

export function getFormDs() {
  return {
    fields: [
      {
        name: 'templateCode',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.templateCode').d('模板编码'),
        type: 'string',
        format: 'uppercase',
        maxLength: 60,
        required: true,
        validator: (value) => {
          const pattern = /^[A-Z][A-Z0-9-_./]*$/;
          if (!pattern.test(value)) {
            return intl
              .get('hzero.common.validation.codeUpperBegin')
              .d('全大写及数字，必须以字母开头，可包含“-”、“_”、“.”、“/”');
          }
        },
      },
      {
        name: 'templateName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.templateName').d('模板名称'),
      },
      {
        name: 'sceneLov',
        type: 'object',
        required: true,
        lovCode: 'SADA.SCENE_VIEW',
        lovPara: { tenantId: organizationId },
        textField: 'sceneName',
        valueField: 'sceneCode',
        ingore: 'always',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.relate').d('关联场景'),
      },
      {
        name: 'sceneCode',
        type: 'string',
        bind: 'sceneLov.sceneCode',
      },
      {
        name: 'sceneName',
        type: 'string',
        bind: 'sceneLov.sceneName',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.scene').d('关联场景'),
      },
      {
        name: 'sourceLov',
        type: 'object',
        required: true,
        disabled: true,
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        textField: 'entityName',
        valueField: 'entityCode',
        ingore: 'always',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.source').d('来源单据'),
        // validator: (value, name, record) => {
        //   const { sourceCode, targetCode } = record.toData() || {};
        //   if (sourceCode && sourceCode === targetCode) {
        //     return intl
        //       .get('spfm.fieldMapDefine.validation.docCannotSame')
        //       .d('来源单据和转入单据不能一样');
        //   }
        // },
      },
      {
        name: 'sourcePriceDatabaseLov',
        type: 'object',
        lovCode: 'ADAPTOR_CNF_PR_QUERY',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.sourcePriceDatabase')
          .d('来源价格库'),
        dynamicProps: {
          required: ({ record }) => {
            return record.get('sourceFieldSource') === 'INTERFACE';
          },
        },
        ingore: 'alaways',
      },
      {
        name: 'sourcePriceDatabase',
        bind: 'sourcePriceDatabaseLov.templateCode',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.sourcePriceDatabase')
          .d('来源价格库'),
      },
      {
        name: 'sourcePriceDatabaseName',
        bind: 'sourcePriceDatabaseLov.templateName',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.sourcePriceDatabase')
          .d('来源价格库'),
      },
      {
        name: 'sourceCode',
        type: 'string',
        bind: 'sourceLov.entityCode',
      },
      {
        name: 'sourceName',
        type: 'string',
        bind: 'sourceLov.entityName',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.source').d('来源单据'),
      },
      {
        name: 'targetLov',
        type: 'object',
        required: true,
        disabled: true,
        lovCode: 'SADA.SIMPLE_STRUCTURE_VIEW',
        textField: 'entityName',
        valueField: 'entityCode',
        ingore: 'always',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.target').d('转入单据'),
        // validator: (value, name, record) => {
        //   const { sourceCode, targetCode } = record.toData() || {};
        //   if (targetCode && sourceCode === targetCode) {
        //     return intl
        //       .get('spfm.fieldMapDefine.validation.docCannotSame')
        //       .d('来源单据和转入单据不能一样');
        //   }
        // },
      },
      {
        name: 'transferPriceDatabaseLov',
        type: 'object',
        lovCode: 'ADAPTOR_CNF_PR_QUERY',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.transferPriceDatabase')
          .d('转入价格库'),
        dynamicProps: {
          required: ({ record }) => {
            return record.get('targetFieldSource') === 'INTERFACE';
          },
        },
        ingore: 'alaways',
      },
      {
        name: 'transferPriceDatabase',
        bind: 'transferPriceDatabaseLov.templateCode',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.transferPriceDatabase')
          .d('转入价格库'),
      },
      {
        name: 'transferPriceDatabaseName',
        bind: 'transferPriceDatabaseLov.templateName',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.transferPriceDatabase')
          .d('转入价格库'),
      },
      {
        name: 'targetCode',
        type: 'object',
        bind: 'targetLov.entityCode',
      },
      {
        name: 'targetName',
        type: 'string',
        bind: 'targetLov.entityName',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.target').d('转入单据'),
      },
      {
        name: 'isEnable',
        type: 'number',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('hzero.common.status.enabled').d('启用'),
      },
    ],
    transport: {
      submit: ({ data }) => {
        const saveData = data[0] || {};
        const { sceneLov, sourceLov, targetLov, ...other } = saveData;
        return {
          url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/save`,
          method: 'POST',
          data: other,
        };
      },
      read: ({ data }) => {
        return {
          url: `${SRM_ADAPTOR}/v1/${organizationId}/adaptor-cnf-template-headers/${data.id}`,
          method: 'GET',
          params: null,
          data: null,
        };
      },
    },
  };
}

export function getFieldFormDs({
  templateId,
  sourceCode,
  targetCode,
  sourcePriceDatabase,
  transferPriceDatabase,
}) {
  return {
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        required: true,
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.lineNumber').d('优先级'),
      },
      {
        name: 'targetFieldLov',
        type: 'object',
        required: true,
        ingore: 'always',
        lovCode: !transferPriceDatabase
          ? 'SADA.SIMPLE_ENTITY_FIELD_VIEW'
          : 'ADAPTOR_CNF_PR_DIMS_QUERY',
        lovPara: !transferPriceDatabase
          ? { templateId, entityCode: targetCode, target: true }
          : { templateCode: transferPriceDatabase },
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.targetField').d('目标字段'),
        textField: !transferPriceDatabase ? 'dimensionName' : 'description',
      },
      {
        name: 'targetField',
        type: 'string',
        bind: !transferPriceDatabase ? 'targetFieldLov.name' : 'targetFieldLov.dimensionCode',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.targetField').d('目标字段'),
      },
      {
        name: 'targetFieldName',
        type: 'string',
        bind: !transferPriceDatabase
          ? 'targetFieldLov.description'
          : 'targetFieldLov.dimensionName',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.targetFieldName')
          .d('目标字段名称'),
      },
      {
        name: 'valueType',
        required: true,
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.valueType').d('取值方式'),
        lookupCode: 'SADA.TEMPLATE_VALUE_TYPE',
      },
      {
        name: 'triggerFieldLov',
        type: 'object',
        ingore: 'always',
        valueField: 'name',
        textField: 'description',
        lovCode: 'SADA.SIMPLE_ENTITY_FIELD_VIEW',
        multiple: true,
        lovPara: { templateId, entityCode: sourceCode, target: false },
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.triggerField').d('自动触发字段'),
      },
      {
        name: 'triggerField',
        type: 'string',
        bind: 'triggerFieldLov.name',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.triggerField').d('自动触发字段'),
        transformRequest: (val) => {
          return isArray(val) && val.length > 0 ? val.reduce((x, y) => `${x}|${y}`) : undefined;
        },
        transformResponse: (val) => {
          return isString(val) ? val.split('|') : val;
        },
      },
      {
        name: 'sourceFieldLov',
        type: 'object',
        ingore: 'always',
        lovCode: !sourcePriceDatabase
          ? 'SADA.SIMPLE_ENTITY_FIELD_VIEW'
          : 'ADAPTOR_CNF_PR_DIMS_QUERY',
        lovPara: !sourcePriceDatabase
          ? { templateId, entityCode: sourceCode, target: false }
          : { templateCode: sourcePriceDatabase },
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.sourceField').d('来源字段'),
        textField: !sourcePriceDatabase ? 'dimensionName' : 'description',
        dynamicProps: {
          required: ({ record }) => record.get('valueType') === 'source_data',
        },
      },
      {
        name: 'sourceField',
        type: 'string',
        bind: !sourcePriceDatabase ? 'sourceFieldLov.name' : 'sourceFieldLov.dimensionCode',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.sourceField').d('来源字段'),
      },
      {
        name: 'sourceFieldName',
        type: 'string',
        bind: !sourcePriceDatabase ? 'sourceFieldLov.description' : 'sourceFieldLov.dimensionName',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.sourceFieldName')
          .d('来源字段名称'),
      },
      {
        name: 'finalValue',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.constant').d('常数值'),
        dynamicProps: {
          required: ({ record }) =>
            record.get('valueType') === 'final_value' && !record.data.lovFinalFlag,
        },
      },
      {
        name: 'finalValueLov',
        type: 'object',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.constant').d('常数值'),
        ingore: 'always',
        lovPara: { tenantId: organizationId },
        dynamicProps: ({ record }) => {
          return {
            textField: record.get('textField'),
            valueField: record.get('valueField'),
            lovCode: record.get('viewCode'),
            required: record.get('valueType') === 'final_value' && record.data.lovFinalFlag,
          };
        },
      },
      {
        name: 'configTableCode',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.configTableCode').d('配置表编码'),
      },
      {
        name: 'configFieldName',
        type: 'string',
        label: intl
          .get('spfm.fieldMapDefine.model.fieldMapDefine.configTableField')
          .d('配置表字段'),
      },
      {
        name: 'executeExepression',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.formula').d('公式'),
      },
      {
        name: 'functionLibraryLov',
        type: 'object',
        ingore: 'always',
        valueField: 'functionCode',
        textField: 'functionName',
        lovCode: 'SADA.FUNCTION_LIBRARY_EXPRESSION',
        lovPara: {
          entityCode: sourceCode,
        },
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.functionLibrary').d('查询函数库'),
      },
      {
        name: 'functionLibrary',
        type: 'string',
        bind: 'functionLibraryLov.functionCode',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.functionLibrary').d('查询函数库'),
      },
      {
        name: 'expression',
        bind: 'executeExepression',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.expression').d('公式'),
        dynamicProps: {
          required: ({ record }) => record.get('valueType') === 'function',
        },
      },
      {
        name: 'uploadFlag',
        type: 'boolean',
        bind: !sourcePriceDatabase ? 'sourceFieldLov.uploadFlag' : undefined,
      },
      {
        name: 'uploadTransformType',
        type: 'string',
        lookupCode: 'SADA.CNF.UPLOAD.TRANS.TYPE',
        dynamicProps: {
          required: ({ record }) =>
            record.get('valueType') === 'source_data' && record.get('uploadFlag'),
        },
      },
      {
        name: 'useFirstLine',
        type: 'boolean',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          required: ({ record }) => !!record.get('uploadFlag'),
        },
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.remark').d('备注'),
        // label: intl.get('spfm.fieldMapDefine.model.fieldMapDefine.remark').d('函数描述'),
        // dynamicProps: {
        //   required: ({ record }) => record.get('valueType') === 'function',
        // },
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'sourceFieldLov') {
          record.set('useFirstLine', undefined);
          record.set('uploadTransformType', undefined);
          if (sourcePriceDatabase) {
            record.set('uploadFlag', value && value.fieldWidget === 'UPLOAD');
          }
          record.set(
            'uploadTransformType',
            value && (value.uploadFlag || value.fieldWidget === 'UPLOAD') ? 'COPY' : undefined
          );
        }
      },
    },
  };
}

export function getFieldTableDs() {
  return {
    paging: false,
    fields: getFieldFormDs({}).fields,
  };
}
