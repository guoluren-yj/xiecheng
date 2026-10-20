import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_SRDM } from '@/common/config';

const organizationId = getCurrentOrganizationId();

function getDeployDSProps() {
  return {
    fields: [
      {
        type: 'string',
        name: 'deployNum',
        label: intl.get('hpdm.data-distribute.model.deployNum').d('发版批次号'),
      },
      {
        type: 'string',
        name: 'deployDate',
        label: intl.get('hpdm.data-distribute.model.deployDate').d('发版日期'),
      },
      {
        type: 'string',
        name: 'deployDesc',
        label: intl.get('hpdm.data-distribute.model.deployDesc').d('发版描述'),
      },
    ],
    queryFields: [],
    autoQuery: true,
    selection: 'single',
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_SRDM}/v1/${organizationId}/hpdm-config-deploy-infos/query`
          : `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/query`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
    },
    events: {},
  };
}

export default getDeployDSProps;
