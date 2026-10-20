import React from 'react';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { ALERT_CODE, LOG_RECORD_TYPE, SITE_USE_CASE, USE_CASE } from '@/constants/CodeConstants';
import getLang from '@/langs/serviceLang';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const basicFormDS = (props) => {
  const { interfaceId, onFieldUpdate = () => {}, onLoad = () => {} } = props;
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    autoCreate: true,
    fields: [
      {
        name: 'invokeDetailsFlag',
        label: getLang('INVOKE_DETAIL'),
        type: 'string',
        lookupCode: LOG_RECORD_TYPE,
      },
      {
        name: 'healthCheckFlag',
        label: getLang('HEALTH_CHECK_FLAG'),
        type: 'boolean',
        defaultValue: true,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'checkUsecaseLov',
        label: getLang('CHECK_USECASE'),
        type: 'object',
        ignore: 'always',
        lovCode: isTenantRoleLevel() ? USE_CASE : SITE_USE_CASE,
        lovPara: {
          organizationId,
          interfaceId,
        },
        dynamicProps: {
          required: ({ record }) => record?.get('healthCheckFlag') === 1,
        },
        lovQueryUrl: `${HZERO_HITF}/v1/${interfaceId}/usecases?usecaseType=HEALTH-CHECK`,
      },
      {
        name: 'checkUsecaseId',
        type: 'string',
        bind: 'checkUsecaseLov.interfaceUsecaseId',
      },
      {
        name: 'checkUsecaseName',
        type: 'string',
        bind: 'checkUsecaseLov.usecaseName',
      },
      {
        name: 'checkRoundRobin',
        label: (
          <QuestionPopover text={getLang('CHECK_CYCLE')} message={getLang('CHECK_CYCLE_TIP')} />
        ),
        type: 'number',
        step: 5,
        min: 5,
        dynamicProps: {
          required: ({ record }) => record?.get('healthCheckFlag') === 1,
        },
      },
      {
        name: 'checkPeriod',
        label: (
          <QuestionPopover text={getLang('CHECK_PERIOD')} message={getLang('CHECK_PERIOD_TIP')} />
        ),
        type: 'number',
        step: 5,
        min: 5,
        dynamicProps: {
          required: ({ record }) => record?.get('healthCheckFlag') === 1,
        },
      },
      {
        name: 'checkThreshold',
        label: (
          <QuestionPopover
            text={getLang('CHECK_THRESHOLD')}
            message={getLang('CHECK_THRESHOLD_TIP')}
          />
        ),
        type: 'number',
        step: 5,
        min: 0,
        dynamicProps: {
          required: ({ record }) => record?.get('healthCheckFlag') === 1,
        },
      },
      {
        name: 'checkWarningMsgTplLov',
        label: getLang('CHECK_WARNING_CODE'),
        type: 'object',
        ignore: 'always',
        lovCode: ALERT_CODE,
        dynamicProps: {
          required: ({ record }) => record?.get('healthCheckFlag') === 1,
        },
      },
      {
        name: 'checkWarningMsgTplCode',
        type: 'string',
        bind: 'checkWarningMsgTplLov.alertCode',
      },
      {
        name: 'alertLov',
        label: getLang('ALERT_CODE'),
        type: 'object',
        ignore: 'always',
        lovCode: ALERT_CODE,
      },
      {
        name: 'alertCode',
        type: 'string',
        bind: 'alertLov.alertCode',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/monitor`,
          method: 'GET',
        };
      },
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/monitor`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        const { interfaceMonitorId } = data[0];
        return {
          url: `${HZERO_HITF}/v1${level}/${interfaceId}/monitor/${interfaceMonitorId}`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
    events: {
      update: onFieldUpdate,
      load: onLoad,
    },
  };
};

export { basicFormDS };
