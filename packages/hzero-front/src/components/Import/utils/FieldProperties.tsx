import moment from 'moment';
import intl from 'utils/intl';
import { EMAIL } from 'utils/regExp';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isArray } from 'util';

export const setFieldProperties = (value, obj) => {
  // obj.attributeJson.customOptionList
  let filedPropertied: any = {
    name: obj.fieldCode,
    label: obj.fieldName,
    required: obj.requiredFlag,
    // readOnly: obj.readOnly,
    defaultValue: obj.defaultValue,
    help: obj.help,
    showHelp: 'tooltip',
    type: 'string',
    maxLength: ['MULTIPLE_SELECT', 'SINGLE_SELECT'].includes(value) && !obj.translatableFlag ? undefined : obj.maxLength,
  };
  switch (value) {
    case 'SWITCH':
      if (obj.lovCode) {
        filedPropertied = {
          ...filedPropertied,
          type: 'string',
          lookupCode: obj.lovCode,
        };
      } else {
        filedPropertied = {
          ...filedPropertied,
          type: 'number',
          step: 1,
          max: 1,
          min: 0,
        };
      }
      break;
    case 'TEXT_FIELD':
      break;
    case 'TEXT_AREA':
      break;
    case 'NUMBER_FIELD':
      filedPropertied = {
        ...filedPropertied,
        type: 'number',
        precision: 0,
        min: obj.minValue,
        max: obj.maxValue,
        step: 1,
      };
      break;
    case 'FLOAT':
      filedPropertied = {
        ...filedPropertied,
        type: 'number',
        precision: obj.digitalAccuracy,
        min: obj.minValue,
        max: obj.maxValue,
      };
      break;
    case 'PERCENTAGE':
      // TODO:
      filedPropertied = {
        ...filedPropertied,
        type: 'number',
        precision: obj.digitalAccuracy,
        min: obj.minValue,
        max: obj.maxValue,
      };
      break;

    // case 'PHONE_NUMBER':
    //   filedPropertied = {
    //     ...filedPropertied,
    //     type: 'number',
    //     precision: 0,
    //     min: obj.minValue,
    //     max: obj.maxValue,
    //     step: 1,
    //   };
    //   break;
    // case 'MONEY':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['maxValue'],
    //     ['minValue'],
    //     ['defaultValue'],
    //     ['thousands'],
    //     ['readOnly'],
    //     ['digitalAccuracy'],
    //     ['requiredFlag'],
    //     ['attributeJson'],
    //   ];
    //   break;
    case 'DATE_SELECTION_BOX':
      const format = obj.attributeJson?.displayFormat ? obj.attributeJson.displayFormat.toUpperCase() : DEFAULT_DATE_FORMAT;
      filedPropertied = {
        ...filedPropertied,
        type: 'date',
        format,
        transformRequest: date => {
          if (!date) {
            return undefined;
          } else if (moment.isMoment(date) && date.isValid()) {
            return date.format(format);
          } else if (moment(date, DEFAULT_DATE_FORMAT).isValid()) {
            return moment(date, DEFAULT_DATE_FORMAT).format(format);
          } else {
            return date;
          }
        },
        // TODO: 默认值为固定值时会传给我什么
      };

      break;
    case 'DATETIME_SELECTION_BOX':
      filedPropertied = {
        ...filedPropertied,
        type: 'dateTime',
        format: obj.attributeJson?.displayFormat || DEFAULT_DATETIME_FORMAT,
        transformRequest: date => {
          if (!date) {
            return undefined;
          } else if (moment.isMoment(date) && date.isValid()) {
            return date.format(obj.attributeJson?.displayFormat || DEFAULT_DATETIME_FORMAT);
          } else if (moment(date, DEFAULT_DATETIME_FORMAT).isValid()) {
            return moment(date, DEFAULT_DATETIME_FORMAT).format(
              obj.attributeJson?.displayFormat || DEFAULT_DATETIME_FORMAT
            );
          } else {
            return date;
          }
        },
        // TODO: 默认值为固定值时会传给我什么
      };

      break;

    case 'SINGLE_SELECT':
      filedPropertied = {
        ...filedPropertied,
        type: 'string',
        lookupCode: obj.lovCode,
        transformRequest: (value, record) => {
          // 保存时填充描述字段
          const lookupData = record.getField(filedPropertied.name).getText();
          return lookupData;
        },
      };
      break;
    case 'MULTIPLE_SELECT':
      filedPropertied = {
        ...filedPropertied,
        type: 'string',
        lookupCode: obj.lovCode,
        multiple: true,
        transformRequest: (value, record) => {
          if (isArray(value)) {
            // 保存时填充描述字段
            const lookupData = value.map(v => record.getField(filedPropertied.name).getText(v)).join(',');
            return lookupData;
          }
          return value;
        },
        transformResponse: (value) => {
          return typeof value === 'string' ? value.split(',') : value;
        },
      };
      break;
    case 'RADIO':
      filedPropertied = {
        ...filedPropertied,
        type: 'string',
        lookupCode: obj.lovCode,
      };
      break;
    case 'CHECKBOX':
      filedPropertied = {
        ...filedPropertied,
        type: 'string',
        lookupCode: obj.lovCode,
        multiple: true,
      };
      break;
    case 'EMAIL':
      filedPropertied = {
        ...filedPropertied,
        pattern: EMAIL,
        defaultValidationMessages: {
          patternMismatch: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
        },
        type: 'string',
      };
      break;
    // case 'EMAIL':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['maxLength'],
    //     ['attributeJson'],
    //     ['requiredFlag'],
    //     [
    //       'defaultValue',
    //       {
    //         Render: () => {
    //           return <EmailField name="defaultValue" />;
    //         },
    //       },
    //     ],
    //   ];
    //   break;
    // case 'APPENDIX':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['fileType'],
    //     ['multiple'],
    //     ['requiredFlag'],
    //     ['fileLimit'],
    //     ['maxUpload'],
    //     ['attributeJson'],
    //   ];
    //   break;
    // case 'LINK':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['maxLength'],
    //     ['attributeJson'],
    //     ['requiredFlag'],
    //     [
    //       'defaultValue',
    //       {
    //         Render: () => {
    //           return <UrlField name="defaultValue" />;
    //         },
    //       },
    //     ],
    //   ];
    //   break;
    // case 'MASTER_RELATION':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['masterBusinessObject', { ignore: 'always' }],
    //     ['masterBusinessObjectId'],
    //     ['associatedWay'],
    //     ['refBusinessObjectName'],
    //     ['requiredFlag'],
    //     ['attributeJson'],
    //   ];
    //   break;
    // case 'LINK_RELATION':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['masterBusinessObject', { ignore: 'always' }],
    //     ['refBusinessObjectName'],
    //     ['masterBusinessObjectId'],
    //     ['requiredFlag'],
    //     ['attributeJson'],
    //   ];
    //   break;
    // case 'REFERENCE_FIELD':
    //   filedPropertied = [
    //     ...commonProperties,
    //     ['attributeJson'],
    //     ['refBusinessObject'],
    //     ['refBusinessObjectFieldId'],
    //     ['refBusinessObjectId'],
    //     ['formula'],
    //     ['refBusinessObjectFieldName'],
    //     ['businessObjectId'],
    //   ];
    //   break;
    case "FORMULA":
      if (obj.lovCode) {
        filedPropertied = {
          ...filedPropertied,
          type: 'string',
          lookupCode: obj.lovCode,
        };
      }
    default:
  }
  return filedPropertied;
};
