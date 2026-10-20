import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import DataSet from 'choerodon-ui/dataset/data-set/DataSet';
import moment from 'moment';
import { isEmpty, isArray, isObject } from 'lodash';

import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { fieldValidator } from '../../../../../utils/amountConfig';
import type { DimensionType } from '../../../../BasicConfiguration/utils/type';
import { fieldLovCodeMap, CUSTOM } from '../../../../BasicConfiguration/utils/type';

const prefix = `spfp.ruleMaintenance`;
const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SPCM}/v1/${organizationId}`;

// interface DimensionLookupData {
//   dimensionCode: string;
//   dimensionName: string;
//   componentType: string;
//   lovCode: string,
//   dimensionDefinitionId: string
// }

export const getLeftValueParams = (dataSet, record) => {
  const leftValueContents = dataSet.getField('dimensionCode').getOptions(record)?.toData() || [];
  const leftValueParams = leftValueContents.
    find(leftValueContent => leftValueContent.dimensionCode == record.get('dimensionCode')
    );
  return leftValueParams || {};

};


// 过滤新建数据后不填值的无效数据
export const getEffectiveData = datas => {
  return datas.filter(data => {
    const newData = Object.assign({}, data);
    delete newData.__id;
    delete newData._status;
    delete newData.dimensionType;
    delete newData.dimensionDefinitionId;
    return !isEmpty(newData);
  });
};

export const ruleDS = (modalFlag?: Boolean, majorPcNum?): DataSetProps => {
  return {
    autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    // forceValidate: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('规则编码'),
      },
      {
        name: 'scenarioConfigIdLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.scenarioConfigId`).d('场景'),
        required: true,
        lovCode: 'SPFP.RULE_SCENARIO_CONFIG',
        ignore: FieldIgnore.always,
        textField: 'scenarioName',
        dynamicProps: {
          disabled: ({ record }) => record.get('ruleId'),
        },
        lovPara: {
          ruleType: 'DISCOUNT',
        },
      },
      {
        name: 'scenarioConfigId',
        bind: 'scenarioConfigIdLov.scenarioConfigId',
      },
      {
        name: 'scenarioName',
        bind: 'scenarioConfigIdLov.scenarioName',
      },
      {
        name: 'ruleName',
        type: FieldType.intl,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('规则名称'),
        required: true,
      },
      {
        name: 'date',
        type: FieldType.date,
        range: ['start', 'end'],
        label: intl.get(`${prefix}.model.ruleMaintenance.effectTime`).d('有效期'),
        required: true,
        validator: (value) => {
          if (!value?.end || !value?.start) return intl.get(`${prefix}.validate.dataMessage`).d('请输入完整的有效期');
          return true;
        },
      },
      {
        name: 'startDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        bind: 'date.start',
      },
      {
        name: 'endDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        bind: 'date.end',
      },
      {
        name: 'sourceType',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleSourceType`).d('规则来源'),
        lookupCode: 'SPFP.RULE_SOURCE_TYPE',
        defaultValue: 'MANUAL',
        required: true,
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.versionNumber`).d('当前版本号'),
        defaultValue: 1,
      },
      {
        name: 'ruleStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
        defaultValue: 'UN_PUBLISHED',
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get(`spfp.common.model.ruleMaintenance.createdByName`).d('创建人'),
      },
      {
        name: 'sourceDocumentCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.sourceDocumentDefinitionId`).d('来源单据字段'),
        lovCode: fieldLovCodeMap.SOURCE_DOCUMENT_CODE.lovCode,
        ignore: FieldIgnore.always,
        lovPara: {
          documentType: 'SOURCE_DOCEUMENT',
        },
        // required: true,
      },
      {
        name: 'sourceDocumentCode',
        bind: 'sourceDocumentCodeLov.documentCode',
      },
      {
        name: 'sourceFieldCode',
        bind: 'sourceDocumentCodeLov.fieldCode',
      },
      {
        name: 'sourceFieldName',
        bind: 'sourceDocumentCodeLov.displayFieldName',
      },
      {
        name: 'sourceFieldLabel',
        bind: 'sourceDocumentCodeLov.fieldLabel',
      },
      {
        name: 'sourceCombineDocumentCode',
        bind: 'sourceDocumentCodeLov.combineDocumentCode',
      },
      {
        name: 'targetDocumentCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.targetDocumentDefinitionId`).d('目标单据字段'),
        lovCode: fieldLovCodeMap.TARGET_DOCUMENT_CODE.lovCode,
        ignore: FieldIgnore.always,
        // required: true,
      },
      {
        name: 'targetDocumentCode',
        bind: 'targetDocumentCodeLov.documentCode',
      },
      {
        name: 'targetFieldCode',
        bind: 'targetDocumentCodeLov.fieldCode',
      },
      {
        name: 'targetFieldName',
        bind: 'targetDocumentCodeLov.displayFieldName',
      },
      {
        name: 'targetCombineDocumentCode',
        bind: 'targetDocumentCodeLov.combineDocumentCode',
      },

      // 计算规则基础信息
      {
        name: 'cumulativeMode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeMode`).d('累计模式'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_MODE.lookupCode,
        // required: true,
      },
      {
        name: 'cumulativeRule',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeRule`).d('规则模式'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_RULE.lookupCode,
        // required: true
      },
      {
        name: 'cumulativePeriod',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativePeriod`).d('累计周期'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_PERIOD.lookupCode,
      },
      {
        name: 'cumulativeDateFrom',
        type: FieldType.date,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeDateFrom`).d('累计周期从'),
        min: 'startDate',
        max: 'cumulativeDateTo',
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        dynamicProps: {
          min: ({ record }) => record?.get('startDate'),
          max: ({ record }) => record?.get('cumulativeDateTo') || record?.get('endDate'),
          required: ({ record }) => record?.get('cumulativeMode') === 'CUMULATIVE' && record.get('cumulativePeriod') === CUSTOM,
        },
      },
      {
        name: 'cumulativeDateTo',
        type: FieldType.date,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeDateTo`).d('累计周期至'),
        min: 'cumulativeDateFrom',
        max: 'endDate',
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        dynamicProps: {
          min: ({ record }) => record?.get('cumulativeDateFrom') || record?.get('startDate'),
          max: ({ record }) => record?.get('endDate'),
          required: ({ record }) => record?.get('cumulativeMode') === 'CUMULATIVE' && record?.get('cumulativePeriod') === CUSTOM,
        },
      },
      {
        name: 'cumulativeNature',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeNatures`).d('累计性质'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_NATURE.lookupCode,
      },
      {
        name: 'cumulativeTimePoint',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeTimePoint`).d('累计时点'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_TIME_POINT.lookupCode,
      },
      {
        name: 'baseAmount',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.baseAmountValue`).d('基准值'),
        dynamicProps: {
          disabled: ({ record }) => !record?.get('deductBaseAmountFlag'),
        },
      },
      {
        name: 'deductBaseAmountFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${prefix}.model.ruleMaintenance.discount.deductBaseAmountValueFlag`).d('扣除基准值后开始折扣'),
      },
      {
        name: 'priceSource',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.priceSource`).d('基准价格来源'),
        lookupCode: fieldLovCodeMap.PRICE_SOURCE.lookupCode,
      },
      // 计算规则-计算规则
      {
        name: 'calculateTimePoint',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateTimePoints`).d('计算时点'),
        lookupCode: fieldLovCodeMap.CALCULATE_TIME_POINT.lookupCode,
        defaultValue: fieldLovCodeMap.CALCULATE_TIME_POINT.defaultValue,
      },
      {
        name: 'calculateRule',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateRule`).d('计算规则'),
        lookupCode: fieldLovCodeMap.CALCULATE_RULE.lookupCode,
        defaultValue: fieldLovCodeMap.CALCULATE_RULE.defaultValue,
      },
      {
        name: 'calculateTaxRateType',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateTaxRateTypes`).d('税率类型'),
        lookupCode: fieldLovCodeMap.CALCULATE_TAX_RATE_TYPE.lookupCode,
        defaultValue: fieldLovCodeMap.CALCULATE_TAX_RATE_TYPE.defaultValue,
      },
      {
        name: 'calculateRateLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateRateLov`).d('选择税率'),
        ignore: FieldIgnore.always,
        lovCode: fieldLovCodeMap.CALCULATE_RATE.lovCode,
      },
      {
        name: 'calculateRate',
        bind: 'calculateRateLov.taxId',
      },
      {
        name: 'calculateRateMeaning',
        bind: 'calculateRateLov.taxRate',
      },
      {
        name: 'calculateDimension',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateDimensionOther`).d('其他参数'),
        lookupCode: fieldLovCodeMap.CALCULATE_DIMENSION.lookupCode,
        dynamicProps: {
          options: ({ record, dataSet }) => {
            const fieldLabel = record?.get('sourceFieldLabel');

            const otherParamsALLLookupDatas = dataSet?.getField('calculateDimension')?.getOptions(record)?.toData() || [];
            return new DataSet({
              data: otherParamsALLLookupDatas.filter(item => (item?.parentValue || '').includes(fieldLabel)),
            });
          },
          // disabled: ({ record }) => {
          //   return !['AMOUNT', 'QUANTITY'].includes(record?.get('sourceFieldLabel'));
          // },
        },
      },
      {
        name: 'priceLibServiceCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.priceLibServiceCode`).d('价格库服务编码'),
        ignore: FieldIgnore.always,
        lovCode: fieldLovCodeMap.PRICE_LIB_SERVICE_CODE.lovCode,
      },
      {
        name: 'priceLibServiceCode',
        bind: 'priceLibServiceCodeLov.serviceCode',
      },
      {
        name: 'priceLibServiceCodeMeaning',
        bind: 'priceLibServiceCodeLov.serviceName',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const ruleId = dataSet?.getState('ruleId') || dataSet?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/pfp-rule/detail/${ruleId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) => {
        const source = dataSet?.getState('source');
        const action = dataSet?.getState('action');
        const currentStep = dataSet?.getState('currentStep');
        const url = action === 'publish'
          ? `${urlPrefix}/pfp-rule/publish`
          : `${urlPrefix}/pfp-rule/${source === 'create' ? (majorPcNum ? 'create-contract-rule' : 'create-rule') : 'update'}`;
        const {
          fixedRuleList = [],
          ladderRuleList = [],
          ruleDimensionInfoList = [],
          cumulativeDimensionInfoList = [],
        } = data[0] || {};
        const item = {
          ...data[0],
          currentStep,
          fixedRuleList: getEffectiveData(fixedRuleList),
          ladderRuleList: getEffectiveData(ladderRuleList),
          ruleDimensionInfoList: getEffectiveData(ruleDimensionInfoList),
          cumulativeDimensionInfoList: getEffectiveData(cumulativeDimensionInfoList),
        };
        return {
          url,
          method: action === 'publish' ? 'POST' : source === 'create' ? 'POST' : 'PUT',
          data: item,
        };
      },
      destroy: ({ data }) => {
        const newData = majorPcNum ? data : data.map(d => d.ruleId);
        return {
          url: majorPcNum ? `${urlPrefix}/pfp-rule-contract-info/deleteRule` : `${urlPrefix}/pfp-rule/delete`,
          method: majorPcNum ? 'PUT' : 'POST',
          data: newData,
        };
      },
    },
    feedback: {
      submitSuccess: () => {
        if (!modalFlag) notification.success({});
      },
    },
  };
};


// 适用范围/累计维度行
export const dimensionLineDS = (dimensionType: DimensionType, discountRemote?): DataSetProps =>
{

  return {
    paging: false,
    // autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'dimensionCode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionDefinitionId`).d('维度范围'),
        lookupCode: 'SPFP.BASE_DIMENSION_INFO',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            const ruleDs = dataSet.parent;
            const sourceCombineDocumentCode = ruleDs?.current?.get('sourceCombineDocumentCode');
            return { documentCode: sourceCombineDocumentCode, dimensionType, preferentialType: 'DISCOUNT' };
          },
        },
      },
      {
        name: 'dimensionOperation',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionOperation`).d('特性值'),
        lookupCode: 'SPCM.RULE_OPERATION',
      },
      {
        name: 'dimensionValue',
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionValue`).d('维度值'),
        computedProps: {
          multiple: ({ record, dataSet }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType } = leftValueParams || {};
            return !['INPUT_NUMBER'].includes(componentType) && ['IN', 'NOT_IN'].includes(record.get('dimensionOperation'));
          },
          lovCode: ({ dataSet, record }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType, lovCode } = leftValueParams || {};
            return componentType === 'LOV' ? lovCode : null;
          },
          type: ({ dataSet, record }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType } = leftValueParams;
            return componentType === 'LOV'
              ? FieldType.object
              : componentType === 'INPUT_NUMBER'
                ? FieldType.number
                : FieldType.string;
          },
          lookupCode: ({ dataSet, record }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType, lovCode } = leftValueParams;
            return componentType === 'SELECT' ? lovCode : null;
          },
          textField: ({ record, dataSet }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovMappingList = [] } = leftValueParams;
            const lovMappingData = baseDimensionLovMappingList.find(item => item.fieldType === 'DESCRIPTION');
            const { fieldCode } = lovMappingData || {};
            return fieldCode || 'meaning';
          },
          valueField: ({ record, dataSet }) => {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovMappingList = [], value } = leftValueParams;
            const lovMappingData = baseDimensionLovMappingList.find(item => item.targetDimensionCode === value);
            const { fieldCode } = lovMappingData || {};
            return fieldCode || 'value';
          },
          lovPara: ({ record, dataSet }) => {
            let params = {};
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovParamList = [] } = leftValueParams;
            baseDimensionLovParamList.forEach(lovParemItem => {
              const { paramType, paramCode, paramName } = lovParemItem || {};
              if (paramType === 'CONTEXT') {
                // 上下文
                params = {
                  ...params,
                  [paramName]: paramCode === 'tenantId'
                    ? organizationId
                    : paramCode === 'organizationId'
                      ? getUserOrganizationId()
                      : undefined,
                };
              } else {
                // 固定值
                params = { ...params, [paramName]: paramCode };
              }
            });
            if (discountRemote) {
              params = discountRemote.process('SPFP_DISCOUNT_DETAIL_DIMENSIONVALUE_LOVPARA', params, {
                record,
                dataSet,
                baseDimensionLovParamList,
              });
            }
            return params;

          },
        },
        transformRequest: (value, record) => {
          // 字符化值集,下拉框
          const stringfySingleDimensionValue = value => {
            const dimensionValueField = record.getField('dimensionValue');
            const valueField = record.get('dimensionValueRenderList') ?
              record.get('dimensionCode') : dimensionValueField?.get('valueField', record);
            return isObject(value) ? value[valueField] : value;
          };
          return isArray(value)
            ? value.map(item => stringfySingleDimensionValue(item)).join()
            : stringfySingleDimensionValue(value);
        },
        transformResponse: (value, obj) => {
          const {
            dimensionValueRenderList,
            componentType,
            dimensionOperation,
          } = obj || {};

          const isNumberType = ['INPUT_NUMBER'].includes(componentType);
          const isLovType = ['LOV'].includes(componentType);
          const isMultiple = !isNumberType && ['IN', 'NOT_IN'].includes(dimensionOperation);
          // 获取输入框，下拉框数据
          const getValue = () => {
            // 下拉框,输入框 多选 or 单选
            const valueArr = value?.split(',') || [];
            return isMultiple ? valueArr.join() : value;
          };
          // 获取值集数据
          const getLovValue = () => {
            // [{"对应值集中的valueField"： xxx, "对应值集中的displayField"： xxx},...]
            const lovArr = dimensionValueRenderList || [];
            return lovArr.length ? isMultiple ? lovArr : lovArr[0] : value;
          };
          return !isNumberType ? isLovType ? getLovValue() : getValue() : value;
        },
      },
      {
        name: 'dimensionDefinitionId',
        type: FieldType.string,
        transformRequest: (value, record) => {
          const leftValueParams = getLeftValueParams(record, record);
          const { dimensionDefinitionId } = leftValueParams;
          return dimensionDefinitionId || value;
        },
      },
      {
        name: 'dimensionType',
        type: FieldType.string,
        transformRequest: (value) => {
          return dimensionType || value;
        },
      },
      {
        name: 'updateCheck',
        type: FieldType.string,
        transformRequest: () => 0,
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${urlPrefix}/pfp-rule-dimension-info/list`,
          method: 'GET',
          data: { ruleId: data.ruleId, dimensionType },
        };
      },
      destroy: ({ data }) => {
        const { ruleId } = data[0];
        return {
          url: `${urlPrefix}/pfp-rule-dimension-info/${ruleId}/delete`,
          method: 'DELETE',
          data,
        };
      },
      submit: ({ data, dataSet }) => {
        const ruleId = dataSet?.parent?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/pfp-rule-dimension-info/${ruleId}/update`,
          method: 'POST',
          data,
        };
      },
    },
    events: {
      update: ({ dataSet, record, name, ...res }) => {
        if (name === 'dimensionCode') {
          const leftValueParams = getLeftValueParams(dataSet, record) || {};
          const { componentType, lovCode } = leftValueParams;
          // 清空操作符和纬度值
          record.set({
            componentType,
            dimensionValueLovCode: lovCode,
            dimensionOperation: '',
            dimensionValue: undefined,
          });
        }
        if (name === 'dimensionOperation') {
          // 清空维度值
          record.set('dimensionValue', undefined);
        }
        if (discountRemote?.event) {
          discountRemote.event.fireEvent('handleFieldChange', { dataSet, record, name, ...res });
        }
      },
    },
  };
};

// 查询视图
export const queryLineDS = (fields, ruleId): DataSetProps => {
  return {
    selection: false,
    fields,
    pageSize: 20,
    transport: {
      read: ({ params }) => {
        return {
          url: `${urlPrefix}/pfp-rule-dimension-info/queryViewList`,
          method: 'GET',
          params: { ...params, ruleId },
          transformResponse: (res) => {
            try {
              const response = JSON.parse(res);
              const { content } = response || {};
              return {
                ...response,
                content: (content || []).map(itemArr => {
                  const data = {};
                  (itemArr || []).forEach(obj => {
                    const { dimensionCode, dimensionValue } = obj || {};
                    if (dimensionCode) {
                      data[dimensionCode] = dimensionValue;
                    }
                  });
                  return data;
                }),
              };
            } catch (err) {
              return {};
            }
          },
        };
      },
    },
  };
};

const validatorSingle = (value, record) => {
  if (value) {
    const isRepeatList = record?.dataSet?.toData().filter((item) => item.fixedValue === value);
    if (isRepeatList.length > 1) {
      return intl.get(`${prefix}.msg.fixedValue.repeat`).d('【每】值重复，请检查输入值');
    }
  }
  return true;
};



// 计算规则-单笔
export const cumulativeSingleLineDS = (): DataSetProps => {
  return {
    primaryKey: 'fixedRuleId',
    // autoQueryAfterSubmit: false,
    selection: false,
    // validationRules: [
    //   {
    //     name: 'minLength',
    //     value: 1,
    //     message: intl.get(`${prefix}.view.validator.cumulative`).d('请至少维护一行数据'),
    //     disabled: ({ dataSet }) => !(!dataSet?.parent?.getState('isLadder') && dataSet?.parent?.current?.get('cumulativeRule')),
    //   },
    // ],
    fields: [
      {
        name: 'fixedValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.fixedValue`).d('每'),
        validator: (value, _, record) => validatorSingle(value, record),
        required: true,
      },
      {
        name: 'resultValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.discountValue`).d('折扣'),
        required: true,
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${urlPrefix}/pfp-fixed-rule/list`,
          method: 'GET',
          data: { ruleId: data.ruleId },
        };
      },
      destroy: ({ data, dataSet }) => {
        const ruleId = dataSet?.parent?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/pfp-fixed-rule/${ruleId}/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (!dataSet?.length && !dataSet?.parent?.getState('isLadder')) {
          dataSet.create({});
        }
      },
    },
  };
};

// 计算规则-累计
export const cumulativeMultiLineDS = (): DataSetProps => {
  return {
    // autoQueryAfterSubmit: false,
    primaryKey: 'ladderRuleId',
    dataToJSON: DataToJSON.all,
    paging: false,
    validationRules: [
      {
        name: 'minLength',
        value: 1,
        message: intl.get(`${prefix}.view.validator.cumulative`).d('请至少维护一行数据'),
        disabled: ({ dataSet }) => !(dataSet?.parent?.getState('isLadder') && dataSet?.parent?.current?.get('cumulativeRule')),
      },
    ],
    fields: [
      // {
      //   name: 'baseAmount',
      //   type: FieldType.number,
      //   label: intl.get(`${prefix}.model.ruleMaintenance.baseAmounts`).d('基准金额'),
      // },
      // {
      //   name: 'deductBaseAmountFlag',
      //   type: FieldType.boolean,
      //   label: intl.get(`${prefix}.model.ruleMaintenance.discount.deductBaseAmountFlag`).d('扣除基准金额后开始折扣'),
      //   trueValue: 1,
      //   falseValue: 0,
      // },
      {
        name: 'rangeFromValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.discountRangeFromValue`).d('折扣范围从(>=)'),
        required: true,
        validator: (value, name, record) => fieldValidator({
          record,
          value,
          name,
          zeroAndPositiveError: true,
          overBeforeValueFlag: true,
          maxCheck: 'rangeToValue',
          // lessAnotherField: 'rangeToValue', // 交给后端做比较好
        }),
      },
      {
        name: 'rangeToValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.discountRangeToValue`).d('折扣范围至(<)'),
        // required: true,
        validator: (value, name, record) => fieldValidator({
          record,
          value,
          name,
          // zeroAndPositiveError: true,
          overBeforeValueFlag: true,
          minCheck: 'rangeFromValue',
        }),
        dynamicProps: {
          required: ({ record, dataSet }) => record?.index !== (dataSet?.length - 1),
        },
      },
      {
        name: 'resultValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.discountValueResult`).d('折扣结果'),
        required: true,
        // dynamicProps: {
        //   label: ({ dataSet }) => `${intl.get(`${prefix}.model.ruleMaintenance.discountValueResult`).d('折扣结果')}：${dataSet.parent?.current?.get('targetFieldName') || ''}`,
        // },
        validator: (value, _, record: any) => {
          if (!record?.dataSet?.parent?.current) {
            return true;
          }
          if (record.dataSet.parent?.current?.get('cumulativeRule') === 'LADDER_REBATES' && value < 0) {
            return intl.get(`${prefix}.model.ruleMaintenance.moreThanZero`).d('该比例值必须大于或等于0');
          } else if (record.dataSet.parent?.current?.get('cumulativeRule') === 'LADDER_REBATES' && value > 100) {
            return intl.get(`${prefix}.model.ruleMaintenance.lessThan100`).d('该比例值必须小于或等于100');
          }
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${urlPrefix}/pfp-ladder-rule/list`,
          method: 'GET',
          data: { ruleId: data.ruleId, page: -1 },
        };
      },
      destroy: ({ data, dataSet }) => {
        const ruleId = dataSet?.parent?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/pfp-ladder-rule/${ruleId}/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        if (!dataSet?.length && dataSet?.parent?.getState('isLadder')) {
          dataSet.create({});
        }
      },
    },
  };
};
