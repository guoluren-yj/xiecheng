import { SRM_PLATFORM } from '_utils/config';

export default ({ organizationId }) => {
  return {
    autoQuery: true,
    transport: {
      read: {
        url: `${SRM_PLATFORM}/v1/${organizationId}/settings`,
        method: 'GET',
      },
    },
    dataKey: null,
  };
};
