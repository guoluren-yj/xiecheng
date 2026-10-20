import intl from 'utils/intl';
import { SRM_SRPM } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

export const formDS = (listDs) => {
  return {
    autoCreate: true,
    forceValidate: true,
    dataToJSON: 'normal',
    fields: [
      {
        name: 'suspendRemark',
        label: intl.get('srpm.common.model.common.holdExplanation').d('暂挂说明'),
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SRPM}/v1/${getCurrentOrganizationId()}/request-plan/batch-line-suspend`,
          method: 'POST',
          params: data[0],
          data: listDs.selected.map((record) => record.toJSONData()),
        };
      },
    },
  };
};
