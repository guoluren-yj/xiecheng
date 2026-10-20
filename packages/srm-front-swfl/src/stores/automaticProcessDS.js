import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import moment from 'moment';
import intl from 'utils/intl';
import { omit, isEmpty, isNil } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getCheckDelegateMessage } from '@/utils/util';

const tenantId = getCurrentOrganizationId();
const dateFormat = `YYYY-MM-DD HH:mm`;
// 请求API前缀
const prefix = `${HZERO_HWFP}/v1/${tenantId}`;

// 列表页-查询表单
export const listFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'processKey',
      type: 'string',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.processKey').d('流程编码'),
    },
    {
      name: 'processName',
      type: 'string',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.processName').d('流程名称'),
    },
  ],
});

// 列表页-表格
export const listTableDS = () => ({
  fields: [
    {
      name: 'automaticProcessStatus',
      lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
      label: intl
        .get('hwfp.automaticProcess.model.automaticProcess.automaticProcessStatus')
        .d('状态'),
    },
    {
      name: 'processKey',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.processKey').d('流程编码'),
    },
    {
      name: 'processName',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.processName').d('流程名称'),
    },
    {
      name: 'processConditionMeaning',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.condition').d('处理条件'),
    },
    {
      name: 'conditionDetail',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.conditionInfo').d('条件明细'),
    },
    {
      name: 'processRuleMeaning',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.rule').d('处理规则'),
    },
    {
      name: 'processAction',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.action').d('处理动作'),
    },
    {
      name: 'enabledFlag',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.status').d('状态'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const query = filterNullValueObject(params);
      const { queryParams = {} } = data;
      return {
        url: `${prefix}/automatic-process`,
        method: 'GET',
        data: { ...query, ...queryParams },
      };
    },
  },
});

// 自动转交
export const delegateFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'delegateStartDate',
      type: 'dateTime',
      label: intl.get('hwfp.delegate.view.message.delegateStartDate').d('转交开始日期'),
      format: dateFormat,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('delegateEndDate') || record.get('delegateUserLov');
        },
      },
    },
    {
      name: 'delegateEndDate',
      type: 'dateTime',
      label: intl.get('hwfp.delegate.view.message.delegateEndDate').d('转交截止日期'),
      format: dateFormat,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('delegateStartDate') || record.get('delegateUserLov');
        },
      },
    },
    {
      name: 'delegateUserLov',
      type: 'object',
      label: intl.get('hwfp.delegate.view.message.delegate').d('转交人'),
      lovCode: 'HWFP.EMPLOYEE',
      textField: 'textValue',
      lovPara: { tenantId: getCurrentOrganizationId(), enabledFlag: 1 },
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('delegateStartDate') || record.get('delegateEndDate');
        },
      },
      validator: (value) =>
        value && !isNil(value.employeeNum) ? getCheckDelegateMessage(value.employeeNum) : undefined,
    },
    {
      name: 'textValue',
      bind: 'delegateUserLov.textValue',
    },
    {
      name: 'delegateCode',
      bind: 'delegateUserLov.employeeNum',
    },
    {
      name: 'delegateName',
      bind: 'delegateUserLov.name',
    },
    {
      name: 'hisDelegateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          return (
            !record.get('delegateStartDate') &&
            !record.get('delegateEndDate') &&
            !record.get('delegateUserLov')
          );
        },
      },
    },
    {
      name: 'delegateStatus',
      label: intl.get('hwfp.common.model.apply.delegateStatus').d('转交配置状态'),
      lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
    },
  ],
  events: {
    update: ({ name, record }) => {
      const fieldNames = ['delegateStartDate', 'delegateEndDate', 'delegateUserLov'];
      if (fieldNames.includes(name)) {
        const { delegateStartDate, delegateEndDate, delegateUserLov } = record.get(fieldNames);
        if (!delegateStartDate && !delegateEndDate && !delegateUserLov) {
          record.set('hisDelegateFlag', 0);
        }
      }
    },
  },
});

// 自动处理规则-表格
export const processProcessTableDS = () => {
  return {
    fields: [
      {
        name: 'automaticProcessStatus',
        label: intl
          .get('hwfp.automaticProcess.view.message.automaticProcessStatus')
          .d('自动处理规则生效状态'),
        lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
      },
      {
        name: 'delegateStatus',
        label: intl
          .get('hwfp.automaticProcess.view.message.delegateStatus')
          .d('全局自动转交生效状态'),
        lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
      },
      {
        name: 'employeeName',
        label: intl.get('hwfp.common.model.apply.approver').d('审批人'),
      },
      {
        name: 'processKey',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.processKey').d('流程编码'),
      },
      {
        name: 'processName',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.processName').d('流程名称'),
      },
      {
        name: 'processConditionMeaning',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.condition').d('处理条件'),
      },
      {
        name: 'conditionDetail',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.conditionInfo').d('条件明细'),
      },
      {
        name: 'processRuleMeaning',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.rule').d('处理规则'),
      },
      {
        name: 'processAction',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.action').d('处理动作'),
      },
      {
        name: 'enabledFlag',
        label: intl.get('hwfp.automaticProcess.model.automaticProcess.status').d('状态'),
      },
    ],
    pageSize: 20,
    transport: {
      read: ({ data, params }) => {
        const query = filterNullValueObject(omit(params, ['oldTotalElements']));
        const { queryParams = {} } = data;
        return {
          url: `${prefix}/automatic-process/tenant/list`,
          method: 'GET',
          data: { ...query, ...queryParams },
        };
      },
    },
  };
};

// 自动处理规则-表单
export const processProcessFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'employeeLov',
      type: 'object',
      label: intl.get('hwfp.common.model.apply.approver').d('审批人'),
      lovCode: 'HWFP.EMPLOYEE',
      lovPara: { tenantId: getCurrentOrganizationId(), enabledFlag: 1 },
      ignore: 'always',
      required: true,
    },
    {
      name: 'employeeCode',
      bind: 'employeeLov.employeeNum',
    },
    {
      name: 'employeeName',
      bind: 'employeeLov.name',
    },
    {
      name: 'processKeyLov',
      type: 'object',
      label: intl.get('hwfp.common.model.process.define').d('流程定义'),
      lovPara: { tenantId: getCurrentOrganizationId() },
      lovCode: 'HWFP.PROCESS_DEFINITION',
      ignore: 'always',
      required: true,
    },
    {
      name: 'processKey',
      bind: 'processKeyLov.key',
    },
    {
      name: 'processName',
      bind: 'processKeyLov.name',
    },
    {
      name: 'delegateActId',
      label: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
      type: 'string',
      multiple: true,
      transformRequest: (value) => {
        return Array.isArray(value) ? value.join(',') : [];
      },
    },
    {
      name: 'processCondition',
      type: 'string',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.condition').d('处理条件'),
      required: true,
      lookupCode: 'HWFP.PROCESS_CONDITION',
      dynamicProps: {
        help: ({ record, name }) => {
          if (!record) {
            return undefined;
          }
          const value = record.get(name);
          if (value === 'FIXED_PERIOD') {
            return intl
              .get('hwfp.automaticProcess.view.help.fixedPeriod')
              .d('固定期间：用户收到待办会立刻自动同意或自动转交');
          }
          if (value === 'TIME_OUT') {
            return intl
              .get('hwfp.automaticProcess.view.help.timeout')
              .d(
                '超时时间：用户收到，定时任务执行没半小时执行一次，确定待办是否超过配置的“超时时间”，若超过待办则会按照处理规则制定待办的转交或者自动同意。'
              );
          }
          return undefined;
        },
      },
    },
    {
      name: 'processStartDate',
      type: 'dateTime',
      label: intl.get('hzero.common.startDate').d('开始时间'),
      format: DEFAULT_DATETIME_FORMAT,
      validator: (value, name, record) => {
        const isEdit = record && record.get('automaticId');
        const processEndDate = record && record.get('processEndDate');
        const processCondition = record && record.get('processCondition');
        if (!isEdit || record.status === 'update') {
          if (processCondition === 'FIXED_PERIOD' && value && value.isBefore(moment())) {
            return intl.get('hzero.common.startDate.notBeforeNow').d('开始时间不能早于当前时间');
          } if (processCondition === 'FIXED_PERIOD' && value && processEndDate && moment(value).isAfter(moment(processEndDate), 'day')) {
            return intl.get('hwfp.delegate.view.message.startDateAfterEndDate').d('开始日期不能晚于结束日期');
          }
        }
      },
    },
    {
      name: 'processEndDate',
      type: 'dateTime',
      label: intl.get('hzero.common.date.release.endTime').d('结束时间'),
      format: DEFAULT_DATETIME_FORMAT,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('processCondition') === 'FIXED_PERIOD';
        },
      },
      validator: (value, name, record) => {
        const processStartDate = record.get('processStartDate');
        if (value && processStartDate && moment(value).isBefore(moment(processStartDate), 'day')) {
          return intl.get('hwfp.delegate.view.message.endDateBeforeStartDate').d('结束日期不能早于开始日期');
        }
      },
    },
    {
      name: 'timeoutValue',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.timeoutValue').d('超时时间'),
      min: 0,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('processCondition') === 'TIME_OUT';
        },
      },
    },
    {
      name: 'timeoutUnit',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.timeoutUnit').d('超时单位'),
      lookupCode: 'HWFP.TIMEOUT_UNIT',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('processCondition') === 'TIME_OUT';
        },
      },
    },
    {
      name: 'processRule',
      type: 'string',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.rule').d('处理规则'),
      required: true,
      lookupCode: 'HWFP.PROCESS_RULE',
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.processRemark').d('处理意见'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('hzero.common.status.enable').d('启用'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'delegateLov',
      type: 'object',
      label: intl.get('hwfp.automaticProcess.model.automaticProcess.delegater').d('转交人'),
      lovCode: 'HWFP.EMPLOYEE',
      lovPara: { tenantId: getCurrentOrganizationId(), enabledFlag: 1 },
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('processRule') === 'AutoDelegate';
        },
      },
      validator: (value, name, record) => {
        if (record.get('processRule') === 'AutoDelegate' && value && !isNil(value.employeeNum)) {
          return getCheckDelegateMessage(value.employeeNum);
        }
      },
    },
    {
      name: 'delegateCode',
      bind: 'delegateLov.employeeNum',
    },
    {
      name: 'delegateName',
      bind: 'delegateLov.name',
    },
    {
      name: 'hisDelegateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (['processCondition', 'processRule'].includes(name)) {
        record.set('hisDelegateFlag', undefined);
      }
      // eslint-disable-next-line no-param-reassign
      record.status = 'update';
    },
  },
});

// 自动转交规则-表格
export const autoDelegateTableDS = () => {
  return {
    fields: [
      {
        name: 'employeeName',
        label: intl.get('hwfp.common.model.apply.approver').d('审批人'),
      },
      {
        name: 'delegateStartDate',
        label: intl.get('hwfp.delegate.view.message.delegateStartDate').d('转交开始日期'),
      },
      {
        name: 'delegateEndDate',
        label: intl.get('hwfp.delegate.view.message.delegateEndDate').d('转交截止日期'),
      },
      {
        name: 'delegateName',
        label: intl.get('hwfp.delegate.view.message.delegate').d('转交人'),
      },
      {
        name: 'delegateStatus',
        label: intl.get('hwfp.delegate.view.message.delegateStatus').d('生效状态'),
        lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
      },
    ],
    pageSize: 20,
    transport: {
      read: () => {
        return {
          url: `${prefix}/delegate/tenant/list`,
          method: 'GET',
        };
      },
    },
  };
};

// 自动转交规则-表单
export const autoDelegateFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'delegateStatus',
      label: intl.get('hwfp.delegate.view.message.delegateStatus').d('生效状态'),
      lookupCode: 'HWFP.AUTO_DELEGATE_CONFIG.STATUS',
    },
    {
      name: 'employeeLov',
      type: 'object',
      label: intl.get('hwfp.common.model.apply.approver').d('审批人'),
      lovCode: 'HWFP.EMPLOYEE',
      lovPara: { tenantId: getCurrentOrganizationId(), enabledFlag: 1 },
      required: true,
      ignore: 'always',
    },
    {
      name: 'employeeCode',
      bind: 'employeeLov.employeeNum',
    },
    {
      name: 'employeeName',
      bind: 'employeeLov.name',
    },
    {
      name: 'delegateStartDate',
      type: 'dateTime',
      label: intl.get('hwfp.delegate.view.message.delegateStartDate').d('转交开始日期'),
      format: dateFormat,
      // required: true,
      dynamicProps: {
        required: ({ record }) => {
          return !isEmpty(record.get('delegateEndDate')) || !isEmpty(record.get('delegateUserLov'));
        },
      },
      validator: (value, name, record) => {
        const isEdit = record && record.get('delegateId');
        const endDate = record.get('delegateEndDate');
        if (!isEdit || record.status === 'update') {
          if (value && value.isBefore(moment())) {
            return intl
              .get('hwfp.delegate.view.message.delegateStartDate.notBeforeNow')
              .d('转交开始日期不能早于当前日期');
          } if (value && endDate && moment(value).isAfter(moment(endDate), 'day')) {
            return intl.get('hwfp.delegate.view.message.startDateAfterEndDate').d('开始日期不能晚于结束日期');
          }
        }
      },
    },
    {
      name: 'delegateEndDate',
      type: 'dateTime',
      label: intl.get('hwfp.delegate.view.message.delegateEndDate').d('转交截止日期'),
      format: dateFormat,
      // required: true,
      dynamicProps: {
        required: ({ record }) => {
          return (
            !isEmpty(record.get('delegateStartDate')) || !isEmpty(record.get('delegateUserLov'))
          );
        },
      },
      validator: (value, name, record) => {
        const startDate = record.get('delegateStartDate');
        if (value && startDate && moment(value).isBefore(moment(startDate), 'day')) {
          return intl.get('hwfp.delegate.view.message.endDateBeforeStartDate').d('结束日期不能早于开始日期');
        }
      },
    },
    {
      name: 'delegateUserLov',
      type: 'object',
      label: intl.get('hwfp.delegate.view.message.delegate').d('转交人'),
      lovCode: 'HWFP.EMPLOYEE',
      lovPara: { tenantId: getCurrentOrganizationId(), enabledFlag: 1 },
      // required: true,
      dynamicProps: {
        required: ({ record }) => {
          return (
            !record.get('delegateId') ||
            !isEmpty(record.get('delegateStartDate')) ||
            !isEmpty(record.get('delegateEndDate'))
          );
        },
      },
      ignore: 'always',
      validator: (value) =>
        value && !isNil(value.employeeNum) ? getCheckDelegateMessage(value.employeeNum) : undefined,
    },
    {
      name: 'delegateCode',
      bind: 'delegateUserLov.employeeNum',
    },
    {
      name: 'delegateName',
      bind: 'delegateUserLov.name',
    },
    {
      name: 'hisDelegateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          return (
            !record.get('delegateStartDate') &&
            !record.get('delegateEndDate') &&
            !record.get('delegateUserLov')
          );
        },
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      const fieldNames = ['delegateStartDate', 'delegateEndDate', 'delegateUserLov'];
      if (fieldNames.includes(name)) {
        const { delegateStartDate, delegateEndDate, delegateUserLov } = record.get(fieldNames);
        if (!delegateStartDate && !delegateEndDate && !delegateUserLov) {
          record.set('hisDelegateFlag', 0);
        }
      }
      // eslint-disable-next-line no-param-reassign
      record.status = 'update';
    },
  },
});
