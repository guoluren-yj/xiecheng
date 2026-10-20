import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDeployInfoDSProps({ deployInfoId }) {
  return {
    autoQuery: true,
    fields: [
      {
        type: 'string',
        name: 'deployNum',
        disabled: true,
        label: intl.get('hpdm.deploy-rec.model.deployNum').d('发版批次号'),
      },
      {
        type: 'date',
        name: 'deployDate',
        disabled: true,
        label: intl.get('hpdm.deploy-rec.model.deployDate').d('发版时间'),
      },
      {
        type: 'string',
        name: 'deployDesc',
        disabled: true,
        label: intl.get('hpdm.deploy-rec.model.deployDesc').d('发版描述'),
      },
      {
        type: 'string',
        name: 'comments',
        disabled: true,
        label: intl.get('hpdm.deploy-rec.model.comments').d('备注'),
      },
      {
        type: 'string',
        name: 'processStatus',
        lookupCode: 'HPDM.PROCESS_STATUS',
        disabled: true,
        label: intl.get('hpdm.deploy-rec.model.processStatus').d('处理状态'),
      },
      {
        type: 'string',
        name: 'enabledFlag',
        disabled: true,
        lookupCode: 'HPDM.Y_N_FLAG',
        label: intl.get('hpdm.deploy-rec.model.enabledFlag').d('是否启用'),
      },
    ],
    queryFields: [],
    transport: {
      read: () => {
        return {
          url: isTenantRoleLevel()
            ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/${deployInfoId}`
            : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/${deployInfoId}`,
          method: 'get',
        };
      },
    },
    events: {},
  };
}

export default getDeployInfoDSProps;
