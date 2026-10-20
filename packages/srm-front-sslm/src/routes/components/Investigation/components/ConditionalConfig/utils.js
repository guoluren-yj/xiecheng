import moment from 'moment';
import { camelCase } from 'lodash';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

// 获取组件配置
export const getComponentType = ({ record } = {}) => {
  const { textField, valueField, componentType, lovCode, toValueListFlag, fieldName } = record.get([
    'textField',
    'componentType',
    'valueField',
    'lovCode',
    'toValueListFlag',
    'fieldName',
  ]);
  const disabled = ['EXISTS', 'NOT_EXISTS', 'NOTNULL', 'ISNULL'].includes(record.get('relation'));
  const required = !['EXISTS', 'NOT_EXISTS', 'NOTNULL', 'ISNULL'].includes(record.get('relation'));
  let config = {
    disabled,
    required,
  };
  let componentTypeToUpper = componentType && componentType.toUpperCase();
  const fieldNameStr = fieldName && camelCase(fieldName);
  if (Number(toValueListFlag)) {
    // 附件类型特殊处理
    componentTypeToUpper = 'VALUELIST';
  }
  switch (componentTypeToUpper) {
    case 'LOV':
    case 'TRANSFERLOV':
      config = {
        ...config,
        type: 'object',
        lovCode,
        textField,
        valueField,
        transformRequest: value => {
          if (!value) return null;
          return value && value[valueField];
        },
        transformResponse: (value, object) => {
          if (!value) return null;
          const { fieldValueMeaning } = object;
          const newValue = {
            [valueField]: value,
            [textField]: fieldValueMeaning,
          };
          return newValue;
        },
      };
      break;
    case 'SELECT':
    case 'VALUELIST': {
      let lookupCode = lovCode;
      if (Number(toValueListFlag)) {
        if (fieldNameStr === 'attachmentType') {
          lookupCode = 'SPFM.COMPANY.SUB_ATTACHMENT';
        }
        if (fieldNameStr === 'authenticationType') {
          lookupCode = 'SSLM.QUALIFICATION_AUTHENTICATION_TYPE';
        }
      }
      config = {
        ...config,
        type: 'string',
        lookupCode,
      };
      break;
    }
    case 'IntlField':
    case 'INTLFIELD':
    case 'TLEDITOR':
      config = {
        ...config,
        type: 'intl',
      };
      break;
    case 'DatePicker':
    case 'DATEPICKER':
      config = {
        ...config,
        type: 'date',
        transformRequest: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
        // transformResponse: val => val && moment(val).format(DEFAULT_DATE_FORMAT),
      };
      break;
    case 'NumberField':
    case 'NUMBERFIELD':
    case 'INPUTENUMBER':
      config = {
        ...config,
        type: 'number',
      };
      break;
    case 'CheckBox':
    case 'CHECKBOX':
    case 'Switch':
    case 'SWITCH':
      config = {
        ...config,
        type: 'string',
        lookupCode: 'HPFM.FLAG',
      };
      break;
    case 'DateTimePicker':
    case 'DATETIMEPICKER':
      config = {
        ...config,
        type: 'dateTime',
        transformRequest: val => val && moment(val).format(DEFAULT_DATETIME_FORMAT),
      };
      break;
    default:
      config = {
        ...config,
        type: 'string',
      };
  }
  // console.log(config);
  return config;
};
