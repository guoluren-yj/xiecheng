import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (apiId) => ({
  autoCreate: true,
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/apis/${apiId}`,
      method: 'get',
    }),
    submit: ({ data = [] }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/apis`,
      method: 'put',
      data: data[0],
    }),
  },
  fields: [
    {
      name: 'apiName',
      type: 'string',
      label: '名称',
      labelWidth: 25,
      required: true,
    },
    {
      name: 'apiMethod',
      type: 'string',
    },
    {
      name: 'description',
      type: 'string',
      label: '描述',
      labelWidth: 25,
      required: false,
    },
  ],
  events: {},
});
