import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const operationDS = () => ({
  selection: false,
  primaryKey: 'actionId',

  // table显示的字段
  fields: [
    {
      name: 'actionName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.action').d('操作'),
    },
    {
      name: 'actionDetail',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.actionDetail').d('操作描述'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.createdBy').d('操作人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.creationDate').d('创建时间'),
      format: getDateTimeFormat(),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-actions/list`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

export { operationDS };
