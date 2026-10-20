/*
 * @Date: 2023-10-20 15:02:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getTabPaneList = () => [
  {
    key: 'UN_COMPLETE',
    customizeCode: 'SSLM.SCORING_WORKBENCH_LIST.WAIT_SCORE_LIST',
    searchCode: 'SSLM.SCORING_WORKBENCH_LIST.WAIT_SCORE_SEARCH_BAR',
    tab: intl.get('sslm.common.view.message.waitScore').d('待评分'),
  },
  {
    key: 'ALL',
    customizeCode: 'SSLM.SCORING_WORKBENCH_LIST.ALL_LIST',
    searchCode: 'SSLM.SCORING_WORKBENCH_LIST.ALL_SEARCH_BAR',
    tab: intl.get('sslm.common.view.message.all').d('全部'),
  },
];

export const checkBoxLabel = () => ({
  SU: intl.get('sslm.appraisalScore.view.message.notCompleteSupplier').d('仅查看未完成评分供应商'),
  CA: intl.get('sslm.appraisalScore.view.message.notCompleteCategory').d('仅查看未完成评分品类'),
  IT: intl.get('sslm.appraisalScore.view.message.notCompleteItem').d('仅查看未完成评分物料'),
});

// 左侧查询placeholder
export const queryPlaceholder = () => ({
  SU: intl.get('sslm.common.model.search.supplierName').d('请输入供应商名称查询'),
  CA: intl.get('sslm.common.model.search.categoryName').d('请输入品类名称查询'),
  IT: intl.get('sslm.common.model.search.itemName').d('请输入物料名称查询'),
});

// 右侧合并查询placeholder
export const combinePlaceholder = () => ({
  SU: intl.get('sslm.common.model.queryField.supplierNumAndName').d('请输入供应商编码、名称查询'),
  CA: intl.get('sslm.common.model.queryField.categoryCodeAndName').d('请输入品类编码、名称查询'),
  IT: intl.get('sslm.common.model.queryField.itemCodeAndName').d('请输入物料编码、名称查询'),
});

// 左侧查询name
export const queryName = {
  SU: 'supplierName',
  CA: 'categoryName',
  IT: 'itemName',
};

// 评分信息-左侧tab的key
export const tabKey = {
  SU: 'supplierId',
  CA: 'categoryId',
  IT: 'itemId',
};

// 获取评分信息，数据分组
export const getTableGroups = ({ dimension, evalGranularity }) => {
  if (dimension === 'SU') {
    switch (evalGranularity) {
      case 'SU+CA':
        return [
          {
            name: 'categoryName',
            type: 'column',
            columnProps: {
              width: 120,
            },
          },
        ];
      case 'SU+IT':
        return [
          {
            name: 'itemName',
            type: 'column',
            columnProps: {
              width: 120,
            },
          },
        ];
      default:
        return [];
    }
  } else {
    return [
      {
        name: 'supplierNum',
        type: 'column',
        columnProps: {
          width: 120,
        },
      },
      {
        name: 'supplierName',
        type: 'column',
        columnProps: {
          width: 200,
        },
      },
    ];
  }
};
