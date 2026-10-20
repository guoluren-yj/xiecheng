/*
 * @Date: 2023-06-19 15:38:24
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import intl from 'utils/intl';

// 获取列表页TabPane
export const getTabPane = () => [
  {
    key: 'pointDefinition',
    searchCode: 'SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_SEARCH',
    customizeCode: 'SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_TABLE',
    tab: intl.get('spcm.contractReview.view.title.pointDefinition').d('审查点定义'),
  },
  {
    key: 'templateDefinition',
    searchCode: 'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TEMPLATE_SEARCH',
    customizeCode: 'SPCM_CONTRACT_REVIEW_CONFIG_LIST.TEMPLATE_TABLE',
    tab: intl.get('spcm.contractReview.view.title.templateDefinition').d('审查模版定义'),
  },
];

// 弹窗标题
export const getReviewPointModalTitle = (type = '') => {
  switch (type) {
    case 'create':
      return intl
        .get('spcm.contractReview.view.title.createReviewPoint')
        .d('新建审查点');
    case 'edit':
      return intl
        .get('spcm.contractReview.view.title.editReviewPoint')
        .d('编辑审查点');
    default:
      return intl
        .get('spcm.contractReview.view.title.viewReviewPoint')
        .d('查看审查点');
  }
};

// 个性化单元集合
export const getListUnitCodes = {
  // 审查点侧弹窗
  pointModal: "SPCM_CONTRACT_REVIEW_CONFIG_LIST.POINT_MODAL",
};