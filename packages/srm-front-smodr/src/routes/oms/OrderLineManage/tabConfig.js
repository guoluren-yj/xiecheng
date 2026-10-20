import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { fetchOnlyCount } from '@/utils/commonApi';

const organizationId = getCurrentOrganizationId();

const tabList = () => {
  const _tabList = [
    {
      node: intl.get('smodr.orderLine.view.all').d('全部'),
      key: 'wholeAll',
      parentKey: 'whole',
      url: `${SMALL_ORDER}/v1/${organizationId}/orders/order-list`,
    },
    {
      node: intl.get('smodr.orderLine.view.all').d('全部'),
      key: 'detailAll',
      parentKey: 'detail',
      url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys`,
    },
  ];
  return _tabList.map(m => {
    return {
      ...m,
      queryCount: async () => {
        const res = getResponse(await fetchOnlyCount(m.url));
        if (res) {
          return res;
        }
        return {};
      },
    };
  });
};

export { tabList };