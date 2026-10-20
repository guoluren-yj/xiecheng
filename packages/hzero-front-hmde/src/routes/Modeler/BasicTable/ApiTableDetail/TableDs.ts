import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (apiId) => ({
  autoQuery: false,
  primaryKey: '',
  paging: false,
  transport: {
    read: () => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/api-params/${apiId}`,
      method: 'get',
    }),
    destroy: ({ data }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/api-params/${apiId}/batch-delete`,
      method: 'delete',
      data,
    }),
    submit: ({ data }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HMDE,
      })}/api-params/${apiId}/batch-update`,
      method: 'post',
      data,
    }),
  },
  fields: [
    {
      name: 'parameterName',
      type: 'string',
      label: '参数名',
      required: true,
      validator: (value, _, record) => {
        const arr = record.dataSet.filter(
          (item) =>
            item.get('parameterName') &&
            value &&
            item.get('parameterName').toLowerCase() === value.toLowerCase()
        );
        return arr.length === 1 ? true : '参数名不能重复';
      },
    },
    {
      name: 'description',
      type: 'string',
      label: '参数描述',
      required: false,
    },
    {
      name: 'parameterType',
      type: 'string',
      label: '请求数据类型',
      required: true,
    },
    {
      name: 'parameterLocationList',
      type: 'string',
      label: '参数位置',
      required: true,
    },
    {
      name: 'parameterDirectionList',
      type: 'string',
      label: '入参/出参',
      textField: 'meaning',
      valueField: 'value',
      required: true,
    },
  ],
  events: {},
});
