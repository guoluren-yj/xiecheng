import querystring from 'querystring';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

// 详情页返回路径
export const getBackPath = (routerParam) => {
  const { sourceKey = '', sourceReviewTemplateId = '' } = routerParam;
  switch (sourceKey) {
    case 'DETAIL_HISTORY': {
      // 从明细跳转过来，返回到明细页
      const search = querystring.stringify(
        filterNullValueObject({
          sourceReviewTemplateId,
        })
      );
      return `/spcm/contract-review-config/template/detail/${sourceReviewTemplateId}/view?${search}`;
    }
    default:
      return '/spcm/contract-review-config/list';
  }
};

// 个性化单元集合
const unitCodes = {
  // 头
  headerCode: "SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_HEADER",
  // 行表格
  lineCode: "SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_LINE",
  // 行-编辑-侧弹窗
  lineModalCode: "SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.TEMPLATE_EDIT_LINE",
  // 行-新建-筛选器
  lineCreateSearchCode: "SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.REF_POINT_SEARCH",
  // 行-新建-表格
  lineCreateListCode: "SPCM_CONTRACT_REVIEW_CONFIG_DETAIL.REF_POINT_LIST",
};

export const getUnitCodes = {
  headerCode: unitCodes.headerCode,
  lineCode: unitCodes.lineCode,
  lineModalCode: unitCodes.lineModalCode,
  lineCreateSearchCode: unitCodes.lineCreateSearchCode,
  lineCreateListCode: unitCodes.lineCreateListCode,
  detailCodes: `${unitCodes.headerCode},${unitCodes.lineCode}`,
  lineCreateModalCodes: `${unitCodes.lineCreateSearchCode},${unitCodes.lineCreateListCode}`,
};



// 详情页title
export const getHeaderTitle = ({isEdit, sourceKey, versionNumber} = {}) => {
  if (['LIST_HISTORY', 'DETAIL_HISTORY'].includes(sourceKey)) {
    return intl
      .get('spcm.contractReview.view.title.viewReviewTemplateVersion', {
        version: versionNumber,
      })
      .d(`查看-版本v${versionNumber}`);
  }
  return isEdit
  ? intl.get('hzero.common.view.title.edit').d('编辑')
  : intl.get('hzero.common.view.title.view').d('查看');
};