import intl from 'utils/intl';

const getTabs = () => [
  {
    key: 'toFilled',
    tab: intl.get('sslm.supplierInvestWorkbench.view.tabPane.toFilled').d('待填写'),
    searchBarCode: 'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_TOFILLED',
    countCode: 'writeCount',
  },
  {
    key: 'all',
    tab: intl.get('sslm.supplierInvestWorkbench.view.tabPane.all').d('全部'),
    searchBarCode: 'SSLM.SUPPLIER_INVEST_WORKBENCH_LIST.SEARCH_ALL',
    countCode: 'totalCount',
  },
];

export { getTabs };
