import { Prefix } from '@/utils/globalVariable';

const baseInfoDS = () => {
  return {
    primaryKey: 'rfxHeaderId',
    transport: {
      read: ({ data }) => {
        const { commonProps = {} } = data || {};
        const { rfxHeaderId, organizationId, } = commonProps || {};

        if (!rfxHeaderId || !organizationId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}`,
          method: 'GET',
          data: commonProps,
        };
      },
    },
  };
};

export { baseInfoDS }
