import React from 'react';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Icon } from 'choerodon-ui/pro';

const ImportPriceTableDS = (batchId) => ({
  selection: false,
  autoQuery: false,
  primaryKey: 'batchLineId',
  fields: [
    {
      name: 'status',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibName').d('价格库名称'),
    },
    {
      name: 'errorMessage',
      label: intl.get('hzero.common.message.errorMessage').d('错误信息'),
    },
    {
      name: 'unimported',
      label: intl.get('ssrc.priceLibDimension.model.dimension.unimported').d('未导入部分'),
    },
  ],
  queryFields: [
    {
      name: 'status',
      lookupCode: 'SPC.PRICE_TEMPLATE_IMPORT',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.priceLibDimension.model.dimension.priceLibName').d('价格库名称'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_SPC}/v1/${getCurrentOrganizationId()}/price-template/line-import/${batchId}`,
        method: 'GET',
        params: {
          ...params,
          ...filterNullValueObject(data),
        },
      };
    },
  },
});

const StatusList = [
  {
    status: 'SUCCESS',
    color: '#47B881',
    type: 'check_circle',
  },
  {
    status: 'ERROR',
    color: '#F56349',
    type: 'cancel',
  },
  {
    status: 'PARTIAL',
    color: '#FCA000',
    type: 'error',
  },
];
const getCurrentStatusConfig = (status) => {
  return (
    StatusList.find((item) => item.status === status) || {
      color: '#29bece',
      type: 'access_time_filled',
    }
  );
};

const ImportStatusRenderer = (status) => {
  const { color, type } = getCurrentStatusConfig(status);
  return <Icon type={type} style={{ fontSize: '16px', color }} />;
};

export { ImportPriceTableDS, ImportStatusRenderer, getCurrentStatusConfig };
