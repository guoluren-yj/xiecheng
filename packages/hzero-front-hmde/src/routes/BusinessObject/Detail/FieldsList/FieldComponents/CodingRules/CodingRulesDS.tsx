import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import notification from 'hzero-front/lib/utils/notification';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataToJSON } from 'choerodon-ui/pro/lib/data-set/enum';

const [
  SEQUENCE, // 流水号
  CONSTANT, // 固定字符
  VARIABLE, // 变量
  UUID, // 随机变量uuid
  DATE, // 日期
] = ['SEQUENCE', 'CONSTANT', 'VARIABLE', 'UUID', 'DATE'];
const isTenant = isTenantRoleLevel();

const _validator = (value, customPrimaryKeyCode, isExtensionField) => {
  // const pattern = /^[_a-z][0-9a-zA-Z]{0,}([0-9a-zA-Z]{0,}|[_]{0,})$/;
  const pattern = /^[a-z][0-9a-zA-Z]{0,}$/;
  if (!pattern.test(value)) {
    return intl.get('hmde.bo.field.code.patternValidation').d(
      // '支持小写字母或“_”开头，字母/数字或“_”结尾，编码中间支持使用大写字母/小写字母且不支持使用“_”'
      '支持小写字母开头，中间支持大写字母、小写字母、数字; 推荐使用小驼峰'
    );
  } else if (!isExtensionField && customPrimaryKeyCode && value === customPrimaryKeyCode) {
    return intl
      .get('hmde.bo.field.code.patternValidation.notSamePrimaryKey')
      .d('字段编码和业务对象的基础信息的“自定义主键编码”不能相同');
  } else if (!isExtensionField && !customPrimaryKeyCode && value.toLowerCase() === 'id') {
    return intl.get('hmde.bo.field.code.patternValidation.noValidFieldCode').d('字段编码不能等于"id"');
  }
};

// 已有和创建编码规则编码列表配置属性
const commonListConfig = () =>
  ({
    selection: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'fieldType', // 字段类型
      },
      {
        // 拖动排序的序号
        name: 'orderSeq',
        type: 'number',
        transformRequest: (_, record) => {
          return record.index + 1;
        },
      },
      {
        name: 'ruleName',
        ignore: 'always',
      },
      {
        name: 'firstInputTitle',
        ignore: 'always',
      },
      {
        name: 'firstInput',
        ignore: 'always',
        required: true,
        validator: (value, _, record: Record) => {
          if (record?.get('fieldType') === SEQUENCE) {
            if (value < 1 || value > 20) {
              return '1<=流水号位数<=20';
            }
          }
        },
        dynamicProps: ({ record }) => {
          const fieldType = record?.get('fieldType');
          if ([SEQUENCE, UUID, DATE, VARIABLE].includes(fieldType)) {
            const obj = {};
            switch (fieldType) {
              case SEQUENCE:
                Object.assign(obj, {
                  type: 'number',
                });
                break;
              case UUID:
                Object.assign(obj, {
                  lookupCode: 'HMDE.BO_FIELD.CODE_RULE.UUID_DIGIT',
                  type: 'string',
                  valueField: 'value',
                });
                break;
              case DATE:
                Object.assign(obj, {
                  lookupCode: 'HMDE.BUSINESS_OBJECT.CODE_RULE.DATE_MASK',
                  type: 'string',
                  valueField: 'value',
                });
                break;
              case VARIABLE:
                Object.assign(obj, {
                  lookupCode: 'HMDE.BUSINESS_OBJECT.CODE_RULE.VARIABLE_TYPE',
                  type: 'string',
                  valueField: 'value',
                });
                break;
              default:
                break;
            }
            return obj;
          }
        },
      },
      {
        name: 'secondInputTitle',
        ignore: 'always',
      },
      {
        name: 'secondInput',
        ignore: 'always',
        dynamicProps: {
          type: ({ record }) => {
            if ([SEQUENCE].includes(record.get('fieldType'))) {
              return 'number';
            } else if ([VARIABLE].includes(record.get('fieldType'))) {
              return 'string';
            }
            return 'string';
          },
          required: ({ record }) => {
            if ([SEQUENCE].includes(record.get('fieldType'))) {
              return true;
            } else if ([VARIABLE].includes(record.get('fieldType'))) {
              return true;
            }
            return false;
          },
          // if ([SEQUENCE].includes(record.get('fieldType'))) {
          //   return {
          //     type: 'number',
          //     required: true,
          //   };
          // }
          // if ([VARIABLE].includes(record.get('fieldType'))) {
          //   return {
          //     type: 'string',
          //     required: true,
          //   };
          // }
          // return {
          //   type: 'string',
          // };
        },
        validator: (value, name, record) => {
          if (
            (record as Record)?.get('fieldType') === SEQUENCE &&
            value.toString()?.length > (record as Record)?.get('firstInput')
          ) {
            notification.error({
              message: intl.get('hmde.common.status.error').d('失败'),
              description: intl
                .get('hmde.bo.model.field.sequenceValidate')
                .d('起始流水长度不能大于位数的值'),
              placement: 'bottomRight',
            });
            return intl
              .get('hmde.bo.model.field.sequenceValidate')
              .d('起始流水长度不能大于位数的值');
          }
        },
      },
      {
        name: 'thirdInputTitle',
      },
      {
        name: 'thirdInput',
        type: 'string',
        ignore: 'always',
        lookupCode: 'HPFM.CODE_RULE.RESET_FREQUENCY',
        dynamicProps: {
          required: ({ record }) => record?.get('fieldType') === SEQUENCE,
        },
      },
    ],
    events: {
      create: ({ record, dataSet }) => {
        // 流水号
        if (record.get('fieldType') === SEQUENCE) {
          record.addField('encryptedFlag', { type: 'boolean', defaultValue: 0 }); // 设置是否加密字段
          record.addField('seqLength', { type: 'number' }); // 设置位数
          record.addField('resetFrequency', { type: 'string' }); // 设置重置策略
          record.addField('startValue', { type: 'number', defaultValue: 1 }); // 设置起始流水
        }
        // 固定字符
        if (record.get('fieldType') === CONSTANT) {
          record.addField('fieldValue', { type: 'string' });
        }
        // 变量
        if (record.get('fieldType') === VARIABLE) {
          record.addField('variableKey', {
            type: 'string',
          });
          record.addField('variableType', { type: 'string' });
          record.addField('fieldValue', { type: 'string' });
          const variableArr = dataSet.filter(i => i.get('fieldType') === VARIABLE);
          record.set('variableKey', `variable${variableArr.length}`);
        }
        // UUID
        if (record.get('fieldType') === UUID) {
          record.addField('seqLength', { type: 'string' }); // 设置位数
          record.addField('meaning', { type: 'string' });
        }
        // 日期
        if (record.get('fieldType') === DATE) {
          record.addField('dateMask', { type: 'string' });
          record.addField('meaning', { type: 'string' });
        }
      },
      update: ({ record, name, value }) => {
        // 流水号
        if (record.get('fieldType') === SEQUENCE) {
          if (name === 'firstInput') {
            record.set('seqLength', value);
            record.set('firstInput', value);
          }
          if (name === 'secondInput') {
            record.set('startValue', value);
          }
          if (name === 'thirdInput') {
            record.set('resetFrequency', value);
          }
        }
        // 固定字符
        if (record.get('fieldType') === CONSTANT) {
          if (name === 'firstInput') {
            record.set('fieldValue', value);
          }
        }
        // 变量
        if (record.get('fieldType') === VARIABLE) {
          if (name === 'firstInput') {
            record.set('variableType', value);
          }
          if (name === 'secondInput') {
            record.set('fieldValue', value);
          }
        }
        // UUID
        if (record.get('fieldType') === UUID) {
          if (name === 'firstInput') {
            record.set('seqLength', value?.seqLength);
            record.set('meaning', value?.meaning);
          }
        }
        // 日期
        if (record.get('fieldType') === DATE) {
          if (name === 'firstInput') {
            record.set('dateMask', value);
            record.set('meaning', value?.meaning);
          }
        }
      },
    },
  } as DataSetProps);

// 创建表单配置
const createFormConfig = () => ({
  autoCreate: true,
  dataToJSON: DataToJSON.all,
  fields: [
    {
      label: intl.get('hmde.bo.field.ruleName').d('规则名称'),
      name: 'ruleName',
      type: 'intl',
      dynamicProps: {
        required: ({ dataSet }) =>
          dataSet?.parent?.current.get('optionSettings') === '_createCodeRule' ||
          !dataSet?.parent?.current.get('optionSettings'),
      },
      validator: value => {
        if (value?.length > 60) {
          return '最大长度不能超过60';
        }
      },
    },
    {
      label: intl.get('hmde.bo.field.ruleCode').d('规则编码'),
      name: 'ruleCode',
      type: 'intl',
      validator: value => {
        const pattern = /^[A-Z0-9][A-Z0-9-_./]*$/;
        if (!pattern.test(value)) {
          return intl
            .get('hmde.bo.field.code.patternValidation')
            .d('仅支持大写字母、数字和这些字符(-_./)构成，并且以大写字母或数字开头');
        }
        if (value.length > 30) {
          return '最大长度不能超过30';
        }
      },
      // pattern: /^[A-Z0-9][A-Z0-9-_./]*$/,
      // defaultValidationMessages: {
      //   patternMismatch: intl
      //     .get('hmde.bo.field.code.patternValidation')
      //     .d('仅支持大写字母数字开头，以大写字母数字-_/结尾'),
      // },
      dynamicProps: {
        required: ({ dataSet }) =>
          dataSet?.parent?.current.get('optionSettings') === '_createCodeRule' ||
          !dataSet?.parent?.current.get('optionSettings'),
      },
    },
    {
      label: intl.get('hmde.bo.field.sequenceIsolationLevel').d('流水号规则'),
      name: 'sequenceIsolationLevel',
      type: 'string',
      lookupCode: 'HMDE.BUSINESS_OBJECT.FIELD.CODE_RULE_LEVEL',
      required: true,
    },
    {
      label: intl.get('hmde.bo.field.isolationVariables').d('流水号规则变量'),
      name: 'isolationVariables',
      type: 'intl',
    },
  ],
});

// 自动编码字段ds
export default (
  isExtensionField,
  isEditMode,
  customPrimaryKeyCode,
  componentType,
  businessObjectId
) =>
  ({
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    transport: {
      tls: isTenantRoleLevel()
        ? ({ dataSet, name }) => {
          return {
            url: `${lowcodeOrganizationURL({
              route: HZERO_HMDE,
            })}/business-object-fields/multi-language`,
            params: {
              ...dataSet?.getState('tlsParams'),
              fieldName: name,
            },
          };
        }
        : undefined,
    },
    fields: [
      {
        name: 'useFlag',
        type: 'boolean',
      },
      {
        // 回显attributeJson时 对应绑定了此对象的字段自动回显
        name: 'attributeJson',
        type: 'object',
      },
      {
        name: 'businessObjectFieldId',
        type: 'string',
        ignore: 'always',
      },
      {
        name: 'ruleCode',
        type: 'string',
      },
      isTenant &&
      isExtensionField && {
        name: 'inheritFieldName',
        type: 'intl',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        dynamicProps: {
          required: () => isTenant && isExtensionField,
        },
        maxLength: 300,
        // validator: value => {
        //   if (value.length > 300) {
        //     return '最大长度不能超过300';
        //   }
        // },
      },
      !isExtensionField && {
        name: 'businessObjectFieldName',
        type: 'intl',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        // required: true,
        dynamicProps: {
          required: () => !isExtensionField,
        },
        maxLength: 300,
        // validator: value => {
        //   if (value.length > 300) {
        //     return '最大长度不能超过300';
        //   }
        // },
      },
      isExtensionField && {
        name: 'businessObjectField',
        label: intl.get('hmde.bo.field.extendField.select').d('选择扩展字段'),
        type: 'object',
        unique: true,
        ignore: 'always',
        lovCode: 'HMDE.EXTEND_FIELD',
        dynamicProps: {
          required: () => isExtensionField && !isEditMode,
        },
        lovPara: {
          componentType,
          businessObjectId,
        },
        lovQueryAxiosConfig: {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-object-extend-field/extend-fields/list`,
          method: 'GET',
        },
      },
      isExtensionField && {
        name: 'extendFieldId',
        type: 'string',
        bind: 'businessObjectField.extendFieldId',
      },
      isTenant &&
      isExtensionField && {
        name: 'inheritFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        dynamicProps: {
          required: () => isTenant && isExtensionField,
        },
        disabled: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
      },
      !isExtensionField && {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        dynamicProps: {
          required: () => !isExtensionField,
        },
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
      },
      {
        name: 'helpText',
        type: 'object',
        ignore: 'always',
        label: (
          <span>
            {intl.get('hmde.bo.field.helpText').d('帮助文本')}
            <Tooltip
              placement="top"
              title={intl
                .get('hmde.bo.field.helpText.helpText')
                .d('当用户悬停在此字段旁的问号图标时，会在表单字段下方显示该提示文本内容')}
            >
              <Icon type="help_outline" style={{ fontSize: 16 }} />
            </Tooltip>
          </span>
        ),
        bind: 'attributeJson.helpText',
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get('hmde.common.label.remark').d('描述'),
      },
      {
        name: 'maxLength',
        type: 'number',
        label: intl.get('hmde.common.label.maxLength').d('最大长度'),
        required: true,
        step: 1,
        min: 1,
        max: 4000,
        defaultValue: 240,
      },
      {
        name: 'optionSettings',
        type: 'string',
        label: intl.get('hmde.bo.field.ruleFormat').d('规则格式'),
        defaultValue: '_createCodeRule',
        bind: 'attributeJson.optionSettings',
      },
      {
        name: 'optionTitle',
        type: 'string',
        ignore: 'always',
        label: intl.get('hmde.bo.field.ruleFormat').d('规则格式'),
        defaultValue: '已有编码规则',
      },
      {
        name: 'readOnlyFlag',
        type: 'boolean',
        ignore: 'always',
        defaultValue: true,
        label: intl.get('hmde.bo.field.readOnlyFlag').d('字段只读'),
        bind: 'attributeJson.readOnlyFlag',
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        trueValue: true,
        falseValue: false,
        defaultValue: 0,
        label: intl.get('hmde.bo.field.requiredFlag').d('字段必输'),
        required: true,
        // dynamicProps: {
        //   readOnly: ({ record }) => {
        //     // 租户编辑平台标准字段必输时如果是必输不能改成非必输
        //     if (isTenantRoleLevel() && isEditMode && !isExtensionField) {
        //       return !record.get('requiredFlagUpdated') && record.get('tenantRequiredControl');
        //     }
        //     return false;
        //   },
        // },
      },
      {
        name: 'exportableFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.field.exportableFlag').d('是否可导出'),
        defaultValue: true,
        required: true,
        transformResponse: value => {
          if (value === undefined || value === null) {
            return true;
          } else {
            return value;
          }
        },
      },
    ],
    events: {
      update: ({ name, value, record }) => {
        if (name === 'businessObjectField' && value) {
          record.set('inheritFieldCode', value.extendFieldCode);
          record.set('remark', value.remark);
          if (value?.maxLength) {
            record.set('maxLength', value?.maxLength);
            record.getField('maxLength').set('validator', recordValue => {
              if (recordValue || recordValue === 0) {
                if (recordValue > value?.maxLength || recordValue < 1) {
                  return intl
                    .get('hmde.bo.validation.range.minmax', { name: `1 - ${value?.maxLength}` })
                    .d(`可填范围为 1-${value?.maxLength}`);
                }
              }
            });
          }
        }
      },
      load: ({ dataSet }) => {
        if (!dataSet.current.get('maxLength')) {
          dataSet.current.set('maxLength', 240);
        }
        const data = dataSet?.current?.toData();
        if (isExtensionField && data?.extendFieldMaxLength) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.getField('maxLength')?.set('validator', recordValue => {
            if (recordValue || recordValue === 0) {
              if (recordValue > data?.extendFieldMaxLength || recordValue < 1) {
                return intl
                  .get('hmde.bo.validation.range.minmax', { name: `1-${data?.extendFieldMaxLength}` })
                  .d(`可填范围为 1-${data?.extendFieldMaxLength}`);
              }
            }
          });
        }
        if (!isExtensionField && isTenant && isEditMode) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.getField('maxLength')?.set('validator', recordValue => {
            if (recordValue || recordValue === 0) {
              if (recordValue > data?.platformFieldMaxLength || recordValue < 1) {
                return intl
                  .get('hmde.bo.validation.range.minmax', { name: `1-${data?.platformFieldMaxLength}` })
                  .d(`可填范围为 1-${data?.platformFieldMaxLength}`);
              }
            }
          });
        }
      },
    },
    children: {
      // 已有编码规则
      ruleListDS: new DataSet({
        ...commonListConfig(),
      } as DataSetProps),
      // 新建编码规则form表单
      ruleFormDS: new DataSet({
        ...createFormConfig(),
      } as DataSetProps),
    },
  } as DataSetProps);
