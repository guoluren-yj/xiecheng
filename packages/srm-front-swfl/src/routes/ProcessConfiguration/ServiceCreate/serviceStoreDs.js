import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const isSiteFlag = !isTenantRoleLevel();
export function getServiceApprovalGroupForm() {
  return {
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.serviceDefinition.approver').d('审批人选择'),
        name: 'approver',
        type: 'string',
        required: true,
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.serviceDefinition.conditionColumn')
          .d('条件列选择'),
        name: 'conditionColumn',
        type: 'string',
      },
    ],
  };
}

export function getServiceExpressionTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.param.orderNumber').d('序号'),
        name: 'parameterName',
        type: 'number',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.leftParameterValue').d('左参数值'),
        name: 'parameterValue',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.parameterDescription').d('左参数名称'),
        name: 'parameterDescription',
        type: 'string',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.leftParameterSource').d('左参数来源'),
        name: 'parameterSourceMeaning',
        type: 'string',
        lookupCode: 'HWFP.SERVICE.PARAMETER_SOURCE',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.operator').d('操作符'),
        name: 'operator',
        type: 'string',
        lookupCode: 'HWFP.PROCESS_OPERATOR',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.rightParameterValue').d('右参数值'),
        name: 'rightParameterValue',
        type: 'string',
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.param.rightParameterDescription')
          .d('右参数名称'),
        name: 'rightParameterDescription',
        type: 'string',
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.service.rightParameterSource')
          .d('右参数来源'),
        name: 'rightParameterSourceMeaning',
        type: 'string',
        lookupCode: 'HWFP.SERVICE.PARAMETER_SOURCE',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
  };
}

export function getServiceExpressionForm() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.param.orderNumber').d('序号'),
        name: 'parameterName',
        type: 'number',
        min: 0,
        required: true,
        computedProps: {
          disabled: ({ record }) => record.get('parameterId'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.leftParameterValue').d('左参数值'),
        name: 'parameterValueObj',
        required: true,
        dynamicProps: ({ record }) => {
          if (record.get('parameterSource') === 'VARIABLE') {
            return {
              type: 'object',
              lovCode: isSiteFlag
                ? 'HWFP.PROCESS_VARIABLE_LOV_VIEW.SITE'
                : 'HWFP.PROCESS_VARIABLE_LOV_VIEW',
              textField: 'variableName',
              valueField: 'variableName',
            };
          } else {
            return {
              type: 'string',
            };
          }
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.leftParameterValue').d('左参数值'),
        name: 'parameterValue',
        type: 'string',
        computedProps: {
          bind: ({ record }) => {
            const parameterValueObj = record.get('parameterValueObj');
            if (parameterValueObj && parameterValueObj.variableName) {
              return 'parameterValueObj.variableName';
            } else {
              return 'parameterValueObj';
            }
          },
          disabled: ({ record }) => !record.get('parameterSourceMeaning'),
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.parameterDescription').d('左参数名称'),
        name: 'parameterDescription',
        type: 'string',
        disabled: true,
        computedProps: {
          bind: ({ record }) => {
            const parameterValueObj = record.get('parameterValueObj');
            if (parameterValueObj && parameterValueObj.description) {
              return 'parameterValueObj.description';
            }
          },
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.leftParameterSource').d('左参数来源'),
        name: 'parameterSourceMeaningObj',
        type: 'object',
        lookupCode: 'HWFP.SERVICE.PARAMETER_SOURCE',
        required: true,
      },
      {
        name: 'parameterSource',
        type: 'string',
        bind: 'parameterSourceMeaningObj.value',
      },
      {
        name: 'parameterSourceMeaning',
        type: 'string',
        bind: 'parameterSourceMeaningObj.meaning',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.operator').d('操作符'),
        name: 'operator',
        type: 'string',
        lookupCode: 'HWFP.PROCESS_OPERATOR',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.rightParameterValue').d('右参数值'),
        name: 'rightParameterValueObj',
        dynamicProps: ({ record }) => {
          if (record.get('rightParameterSource') === 'VARIABLE') {
            return {
              type: 'object',
              lovCode: isSiteFlag
                ? 'HWFP.PROCESS_VARIABLE_LOV_VIEW.SITE'
                : 'HWFP.PROCESS_VARIABLE_LOV_VIEW',
              textField: 'variableName',
              valueField: 'variableName',
            };
          } else {
            return {
              type: 'string',
              disabled: !record.get('rightParameterSource'),
              required:
                record.get('operator') &&
                ['CONTAIN', 'NOT_CONTAIN'].includes(record.get('operator')),
            };
          }
        },
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.rightParameterValue').d('右参数值'),
        name: 'rightParameterValue',
        type: 'string',
        computedProps: {
          bind: ({ record }) => {
            const rightParameterValueObj = record.get('rightParameterValueObj');
            if (rightParameterValueObj && rightParameterValueObj.variableName) {
              return 'rightParameterValueObj.variableName';
            } else {
              return 'rightParameterValueObj';
            }
          },
        },
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.param.rightParameterDescription')
          .d('右参数名称'),
        name: 'rightParameterDescription',
        type: 'string',
        disabled: true,
        computedProps: {
          bind: ({ record }) => {
            const rightParameterValueObj = record.get('rightParameterValueObj');
            if (rightParameterValueObj && rightParameterValueObj.description) {
              return 'rightParameterValueObj.description';
            }
          },
        },
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.service.rightParameterSource')
          .d('右参数来源'),
        name: 'rightParameterSourceMeaningObj',
        type: 'object',
        lookupCode: 'HWFP.SERVICE.PARAMETER_SOURCE',
        computedProps: {
          disabled: ({ record }) =>
            !record.get('operator') || ['CONTAIN', 'NOT_CONTAIN'].includes(record.get('operator')),
        },
      },
      {
        name: 'rightParameterSource',
        type: 'string',
        bind: 'rightParameterSourceMeaningObj.value',
      },
      {
        name: 'rightParameterSourceMeaning',
        type: 'string',
        bind: 'rightParameterSourceMeaningObj.meaning',
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'parameterSourceMeaningObj') {
          record.set('parameterValue', null);
          record.set('parameterDescription', null);
          record.set('parameterValueObj', null);
        } else if (name === 'rightParameterSourceMeaningObj') {
          record.set('rightParameterValue', null);
          record.set('rightParameterDescription', null);
          record.set('rightParameterValueObj', null);
        } else if (name === 'operator') {
          record.set('rightParameterValue', null);
          record.set('rightParameterDescription', null);
          record.set('rightParameterValueObj', null);
          record.set('rightParameterSourceMeaningObj', null);
          if (value && ['CONTAIN', 'NOT_CONTAIN'].includes(value)) {
            record.set('rightParameterSource', 'CONSTANT');
            record.set('rightParameterSourceMeaning', '常量');
          }
        }
      },
    },
  };
}

export function getServiceScriptTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.scriptParam.name').d('参数编码'),
        name: 'parameterName',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.scriptParam.description').d('参数名称'),
        name: 'parameterDescription',
        type: 'string',
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.scriptParam.scriptParameterType')
          .d('参数类型'),
        name: 'scriptParameterType',
        type: 'string',
        defaultValue: 'constant',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.scriptParam.value').d('参数值'),
        name: 'parameterValue',
        type: 'string',
        required: true,
        dynamicProps: {
          lovCode: ({ record }) => {
            return record && record.get('scriptParameterType') === 'DYNAMIC'
              ? 'HPFM.LOV.VIEW.ORG'
              : undefined;
          },
        },
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
  };
}

export function getServiceParamsTable() {
  return {
    autoCreate: false,
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        label: intl.get('hwfp.serviceDefinition.model.param.parameterName').d('参数名称'),
        name: 'parameterName',
        type: 'string',
        disabled: true,
      },
      {
        label: intl
          .get('hwfp.serviceDefinition.model.service.interfaceParameterType')
          .d('参数类型'),
        name: 'interfaceParameterTypeMeaning',
        type: 'string',
        disabled: true,
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.defaultValue').d('默认值'),
        name: 'defaultValue',
        type: 'string',
        disabled: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.parameterValue').d('参数值'),
        name: 'parameterValue',
        type: 'string',
        required: true,
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.parameterSource').d('参数来源'),
        name: 'parameterSourceMeaningObj',
        lookupCode: 'HWFP.SERVICE.PARAMETER_SOURCE',
        required: true,
        type: 'object',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.parameterSource').d('参数来源'),
        name: 'parameterSource',
        type: 'string',
        bind: 'parameterSourceMeaningObj.value',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.service.parameterSource').d('参数来源'),
        name: 'parameterSourceMeaning',
        type: 'string',
        bind: 'parameterSourceMeaningObj.meaning',
      },
      {
        label: intl.get('hwfp.serviceDefinition.model.param.description').d('参数描述'),
        name: 'description',
        type: 'string',
        disabled: true,
      },
      {
        label: intl.get('hzero.common.button.action').d('操作'),
        name: 'option',
        type: 'string',
      },
    ],
  };
}
