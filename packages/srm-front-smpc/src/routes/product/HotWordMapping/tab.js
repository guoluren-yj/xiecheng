import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { listDS } from './ds';

export default function getTabs() {
  const initTabs = [
    {
      key: 'CATEGORY',
      tab: intl.get('smpc.hotWordMapping.view.tab.category').d('平台分类'),
      params: { mappingType: 'CATEGORY' },
      ds: listDS,
      searchBarCode: 'SMPC.HOT_WORD_MAPPING.CATEGORY.SEARCHBAR',
      tableCode: 'SMPC.HOT_WORD_MAPPING.CATEGORY.LIST',
    },
    {
      key: 'CATALOG',
      tab: intl.get('smpc.hotWordMapping.view.tab.mallCatalog').d('商城目录'),
      ds: listDS,
      params: { mappingType: 'CATALOG' },
      searchBarCode: 'SMPC.HOT_WORD_MAPPING.CATALOG.SEARCHBAR',
      tableCode: 'SMPC.HOT_WORD_MAPPING.CATALOG.LIST',
    },
  ];
  const tabs = initTabs.map((m) => {
    const { url, params, searchBarCode, tableCode, ds } = m;
    const customizeUnitCode = `${tableCode},${searchBarCode}`;
    const config = { url, queryParams: { ...params, customizeUnitCode } };
    return {
      ...m,
      customizeUnitCode,
      dataSet: new DataSet(ds(config)),
    };
  });
  return tabs;
}
