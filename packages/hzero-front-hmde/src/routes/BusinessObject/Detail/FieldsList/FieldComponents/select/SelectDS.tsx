import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

import { HZERO_HPFM, HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataToJSON } from 'choerodon-ui/pro/lib/data-set/enum';

const isTenantRole: boolean = isTenantRoleLevel();
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

export default (
  isExtensionField,
  type,
  isEditMode,
  businessObjectId,
  isFromDomain,
  customPrimaryKeyCode,
  disabledCustomOptionSetting
  // standardFlag
) =>
  ({
    autoCreate: true,
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
        // 回显attributeJson时 对应绑定了此对象的字段自动回显
        name: 'attributeJson',
        type: 'object',
      },
      !isFromDomain &&
      isExtensionField && {
        name: 'inheritFieldName',
        type: 'intl',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        required: true,
        maxLength: 300,
      },
      !isFromDomain &&
      !isExtensionField && {
        name: 'businessObjectFieldName',
        type: 'intl',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        required: true,
        maxLength: 300,
      },
      isFromDomain && {
        name: 'templateFieldName',
        type: 'intl',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        required: true,
        maxLength: 300,
      },
      isExtensionField && {
        name: 'businessObjectField',
        label: intl.get('hmde.bo.field.extendField.select').d('选择扩展字段'),
        type: 'object',
        required: true,
        unique: true,
        ignore: 'always',
        lovCode: 'HMDE.EXTEND_FIELD',
        lovPara: {
          componentType: type,
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
        ignore: 'never',
        bind: 'businessObjectField.extendFieldId',
      },
      !isFromDomain &&
      isExtensionField && {
        name: 'inheritFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        required: true,
        disabled: isTenantRole,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
      },
      !isFromDomain &&
      !isExtensionField && {
        name: 'businessObjectFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        required: true,
        validator: value => _validator(value, customPrimaryKeyCode, isExtensionField),
      },
      isFromDomain && {
        name: 'templateFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        required: true,
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
        ignore: 'always',
        label: intl.get('hmde.bo.field.optionSettings').d('选项设置'),
        defaultValue: '_valueList',
        transformResponse: (_, object) => {
          return (object?.lovCode || disabledCustomOptionSetting) ? '_valueList' : '_custom';
        },
        bind: 'attributeJson.optionSettings',
      },
      {
        name: 'optionDirection',
        type: 'string',
        ignore: 'always',
        label: intl.get('hmde.bo.field.optionDirection').d('选项排序方式'),
        defaultValue: 'horizontal',
        bind: 'attributeJson.optionDirection',
        transformResponse: value => {
          if (value === undefined || value === null) {
            return 'horizontal';
          } else {
            return value;
          }
        },
      },
      {
        name: 'valueList',
        type: 'object',
        label: intl.get('hmde.bo.field.valueList').d('值集'),
        ignore: 'always',
        lovCode: isTenantRole ? 'HPFM.LOV_IDP' : 'HPFM.SITE.LOV_IDP',
        valueField: 'lovCode',
        textField: 'lovName',
        dynamicProps: {
          required: ({ record }) => record.get('optionSettings') === '_valueList',
        },
        lovQueryAxiosConfig: function lovQueryAxiosConfig(_, __, { params }) {
          return {
            url: `${lowcodeOrganizationURL({ route: HZERO_HPFM })}/lov-headers`,
            method: 'GET',
            params: {
              ...params,
              enabledFlag: 1,
              tenantId: getCurrentOrganizationId(),
            },
          };
        },
      },
      {
        name: 'lovCode',
        type: 'string',
        bind: 'valueList.lovCode',
        transformRequest: (value, record) => {
          if (record.get('optionSettings') === '_valueList') {
            return value;
          } else {
            return undefined;
          }
        },
      },
      {
        name: 'lovName',
        type: 'string',
        bind: 'valueList.lovName',
        transformRequest: (value, record) => {
          if (record.get('optionSettings') === '_valueList') {
            return value;
          } else {
            return undefined;
          }
        },
      },
      {
        name: 'customOptionList',
        type: 'object',
        transformRequest: (value, record) => {
          if (record.get('optionSettings') === '_valueList') {
            return undefined;
          } else {
            return value;
          }
        },
        bind: 'attributeJson.customOptionList',
      },
      {
        name: 'defaultValue',
        type: 'string',
        label: intl.get('hmde.bo.field.defaultValue').d('默认值'),
        transformRequest: value => {
          if (Array.isArray(value)) {
            return value.join(',');
          } else {
            return value;
          }
        },
        transformResponse: (value = '', object) => {
          const { componentType } = object || {};
          if (componentType === 'MULTIPLE_SELECT' || componentType === 'CHECKBOX') {
            return `${value}`.split(',');
          } else {
            return value;
          }
        },
      },
      {
        name: 'readOnlyFlag',
        type: 'boolean',
        ignore: 'always',
        trueValue: true,
        falseValue: false,
        defaultValue: 0,
        label: intl.get('hmde.bo.field.readOnlyFlag').d('字段只读'),
        bind: 'attributeJson.readOnlyFlag',
        transformResponse: value => {
          if (value === undefined || value === null) {
            return false;
          } else {
            return value;
          }
        },
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
    ].filter(Boolean),
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
                    .get('hmde.bo.validation.range.minmax', { name: `1-${value?.maxLength}` })
                    .d(`可填范围为 1-${value?.maxLength}`);
                }
              }
            });
          }
        }
      },
      load: ({ dataSet }) => {
        if (isTenantRoleLevel() && isEditMode && !isExtensionField) {
          // eslint-disable-next-line no-unused-expressions
          dataSet?.current?.set('tenantRequiredControl', dataSet?.current?.get('requiredFlag'));
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
        if (!isExtensionField && isTenantRole && isEditMode) {
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
      customOptionList: new DataSet({
        ...lovValuesDS(),
        events: {
          validate: async ({ dataSet, result }) => {
            const res = await result;
            if (!res && dataSet?.parent?.current?.set) {
              dataSet.parent.current.set('optionSettings', '_custom');
            }
          },
        },
      }),
    },
  } as DataSetProps);

export const lovValuesDS = () =>
  ({
    autoCreate: false,
    selection: false,
    dataToJSON: DataToJSON.normal,
    fields: [
      {
        label: intl.get('hmde.common.meaning').d('含义'),
        name: 'meaning',
        type: 'intl',
        required: true,
      },
      {
        label: intl.get('hmde.common.value').d('值'),
        name: 'value',
        type: 'string',
        unique: true,
        required: true,
      },
      {
        name: 'orderSeq',
        type: 'number',
        transformRequest: (value, record) => {
          return (record.index + 1) * 10;
        },
      },
      {
        name: '_tls',
        type: 'object',
        ignore: 'always',
        transformResponse: (value, object) => {
          if (value && Object.prototype.toString.call(value) === '[object Object]') {
            return value;
          } else {
            return {
              meaning: object.meaning,
            };
          }
        },
      },
    ],
  } as DataSetProps);

export const lovDefineDS = ({ businessObjectCode }) =>
  ({
    autoCreate: true,
    transport: {
      create: ({ data }) => ({
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/lov/create`,
        method: 'POST',
        data: data[0],
      }),
    },
    fields: [
      {
        label: intl.get('hmde.bo.field.valueList.code').d('值集编码'),
        name: 'lovCode',
        type: 'string',
        defaultValue: `${businessObjectCode?.toUpperCase?.() || ''}_LOV`,
        pattern: /^[A-Z0-9][A-Z0-9-_./]*$/,
        required: true,
      },
      {
        label: intl.get('hmde.bo.field.valueList.name').d('值集名称'),
        name: 'lovName',
        type: 'intl',
        required: true,
      },
      {
        name: 'lovTypeCode',
        type: 'string',
        defaultValue: 'IDP',
      },
      {
        name: 'lovValues',
        type: 'auto',
      },
    ],
  } as DataSetProps);
