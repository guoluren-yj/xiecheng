import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const radialTreeDS = (props) => {
  const { onLoad } = props;
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'children',
        type: 'object',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/server-domains/server-radial-tree`,
          params: {
            ...data,
            ...params,
          },
          method: 'GET',
        };
      },
    },
    events: {
      load: onLoad,
    },
  };
};

export { radialTreeDS };
