import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { APPROVAL_TYPE, MSG_SEND_CONFIG, DEF_WORKFLOW } from '@/constants/CodeConstants';
import { APPROVAL_TYPE_CONSTANTS } from '@/constants/constants';
import getLang from '@/langs/basicConfigLang';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const applyConfigFormDS = (props) => {
  const { onFieldUpdate = () => {}, onLoad = () => {} } = props;
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'approvalType',
        label: getLang('APPROVAL_TYPE'),
        type: 'string',
        required: true,
        lookupCode: APPROVAL_TYPE,
        defaultValue: APPROVAL_TYPE_CONSTANTS.FUNCTION,
      },
      {
        name: 'workflowLov',
        label: getLang('WORKFLOW'),
        type: 'object',
        ignore: 'always',
        lovCode: DEF_WORKFLOW,
        lovPara: {
          tenantId: organizationId,
        },
        dynamicProps: {
          required: ({ record }) =>
            record?.get('approvalType') === APPROVAL_TYPE_CONSTANTS.WORKFLOW,
        },
      },
      {
        name: 'flowCode',
        type: 'string',
        bind: 'workflowLov.flowCode',
      },
      {
        name: 'flowName',
        type: 'string',
        bind: 'workflowLov.flowName',
      },
      {
        name: 'messageLov',
        label: getLang('SEND_MESSAGE_CONFIG'),
        type: 'object',
        ignore: 'always',
        lovCode: MSG_SEND_CONFIG,
        lovPara: {
          tenantId: organizationId,
        },
        dynamicProps: {
          required: ({ record }) =>
            record?.get('approvalType') === APPROVAL_TYPE_CONSTANTS.FUNCTION,
        },
      },
      {
        name: 'messageServerCode',
        type: 'string',
        bind: 'messageLov.messageCode',
      },
      {
        name: 'messageServerName',
        type: 'string',
        bind: 'messageLov.messageName',
      },
    ],
    transport: {
      read: () => ({
        url: `${HZERO_HITF}/v1${level}/perm-apply-configs`,
        method: 'GET',
      }),
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-apply-configs`,
          method: 'POST',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/perm-apply-configs`,
          method: 'POST',
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

export { applyConfigFormDS };
