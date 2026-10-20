import { Record } from 'choerodon-ui/dataset';

import { Expose } from 'utils/remote';
import request from 'utils/request';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_MARMOT } from '_utils/config';

export default new Expose({
  events: {
    openBidFunc: async (eventProps) => {
      const { record, openBidFunc, bidFlag } = eventProps || {};
      if (bidFlag) {
        openBidFunc();
        return;
      }
      const rfxHeaderId =
        record instanceof Record ? record?.get('rfxHeaderId') : record?.rfxHeaderId;
      if (!rfxHeaderId) {
        return false;
      }
      try {
        const res = await request(
          `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/UQ4mwgiaacU0K6CV1M7p3yqooBpHAfVlFpBXtoyeMJ4g`,
          {
            method: 'POST',
            query: {
              rfxHeaderId,
            },
          }
        );
        if (getResponse(res)) {
          openBidFunc();
        }
      } catch (e) {
        throw e;
      }
    },
  },
});
