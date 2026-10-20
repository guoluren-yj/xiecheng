import { isEmpty } from 'lodash';

import { filterCustomizeCodes } from '@/utils/utils';

// 获取个性化编码
export function getCustomizeUnitCode(codeName) {
  if (!codeName || isEmpty(codeName)) return null;

  // 个性化编码集合
  const codeMap = new Map([
    // ------------------------ 列表个性化单元 start --------------------------------
    ['filterCode', 'SSRC.FILE_TEMPLATE_MANAGE_LIST.FILTER_BAR'], // 列表筛选器编码
    ['table', 'SSRC.FILE_TEMPLATE_MANAGE_LIST.TABLE_LIST'], // table
    // ------------------------ 列表个性化单元 end ----------------------------------
    // ------------------------ 维护页面个性化单元 start --------------------------------
    ['updateBaseInfo', 'SSRC.FILE_TEMPLATE_MANAGE_UPDATE.BASE_INFO'], // 列表筛选器编码
    // ------------------------ 维护页面个性化单元 end ----------------------------------
  ]);
  return filterCustomizeCodes(codeMap, codeName);
}
