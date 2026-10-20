import { isEmpty, isObject } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import lodashResult from 'lodash/result';

const organizationId = getCurrentOrganizationId();

// 字段属性
export const handleFieldProps = ({ record, dataSet }) => {
  let propsConfig = {};
  if (record) {
    const { attributeName, attributeValueType } = record.get([
      'attributeName',
      'attributeValueType',
    ]);
    const config = componentPropsTypeMap({ dataSet, record });
    const { extraConfig = {} } = config;
    // 默认属性转化
    const defaultConfg = configMap(attributeValueType);
    propsConfig = lodashResult(config, `propsConfig.${attributeName}`, defaultConfg);
    propsConfig = {
      ...propsConfig,
      ...extraConfig,
    };
  }
  return propsConfig;
};

// 处理组件属性
function componentPropsTypeMap({ dataSet, record }) {
  const { componentType, attributeName, lovCode } = record.get([
    'componentType',
    'attributeName',
    'lovCode',
  ]);
  const {
    valueField,
    displayField: textField,
    configName,
    fieldCode,
    componentType: parentComponentType,
  } = dataSet.getState('parentRecord') || {};
  let config = {};
  let extraConfig = {};
  // 【参考区间】不为空时，【校验规则】必输
  if (attributeName === 'validateRules') {
    const referenceRangeRecord = dataSet.find(r => r.get('attributeName') === 'referenceRange');
    if (!isEmpty(referenceRangeRecord)) {
      const referenceRange = referenceRangeRecord.get('attributeValue');
      extraConfig = {
        required: !!referenceRange,
      };
    }
  }
  // 部分属性增加正则校验
  if (attributeName === 'conditionConfig' || attributeName === 'patternCondition') {
    extraConfig = {
      pattern: /^\s*[0-9A-Za-z]+\s*[:]\s*[0-9A-Za-z]+\s*$/,
    };
  }
  // 附件类型级联组件禁用默认值
  const fileTypeDisabled =
    attributeName === 'defaultValue' &&
    ['attachment_type'].includes(fieldCode) &&
    ['Cascader'].includes(parentComponentType) &&
    ['sslm_investg_attachment'].includes(configName);
  // 开启url转化附件配置禁用，勿改
  const uuidTransformUrlDisabled =
    ['isAttachmentUrl'].includes(attributeName) ||
    (['attachment'].includes(fieldCode) && ['defaultValue'].includes(attributeName));
  if (fileTypeDisabled || uuidTransformUrlDisabled) {
    extraConfig = {
      disabled: true,
    };
  }
  switch (componentType) {
    case 'Upload':
      config = {
        propsConfig: {
          templateAttachmentUUID: {
            type: 'attachment',
          },
          viewOnly: {
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            transformResponse: (value, data) => {
              const { attributeValue } = data;
              if (!value) {
                return 0;
              } else {
                return Number(attributeValue) ? Number(attributeValue) : 0;
              }
            },
          },
          bucketName: {
            disabled: true,
          },
          bucketDirectory: {
            disabled: true,
          },
          mandatoryField: {
            type: 'string',
            lookupCode: 'SSLM_PRODUCE_SERVICE_MANDATORY_FIELD',
            multiple: ',',
            lovPara: {
              tenantId: organizationId,
            },
          },
        },
        // disabledField: 'viewOnly',
      };
      break;
    case 'Input':
      config = {
        propsConfig: {
          maxLength: {
            type: 'number',
            min: 0, // 文本框的最大长度是一个自然数（非负整数）
            precision: 0,
          },
          typeCase: {
            type: 'string',
            lookupCode: 'SSLM.CHANGE_CASE',
          },
          defaultValue: {
            type: 'string',
          },
        },
      };
      break;
    case 'ValueList':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'string',
            lookupCode: lovCode,
            lovPara: {
              tenantId: organizationId,
            },
          },
        },
      };
      break;
    case 'Lov': {
      config = {
        propsConfig: {
          defaultValue: {
            type: 'object',
            lovCode,
            lovPara: {
              tenantId: organizationId,
            },
            noCache: true,
            transformResponse: (value, data) => {
              const { attributeValue, attributeValueMeaning } = data;
              if (!value) {
                return null;
              } else {
                return {
                  [textField]: attributeValueMeaning,
                  [valueField]: attributeValue,
                };
              }
            },
            transformRequest: value => {
              // const { valueField } = curentRecord.get(['valueField']);
              if (valueField) {
                return value && value[valueField];
              } else {
                return null;
              }
            },
          },
        },
      };
      break;
    }
    case 'InputNumber':
      config = {
        propsConfig: {
          validateRules: {
            type: 'string',
            lookupCode: 'SSLM.BASIC_REGISTERED_CAPITAL_VERIFICATION',
            lovPara: {
              organizationId,
            },
          },
          referenceRange: {
            type: 'string',
            pattern: /^([([])([1-9]\d*\.?\d*)+[,]([1-9]\d*\.?\d*)+([)\]])$/g,
          },
          defaultValue: {
            type: 'number',
            // min: 0, // 文本框的最大长度是一个自然数（非负整数）
            // precision: 0,
          },
        },
      };
      break;
    case 'Switch':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            transformResponse: (value, data) => {
              const { attributeValue } = data;
              if (!value) {
                return 0;
              } else {
                return Number(attributeValue) ? Number(attributeValue) : 0;
              }
            },
          },
        },
      };
      break;
    case 'TextArea':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'string',
          },
        },
      };
      break;
    case 'Checkbox':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'boolean',
            trueValue: 1,
            falseValue: 0,
            transformResponse: (value, data) => {
              const { attributeValue } = data;
              if (!value) {
                return 0;
              } else {
                return Number(attributeValue) ? Number(attributeValue) : 0;
              }
            },
          },
        },
      };
      break;
    case 'DatePicker':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'date',
          },
        },
      };
      break;
    case 'DateTimePicker':
      config = {
        propsConfig: {
          defaultValue: {
            type: 'dateTime',
          },
        },
      };
      break;
    case 'TransferLov': {
      config = {
        propsConfig: {
          defaultValue: {
            type: 'object',
            lovCode,
            lovPara: {
              tenantId: organizationId,
            },
            multiple: true,
            noCache: true,
            transformRequest: value => {
              if (value) {
                if (isEmpty(value)) {
                  return null;
                } else {
                  return value.map(i => i[valueField]).join(',');
                }
              } else {
                return null;
              }
            },
            transformResponse: (value, data) => {
              const { attributeValue } = data;
              if (!attributeValue) {
                return null;
              } else {
                const multipleDefaultValue = hanldeMultipleLovMeaning({
                  data,
                  textField,
                  valueField,
                });
                return multipleDefaultValue;
              }
            },
          },
        },
      };
      break;
    }
    default:
      config = {};
  }
  return {
    ...config,
    extraConfig,
  };
}

// 组件类型到组件映射
function configMap(type) {
  const strConfig = {
    type: 'string',
  };
  const numConfig = {
    type: 'number',
  };
  const integerConfig = {
    type: 'number',
    min: 0,
    precision: 0,
  };
  const booleanConfig = {
    type: 'boolean',
    trueValue: 1,
    falseValue: 0,
    transformResponse: (value, data) => {
      const { attributeValue } = data;
      if (!value) {
        return 0;
      } else {
        return Number(attributeValue) ? Number(attributeValue) : 0;
      }
    },
  };
  const lovConfig = {
    type: 'object',
  };
  const dateConfig = {
    type: 'date',
  };
  const dateTimeConfig = {
    type: 'dateTime',
  };
  switch (type) {
    case 'Lov':
    case 'TransferLov':
      return lovConfig;
    case 'ValueList':
    case 'String':
    case 'Input':
      return strConfig;
    case 'Integer':
      return integerConfig;
    case 'Number':
    case 'Double':
      return numConfig;
    case 'Boolean':
    case 'Tinyint':
    case 'Checkbox':
      return booleanConfig;
    case 'DatePicker':
      return dateConfig;
    case 'DateTimePicker':
      return dateTimeConfig;
    default:
      return {
        type: 'string',
        trueValue: 1,
        falseValue: 0,
      };
  }
}

// 处理多选lov翻译取值问题
function hanldeMultipleLovMeaning({ valueField, textField, data }) {
  const { attributeValueMeaning } = data;
  const arr = [];
  if (isObject(attributeValueMeaning)) {
    for (const key in attributeValueMeaning) {
      if (Object.hasOwnProperty.call(attributeValueMeaning, key)) {
        const element = attributeValueMeaning[key];
        arr.push({
          [valueField]: key,
          [textField]: element,
        });
      }
    }
  }
  return arr;
}
