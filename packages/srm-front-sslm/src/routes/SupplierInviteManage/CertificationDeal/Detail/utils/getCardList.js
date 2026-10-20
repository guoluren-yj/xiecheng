import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import {
  getPlatformCardList,
  OTHERINFO,
} from '@/routes/components/EnterpriseCertification/utils/getCardList';

import OtherInfo from '../../../components/OtherInfo';

export const getCardList = (params = {}) => {
  const { renderTabList = [] } = params;
  if (isEmpty(renderTabList)) {
    return [];
  }
  const allCardList = [
    ...getPlatformCardList(),
    {
      key: OTHERINFO,
      component: OtherInfo,
      label: intl.get(`spfm.enterprise.view.message.otherInfo`).d('其他信息'),
    },
  ];
  const tabList = renderTabList
    .map(tab => {
      const { configName } = tab;
      let tabProps = {};
      const tabInfo = allCardList.find(i => i.key === configName);
      if (!tabInfo) {
        return false;
      }
      tabProps = tabInfo;
      return {
        ...tab,
        ...tabProps,
      };
    })
    .filter(Boolean);

  return tabList;
};
