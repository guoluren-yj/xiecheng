import React from 'react';
import intl from 'hzero-front/lib/utils/intl';
import {
  DataSet,
  EmailField,
  UrlField,
  SelectBox,
  DatePicker,
  DateTimePicker,
  NumberField,
  Switch,
} from 'choerodon-ui/pro';
import { DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { isTenantRoleLevel } from 'utils/utils';

import ObjectFieldDS from './ObjectFieldDS';

const isTenant = isTenantRoleLevel();

export const setFieldProperties = ({
  type,
  isEditMode,
  isExtensionField,
  isFromDomain,
  businessObjectId,
}: {
  type: string;
  isEditMode?: boolean;
  isExtensionField?: boolean;
  isFromDomain?: boolean;
  businessObjectId?: string;
}) => {
  let filedPropertied: any[] = [];

  // 平台新建或者编辑扩展字段 及 限制可以填的项
  const isPlatformCreateExtensionField = !isTenant && isExtensionField;
  const PlatformCreateExtensionFieldFilter = [
    isFromDomain ? 'templateFieldCode' : 'extendFieldCode',
    'remark',
    'maxLength',
    // 'maxValue',
    // 'minValue',
    'digitalAccuracy',
  ];

  const domainCommonProperty = [
    ['templateFieldName'],
    ['templateFieldCode'],
    ['remark'],
    ['helpText'],
    ['exportableFlag'],
  ];

  const commonProperties = isFromDomain
    ? domainCommonProperty
    : [
      !isExtensionField ? ['businessObjectFieldName'] : ['inheritFieldName'],
      isTenant &&
      !isEditMode &&
      isExtensionField &&
      type !== 'REFERENCE_FIELD' && [
        'businessObjectField',
        {
          lovPara: {
            componentType: type,
            businessObjectId,
          },
        },
      ],
      isTenant && !isEditMode && isExtensionField && ['extendFieldId'],
      !isExtensionField ? ['businessObjectFieldCode'] : ['inheritFieldCode'], // 租户下新增扩展字段为Lov
      !isTenant && isExtensionField && ['extendFieldCode'],
      ['remark'],
      ['helpText'],
      ['exportableFlag'],
    ].filter(Boolean);

  switch (type) {
    case 'summary':
      filedPropertied = [
        ...commonProperties,
        ['aggregateObject'],
        ['aggregateFiled'],
        ['aggregateFiled'],
        ['precision'],
        ['attributeJson'],
      ];
      break;
    case 'SWITCH':
      filedPropertied = [
        ...commonProperties,
        [
          'requiredFlag',
          {
            defaultValue: false,
            Render: () => { },
          },
        ],
        [
          'defaultValueType',
          {
            type: 'string',
            textField: 'text',
            valueField: 'value',
            defaultValue: '0',
            label: intl.get('hmde.bo.field.defaultValue').d('默认值'),
            options: (() => {
              return new DataSet({
                selection: DataSetSelection.single,
                data: [
                  {
                    text: intl.get('hzero.common.button.close').d('关闭'),
                    value: '0',
                  },
                  {
                    text: intl.get('hmde.common.button.open').d('开启'),
                    value: '1',
                  },
                  {
                    text: intl.get('hzero.common.button.express').d('表达式'),
                    value: 'EXPRESSION',
                  },
                ],
              });
            })(),
            Render: (props) => {
              return (
                <SelectBox
                  disabled={props?.disabled}
                  key="defaultValueType"
                  name="defaultValueType"
                  optionsFilter={(record) => {
                    if (isFromDomain && record?.get('value') === 'EXPRESSION') {
                      return false;
                    }
                    return true;
                  }}
                />
              );
            },
          },
        ],
        [
          'defaultValue',
          {
            defaultValue: '0',
          },
        ],
        ['attributeJson'],
        ['meaningConfig'],
        ['valueList'],
        ['lovCode'],
        ['trueMeaning'],
        ['falseMeaning'],
      ];
      break;
    case 'TEXT_FIELD':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            defaultValue: 240,
            validator: (recordValue) => {
              if (recordValue || recordValue === 0) {
                // if (recordValue > 240 || recordValue < 1) {
                if (recordValue > 2147483647 || recordValue < 1) {
                  // return intl.get('hmde.bo.validation.range.minmax').d('可填范围为 1-240');
                  return intl.get('hmde.bo.validation.range.minmax', { name: '1-2147483647' }).d('可填范围为 1-2147483647');
                }
              }
            },
          },
        ],
        ['attributeJson'],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (recordValue) {
                if (recordValue.length > 255) {
                  return intl.get('hmde.bo.validation.maxLength').d('最大可输入 255 个字符');
                }
              }
            },
          },
        ],
        ['readOnlyFlag'],
        ['requiredFlag'],
        !isTenant &&
        !isExtensionField && [
          'multiLanguageFlag',
          {
            // 平台标准才有多语言
            name: 'multiLanguageFlag',
            type: 'boolean',
            label: intl.get('hmde.bo.field.multiLanguageFlag').d('是否多语言'),
            // defaultValue: false, // defaultValue和transformResponse不能共用 当前版本c7n有回显Bug
            required: true,
            transformResponse: (value) => {
              if (value === undefined || value === null) {
                return false;
              } else {
                return value;
              }
            },
            Render: (props) => {
              return (
                <Switch
                  disabled={props?.disabled}
                  key="multiLanguageFlag"
                  name="multiLanguageFlag"
                />
              );
            },
          },
        ],
      ].filter(Boolean);
      break;
    case 'TEXT_AREA':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            min: 1,
            validator: (recordValue) => {
              if (recordValue || recordValue === 0) {
                if (recordValue > 2147483647 || recordValue < 1) {
                  return intl
                    .get('hmde.bo.validation.range.textArea')
                    .d('可填范围为 1-2147483647 的整数');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (recordValue) {
                if (recordValue.length > 500) {
                  return intl
                    .get('hmde.bo.validation.maxLength.textArea')
                    .d('最大可输入 500 个字符');
                }
              }
            },
          },
        ],
        ['readOnlyFlag'],
        ['attributeJson'],
        ['requiredFlag'],
        !isTenant &&
        !isExtensionField &&
        [
          'multiLanguageFlag',
          {
            // 平台标准才有多语言
            name: 'multiLanguageFlag',
            type: 'boolean',
            label: intl.get('hmde.bo.field.multiLanguageFlag').d('是否多语言'),
            // defaultValue: false, // defaultValue和transformResponse不能共用 当前版本c7n有回显Bug
            required: true,
            transformResponse: (value) => {
              if (value === undefined || value === null) {
                return false;
              } else {
                return value;
              }
            },
            Render: (props) => {
              return (
                <Switch
                  disabled={props?.disabled}
                  key="multiLanguageFlag"
                  name="multiLanguageFlag"
                />
              );
            },
          },
        ].filter(Boolean),
      ];
      break;
    case 'NUMBER_FIELD':
      filedPropertied = [
        ...commonProperties,
        ['valueList'],
        ['lovCode'],
        [
          'maxValue',
          {
            validator: (recordValue, _, record) => {
              if (recordValue && record.get('minValue')) {
                if (recordValue < record.get('minValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        [
          'minValue',
          {
            validator: (recordValue, _, record) => {
              if (recordValue && record.get('maxValue')) {
                if (recordValue > record.get('maxValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (recordValue && record.get('maxValue') && record.get('minValue')) {
                if (recordValue > record.get('maxValue') || recordValue < record.get('minValue')) {
                  return intl
                    .get('hmde.bo.validation.valueError')
                    .d('输入的值大于【最大值】或小于【最小值】');
                }
              }
            },
            step: 1,
            dynamicProps: {
              type: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return 'string';
                }
                return 'number';
              },
              nonStrictStep: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return true;
                }
                return false;
              },
              required: ({ record }) => {
                const val = record.get('defaultValueType');
                return val === 'NORMAL';
              },
            },
            Render: (props) => {
              return (
                <NumberField disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
          },
        ],
        ['readOnlyFlag'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'FLOAT':
      filedPropertied = [
        ...commonProperties,
        [
          'maxValue',
          {
            validator: (recordValue, _, record) => {
              if (recordValue && record.get('minValue')) {
                if (recordValue < record.get('minValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        [
          'minValue',
          {
            validator: (recordValue, _, record) => {
              if (recordValue && record.get('maxValue')) {
                if (recordValue > record.get('maxValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (recordValue && record.get('maxValue') && record.get('minValue')) {
                if (recordValue > record.get('maxValue') || recordValue < record.get('minValue')) {
                  return intl
                    .get('hmde.bo.validation.valueError')
                    .d('输入的值大于【最大值】或小于【最小值】');
                }
              }
            },
            dynamicProps: {
              precision: ({ record }) => record.get('digitalAccuracy'),
              type: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return 'string';
                }
                return 'number';
              },
              required: ({ record }) => {
                const val = record.get('defaultValueType');
                return val === 'NORMAL';
              },
            },
            Render: (props) => {
              return (
                <NumberField disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
          },
        ],
        ['readOnlyFlag'],
        ['digitalAccuracy'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'PERCENTAGE':
      filedPropertied = [
        ...commonProperties,
        [
          'maxValue',
          {
            validator: (recordValue, _, record) => {
              if ((recordValue || recordValue === 0) && record.get('minValue')) {
                if (recordValue < record.get('minValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        [
          'minValue',
          {
            validator: (recordValue, _, record) => {
              if ((recordValue || recordValue === 0) && record.get('maxValue')) {
                if (recordValue > record.get('maxValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (
                (recordValue || recordValue === 0) &&
                record.get('maxValue') &&
                record.get('minValue')
              ) {
                if (recordValue > record.get('maxValue') || recordValue < record.get('minValue')) {
                  return intl
                    .get('hmde.bo.validation.valueError')
                    .d('输入的值大于【最大值】或小于【最小值】');
                }
              }
            },
            dynamicProps: {
              precision: ({ record }) => record.get('digitalAccuracy'),
              type: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return 'string';
                }
                return 'number';
              },
              required: ({ record }) => {
                const val = record.get('defaultValueType');
                return val === 'NORMAL';
              },
            },
            Render: (props) => {
              return (
                <NumberField disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
          },
        ],
        ['digitalAccuracy'],
        ['readOnlyFlag'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'PHONE_NUMBER':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            defaultValue: 240,
            validator: (recordValue) => {
              if (recordValue || recordValue === 0) {
                if (recordValue > 4000 || recordValue < 1) {
                  return intl.get('hmde.bo.validation.range.minmax', { name: '1-4000' }).d('可填范围为 1-4000');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            numberGrouping: false,
            validator: (recordValue, _, record) => {
              if (!recordValue) return; // 默认值是非必输，可以为空，但是一旦有值，只能是手机号
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (!/^[1]([3-9])[0-9]{9}$/.test(recordValue)) {
                return intl
                  .get('hmde.bo.validation.defaultValue.phoneNumberMessage')
                  .d('手机号码格式不正确，请检查');
              }
            },
            dynamicProps: {
              type: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return 'string';
                }
                return 'number';
              },
              required: ({ record }) => {
                const val = record.get('defaultValueType');
                return val === 'NORMAL';
              },
            },
            Render: (props) => {
              return (
                <NumberField disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
          },
        ],
        ['readOnlyFlag'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'MONEY':
      filedPropertied = [
        ...commonProperties,
        [
          'maxValue',
          {
            validator: (recordValue, _, record) => {
              if ((recordValue || recordValue === 0) && record.get('minValue')) {
                if (recordValue < record.get('minValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        [
          'minValue',
          {
            validator: (recordValue, _, record) => {
              if ((recordValue || recordValue === 0) && record.get('maxValue')) {
                if (recordValue > record.get('maxValue')) {
                  return intl.get('hmde.bo.validation.maxValueError').d('最小值不可大于最大值');
                }
              }
            },
          },
        ],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            dynamicProps: {
              precision: ({ record }) => record.get('digitalAccuracy'),
              type: ({ record }) => {
                if (record?.get('defaultValueType') === 'EXPRESSION') {
                  return 'string';
                }
                return 'number';
              },
              required: ({ record }) => {
                const val = record.get('defaultValueType');
                return val === 'NORMAL';
              },
            },
            validator: (recordValue, _, record) => {
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              if (
                (recordValue || recordValue === 0) &&
                record.get('maxValue') &&
                record.get('minValue')
              ) {
                if (recordValue > record.get('maxValue') || recordValue < record.get('minValue')) {
                  return intl
                    .get('hmde.bo.validation.valueError')
                    .d('输入的值大于【最大值】或小于【最小值】');
                }
              }
            },
            Render: (props) => {
              return (
                <NumberField disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
          },
        ],
        ['thousandsFlag'],
        ['readOnlyFlag'],
        ['digitalAccuracy'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'DATE_SELECTION_BOX':
      filedPropertied = [
        ...commonProperties,
        ['format'],
        ['displayFormat'],
        ['requiredFlag'],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            Render: (props) => {
              return (
                <DatePicker disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
            format: 'YYYY-MM-DD',
            label: intl.get('hmde.bo.view.message.fixDate').d('固定值日期'),
            dynamicProps: {
              required: ({ record }) => {
                if (record.get('defaultValueType') === 'NORMAL' && !isExtensionField) {
                  return true;
                }
                return false;
              },
            },
          },
        ],
        ['attributeJson'],
      ];
      break;
    case 'DATETIME_SELECTION_BOX':
      filedPropertied = [
        ...commonProperties,
        ['format'],
        ['timeZoneConvertFlag'],
        ['requiredFlag'],
        [
          'defaultValue',
          {
            Render: (props) => {
              return (
                <DateTimePicker disabled={props?.disabled} key="defaultValue" name="defaultValue" />
              );
            },
            label: intl.get('hmde.bo.view.message.fixDate').d('固定值日期'),
            dynamicProps: {
              required: ({ record }) => {
                if (record.get('fixDateTime') === 'fix' && !isExtensionField) {
                  return true;
                }
                return false;
              },
            },
          },
        ],
        ['fixDateTime'],
        ['attributeJson'],
      ];
      break;
    case 'EMAIL':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            defaultValue: 240,
            max: 2147483647,
          },
        ],
        ['attributeJson'],
        ['requiredFlag'],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            validator: (recordValue, _, record) => {
              if (!recordValue) return; // 邮箱是非必输，可以为空，但是一旦有值，只能是正常邮箱
              if (record?.get('defaultValueType') === 'EXPRESSION') return; // 如果是公式类型的默认值，不做校验
              const emailReg = /^([a-zA-Z0-9_ . -])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
              if (!emailReg.test(recordValue)) {
                return intl
                  .get('hmde.bo.validation.defaultValue.emailMessage')
                  .d('邮箱格式不正确，请检查');
              }
            },
            Render: (props) => {
              return <EmailField disabled={props?.disabled} name="defaultValue" />;
            },
          },
        ],
      ];
      break;
    case 'APPENDIX':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            defaultValue: 240,
            validator: (recordValue) => {
              if (recordValue || recordValue === 0) {
                if (recordValue > 4000 || recordValue < 1) {
                  return intl.get('hmde.bo.validation.range.minmax', { name: '1-4000' }).d('可填范围为 1-4000');
                }
              }
            },
          },
        ],
        ['fileTypes'],
        isTenant && isExtensionField && ['fileFormats'],
        ['multipleFlag'],
        ['requiredFlag'],
        [
          'maxFileSize',
          {
            min: 0,
          },
        ],
        [
          'maxFileCount',
          {
            min: 1,
          },
        ],
        ['attributeJson'],
      ].filter(Boolean);
      break;
    case 'LINK':
      filedPropertied = [
        ...commonProperties,
        [
          'maxLength',
          {
            defaultValue: 240,
          },
        ],
        ['attributeJson'],
        ['requiredFlag'],
        ['defaultValueType'],
        [
          'defaultValue',
          {
            Render: (props) => {
              return <UrlField disabled={props?.disabled} name="defaultValue" />;
            },
          },
        ],
      ];
      break;
    case 'MASTER_RELATION':
      filedPropertied = [
        ...commonProperties,
        [
          'masterBusinessObject',
          {
            ignore: 'always',
          },
        ],
        ['masterBusinessObjectId'],
        ['masterBusinessObjectCode'],
        ['linkRelationType'],
        ['refBusinessObjectName'],
        // 引用值列表
        ['refValueListBusinessObject'],
        ['businessObjectOptionId'],
        ['businessObjectOptionCode'],
        ['businessObjectOptionName'],
        // 显示方式
        ['lovDisplayType'],
        [
          'requiredFlag',
          { defaultValue: true, readOnly: true, dynamicProps: { readOnly: undefined } },
        ],
        ['attributeJson'],
      ];
      break;
    case 'LINK_RELATION':
      filedPropertied = [
        ...commonProperties,
        ['masterBusinessObject', { ignore: 'always' }],
        ['refBusinessObjectName'],
        ['masterBusinessObjectId'],
        ['masterBusinessObjectCode'],
        // 引用值列表
        ['refValueListBusinessObject'],
        ['businessObjectOptionId'],
        ['businessObjectOptionName'],
        ['businessObjectOptionCode'],
        // 显示方式
        ['lovDisplayType'],
        ['requiredFlag'],
        ['attributeJson'],
      ];
      break;
    case 'REFERENCE_FIELD':
      filedPropertied = [
        ...commonProperties,
        ['attributeJson'],
        ['refBusinessObject'],
        ['refBusinessObjectFieldId'],
        ['refBusinessObjectId'],
        ['formula'],
        ['refBusinessObjectFieldName'],
        ['businessObjectId'],
        ['refBusinessObjectFieldCode'],
        ['refBusinessObjectCode'],
        ['refBusinessObjectAssociateCode'],
        [
          'requiredFlag',
          {
            defaultValue: false,
            Render: () => { },
          },
        ],
      ];
      break;
    default:
      filedPropertied = [];
  }
  return filedPropertied.filter(
    (ele) =>
      !isPlatformCreateExtensionField ||
      (isPlatformCreateExtensionField && PlatformCreateExtensionFieldFilter.includes(ele?.[0]))
  );
};

export const setDatasetProps = ({
  filedPropertied,
  businessObjectId,
  isEditMode,
  isExtensionField,
  isFromDomain,
  businessObjectCode,
  customPrimaryKeyCode,
  componentType,
}) => {
  let datasetProp = ObjectFieldDS({
    businessObjectId,
    isEditMode,
    isExtensionField,
    businessObjectCode,
    isFromDomain,
    customPrimaryKeyCode,
    componentType,
  });
  // 获取当前字段属性的name数组
  const nameArray: string[] = filedPropertied.map((item) => {
    return item[0];
  });
  // 根据数组过滤需要选配的filed
  const currentProps = datasetProp.fields.filter((item) => {
    return nameArray.includes(item.name);
  });
  // 获取需要重新定义的field属性或Render
  const modifyRender = filedPropertied.filter((item) => {
    return item[1];
  });
  // 用重新定义的属性进行覆盖
  let newProps = modifyRender.length
    ? currentProps.map((item) => {
      const modifyItem = modifyRender.filter((value) => {
        return value[0] === item.name;
      });
      if (modifyItem.length) {
        return { ...item, ...modifyItem[0][1] };
      }
      return item;
    })
    : currentProps;
  // // 得到包含所有Render函数的数组
  // const RenderArray = newProps.map((item) => {
  //   return item.Render;
  // });
  // // 去掉Render属性
  // const PropArray = newProps.map((item) => {
  //   // eslint-disable-next-line no-param-reassign
  //   delete item.Render;
  //   return item;
  // });

  // 租户查看平台标准字段的时候 或者 平台层编辑扩展字段时
  if (
    (isTenant && !isExtensionField && isEditMode) ||
    (!isTenant && isExtensionField && isEditMode)
  ) {
    newProps = newProps.map((ele) => {
      return ele.Render
        ? {
          ...ele,
          // disabled: true, //  租户查看平台标准字段的时候 或者 平台层编辑扩展字段时
          dynamicProps: ele.dynamicProps
            ? { ...ele.dynamicProps, disabled: undefined }
            : undefined,
        }
        : ele;
    });
  }

  // 组装datasetProps
  datasetProp = { ...datasetProp, fields: [...newProps] };
  return {
    datasetProps: datasetProp,
  };
};
