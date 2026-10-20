import { Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import DataSet, { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import React from 'react';
import { Tooltip } from 'choerodon-ui/pro/lib';
import { HZERO_HMDE, HZERO_HPFM } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

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

export default (isExtensionField, isFromDomain, customPrimaryKeyCode) =>
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
        name: 'attributeJson',
        type: 'object',
      },
      !isFromDomain &&
      isTenant &&
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
      !isFromDomain &&
      isTenant &&
      isExtensionField && {
        name: 'inheritFieldCode',
        type: 'string',
        label: intl.get('hmde.bo.field.code').d('字段编码'),
        required: true,
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
        label: (
          <span>
            {intl.get('hmde.bo.field.help').d('帮助文本')}
            <Tooltip
              placement="top"
              title={intl
                .get('hmde.bo.field.help.help')
                .d('当用户悬停在此字段旁的问号图标时，会在表单字段下方显示该提示文本内容')}
            >
              <Icon type="help_outline" style={{ fontSize: 16 }} />
            </Tooltip>
          </span>
        ),
        bind: 'attributeJson.helpText',
        ignore: 'always',
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get('hmde.common.label.remark').d('描述'),
      },
      {
        name: 'resultType',
        type: 'string',
        label: intl.get('hmde.bo.field.resultType').d('返回值类型'),
        required: true,
        options: new DataSet({
          data: [
            {
              value: 'Long',
              meaning: intl.get('hmde.bo.field.componentType.number').d('整数'),
            },
            {
              value: 'BigDecimal',
              meaning: intl.get('hmde.bo.field.componentType.float').d('浮点数'),
            },
            {
              value: 'String',
              meaning: intl.get('hmde.bo.field.componentType.text').d('文本'),
            },
            {
              value: 'LocalDate',
              meaning: intl.get('hmde.bo.field.componentType.date').d('日期'),
            },
            {
              value: 'ZonedDateTime',
              meaning: intl.get('hmde.bo.field.componentType.dateTime').d('日期时间'),
            },
            {
              value: 'Boolean',
              meaning: intl.get('hmde.bo.field.componentType.boolean').d('布尔值'),
            },
          ],
        }),
        bind: 'attributeJson.resultType',
        ignore: 'always',
      },
      {
        name: 'digitalAccuracy',
        type: 'number',
        label: intl.get('hmde.bo.field.precision').d('精度'),
        max: 5,
        min: 0,
        step: 1,
      },
      {
        name: 'thousandsFlag',
        type: 'boolean',
        label: intl.get('hmde.bo.field.thousands').d('显示千分位'),
        trueValue: true,
        falseValue: false,
        defaultValue: false,
        bind: 'attributeJson.thousandsFlag',
        transformResponse: value => {
          if (value === undefined || value === null) {
            return false;
          } else {
            return value;
          }
        },
        ignore: 'always',
      },
      {
        name: 'displayFormat',
        type: 'string',
        label: intl.get('hmde.bo.field.displayFormat').d('显示格式'),
        options: new DataSet({
          data: [
            {
              meaning: intl.get('hmde.common.format.yyyy-mm-dd').d('年-月-日（YYYY-MM-DD）'),
              value: 'YYYY-MM-DD',
            },
            {
              value: 'MM-DD',
              meaning: intl.get('hmde.common.format.mmdd').d('月-日（MM-DD）'),
            },
            {
              value: 'DD',
              meaning: intl.get('hmde.common.format.dd').d('日（DD）'),
            },
          ],
        }),
        bind: 'attributeJson.displayFormat',
        ignore: 'always',
      },
      {
        name: 'formula',
        type: 'string',
        label: intl.get('hmde.bo.field.formula').d('公式'),
        // required: true,
      },
      {
        name: 'requiredFlag',
        type: 'boolean',
        defaultValue: false,
        transformResponse: value => {
          if (value === undefined || value === null) {
            return true;
          } else {
            return value;
          }
        },
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
      {
        name: 'configLov',
        label: intl.get('hmde.common.message.needConfigLov').d('是否配值集'),
        type: 'boolean',
        dynamicProps: {
          disabled: () => isTenant && !isExtensionField,
        },
      },
      {
        name: 'valueList',
        type: 'object',
        label: intl.get('hmde.bo.field.valueList').d('值集'),
        ignore: 'always',
        lovCode: isTenant ? 'HPFM.LOV_IDP' : 'HPFM.SITE.LOV_IDP',
        valueField: 'lovCode',
        textField: 'lovName',
        dynamicProps: {
          disabled: ({ record }) => {
            return (isTenant && !isExtensionField) || !record.get('configLov')
          },
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
      },
      {
        name: 'timeZoneConvertFlag',
        label: intl.get('hmde.bo.view.message.timeZoneConvertFlag').d('是否时区转换'),
        type: 'boolean',
        transformRequest: (value) => !!value,
      },
    ].filter(Boolean),
  } as DataSetProps);
