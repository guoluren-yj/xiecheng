import { SRM_SPUC } from 'srm-front-boot/lib/utils/config';

export default ({ organizationId, poHeaderId }) => {
  return {
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-messages`,
        method: 'GET',
        data: { poHeaderId },
      },
    },
    // events: {
    //   load: ({ dataSet }) => {
    //     dataSet.forEach((i) => {
    //       i.init({
    //         recallShow: false,
    //       });
    //     });
    //   },
    // },
  };
};
