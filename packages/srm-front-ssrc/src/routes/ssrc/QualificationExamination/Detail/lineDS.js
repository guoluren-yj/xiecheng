import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const returnDS = () => ({
  // autoQuery: true,
  autoCreate: true,
  dataToJSON: 'all',

  // table表单显示的字段
  fields: [
    {
      name: 'returnRemark',
      label: intl.get('ssrc.qualiExam.model.qualiExam.returnRemark').d('退回说明'),
      required: true,
    },
  ],
  transport: {
    submit: (val) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/prequal/approval/supply-return`,
        data: { ...(val?.data?.[0] || {}), ...(val?.dataSet?.queryParameter?.postParams || {}) },
        method: 'POST',
      };
    },
  },
});

export { returnDS };
