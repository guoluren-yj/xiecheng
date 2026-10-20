import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDeployRecDSProps({ deployInfoId }) {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'targetEnv',
        type: 'string',
        required: true,
        label: intl.get('hpdm.deploy-rec.model.targetEnv').d('目标环境'),
        valueField: `environmentCode`,
        textField: `environmentName`,
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?page=0&size=2000`
            : `${HZERO_SRDM}/v1/application-envs?page=0&size=2000`,
          transformResponse(data) {
            let handledData;
            if (data) {
              handledData = data;
              if (typeof data === 'string') {
                handledData = JSON.parse(data);
              }
            }
            const filterData = handledData?.content?.filter((item) => item.enabledFlag === 1);
            return filterData;
          },
        }),
      },
      {
        name: 'targetEnvRead',
        type: 'string',
        bind: 'targetEnv',
        label: intl.get('hpdm.deploy-rec.model.targetEnv').d('目标环境'),
        valueField: `environmentCode`,
        textField: `environmentName`,
        lookupAxiosConfig: () => ({
          method: 'GET',
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/application-envs?page=0&size=2001`
            : `${HZERO_SRDM}/v1/application-envs?page=0&size=2001`,
        }),
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('hpdm.deploy-rec.model.operator').d('操作人员'),
      },
      {
        name: 'enabledFlag',
        label: intl.get('hpdm.deploy-rec.model.enabledFlag').d('是否启用'),
        type: 'string',
        required: true,
        lookupCode: 'HPDM.Y_N_FLAG',
        defaultValue: 1,
      },
      {
        name: 'processStatus',
        label: intl.get('hpdm.deploy-rec.model.processStatus').d('处理状态'),
        type: 'string',
        lookupCode: 'HPDM.PROCESS_STATUS',
      },
      {
        name: 'processDate',
        type: 'dateTime',
        label: intl.get('hpdm.deploy-rec.model.processDate').d('处理日期'),
        disabled: true,
      },
      {
        type: 'string',
        name: 'comments',
        label: intl.get('hpdm.deploy-rec.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'processMessage',
        label: intl.get('hpdm.deploy-rec.model.processMessage').d('处理消息'),
        disabled: true,
      },
    ],
    queryFields: [],
    transport: {
      read: () => {
        return {
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-recs?deployInfoId=${deployInfoId}`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-recs?deployInfoId=${deployInfoId}`,
          method: 'GET',
        };
      },
      submit: ({ data }) => {
        return {
          data,
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-recs/createAndUpdate`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-recs/createAndUpdate`,
          method: 'POST',
        };
      },
    },
    events: {},
  };
}

export default getDeployRecDSProps;
