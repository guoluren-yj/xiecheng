/**
 * paramServiceDs
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 参数服务ds
export function getParamServiceDs() {
  return {
    fields: [
      {
        name: 'fullPathCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode').d('服务编码'),
        // required: true,
        format: 'uppercase',
        disabled: true,
      },
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.name').d('服务名称'),
        // required: true,
        disabled: true,
      },
      {
        name: 'modelObject',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.modelObject')
          .d('个性化数据模型'),
        // required: true,
        disabled: true,
        transformResponse: value => {
          return value ? value.toUpperCase() : '';
        },
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.description').d('服务描述'),
        // required: true,
        disabled: true,
      },
      {
        name: 'defaultRetMeaning',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.defaultRetMeaning')
          .d('默认执行规则'),
        // required: true,
        disabled: true,
      },
    ],
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/cnf/detail`,
        method: 'GET',
      },
    },
  };
}

// 参数服务表格 ds
export function getParamTableDs() {
  return {
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramName').d('字段名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLabel').d('字段描述'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLookupCode').d('值集'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramLovCode').d('值集视图'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramTextField').d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.paramValueField').d('存储值'),
      },
    ],
    paging: false,
    selection: false,
  };
}

export function getReturnValueTableDs() {
  return {
    fields: [
      {
        name: 'name',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.returnValueName').d('参数名'),
      },
      {
        name: 'type',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.returnValueType').d('类型'),
      },
      {
        name: 'label',
        type: 'string',
        label: intl.get('spfm.rulesDefinition.model.rulesDefinition.returnValueLabel').d('名称'),
      },
      {
        name: 'lookupCode',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.returnValueLookupCode')
          .d('值集Code'),
      },
      {
        name: 'lovCode',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.returnValueLovCode')
          .d('Lov值集Code'),
      },
      {
        name: 'textField',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.returnValueTextField')
          .d('显示值'),
      },
      {
        name: 'valueField',
        type: 'string',
        label: intl
          .get('spfm.rulesDefinition.model.rulesDefinition.valueFieldValueField')
          .d('存储值'),
      },
    ],
    paging: false,
    selection: false,
  };
}

export function getReturnFieldTableDs() {
  return {
    selection: false,
    paging: false,
  };
}
