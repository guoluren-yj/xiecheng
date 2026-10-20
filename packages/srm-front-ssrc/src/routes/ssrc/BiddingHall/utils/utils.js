import { isString, isEmpty } from 'lodash';

import { filterCustomizeCodes } from '@/utils/utils';

/**
 * 获取字符串长度
 * @param {*} str
 */
export function getCharacterLength(str = '') {
  if (isString(str)) {
    return str.replace(/[\u0391-\uFFE5]/g, 'aa').length;
  }
  return str;
}

/**
 * 采购方所有个性化单元
 * @param {null | string | string[]} codeName - 个性化对应存储的name
 * @return null | string
 */
export function getPurCustomizeUnitCode(codeName) {
  if (!codeName || isEmpty(codeName)) return null;
  // 询价
  const purchaseCodeMap = new Map([
    ['headerButtons', 'SSRC.BIDDING_HALL.HEADER_BUTTONS'], // 头部按钮组
    ['biddingRule', 'SSRC.BIDDING_HALL.BIDDING_RULE_FORM'], // 竞价规则
    ['unitPriceItemTableSearch', 'SSRC.BIDDING_HALL.PUR_UNIT_PRICE.LINE_SEARCH'], // 单价竞价筛选个性化
    // ['TotalPriceSupplierTableSearch', 'SSRC.BIDDING_HALL.PUR_TOTAL_PRICE.LINE_SEARCH'], // 总价竞价供应商列表筛选个性化
    ['headerTag', 'SSRC.BIDDING_HALL.PUR_HEADER_TAG'],
    ['unitPriceHeaderItemView', 'SSRC.BIDDING_HALL.PUR_UNIT_HEADER_ITEM_VIEW_FORM'],
    // ['unitPriceModalItemLineTable', 'SSRC.BIDDING_HALL.PUR_UNIT_PRICE_MODAL_ITEM_LINE'],
    // ['unitPriceModalItemLineTableSearch', 'SSRC.BIDDING_HALL.PUR_UNIT_PRICE_MODAL_ITEM_LINE_SEARCH'],
    [
      'japanDutchRoundListHeaderForm',
      'SSRC.BIDDING_HALL.PUR_TOTAL_PRICE_JD_GROUP_LIST_HEADER_FORM',
    ],
  ]);

  return filterCustomizeCodes(purchaseCodeMap, codeName);
}

// 根据基准价 获取含税、未税字段
export function getBenchmarkPriceTypeField(payload) {
  // 含税 'TAX_INCLUDED_PRICE';
  // 未税 'NET_PRICE';
  const { benchmarkPriceType, includePriceField, netPriceField } = payload || {};
  if (benchmarkPriceType === 'TAX_INCLUDED_PRICE') {
    return includePriceField;
  } else {
    return netPriceField;
  }
}

export function transferToNumber(value) {
  if (isNaN(value)) {
    return value;
  }

  let inputNumber = `${value}`;
  inputNumber = parseFloat(inputNumber);
  const eformat = inputNumber.toExponential(); // 转换为标准的科学计数法形式（字符串）
  const tmpArray = eformat.match(/\d(?:\.(\d*))?e([+-]\d+)/); // 分离出小数值和指数值
  const number = inputNumber.toFixed(Math.max(0, (tmpArray[1] || '').length - tmpArray[2]));
  return number;
}

/**
 * 日式/荷兰 聚合表格
 * 核价比价助手也在使用这个方法，谨慎！！！！
 * 数据处理
 * 详细逻辑可以参考japanDutchAggregationTableDS上边的数据注释
 * */
const japanDutchAggregrationTableDataProcessing = (data, options = {}) => {
  const { biddingRoundSupplierInfoDTOList } = data || {};
  const { start: startRound = 0, end: endRound = undefined } = options || {};

  if (isEmpty(biddingRoundSupplierInfoDTOList)) {
    return [];
  }

  const newData = [];

  biddingRoundSupplierInfoDTOList.forEach((supplier) => {
    const { biddingRoundInfoDTOList = [], rfxLineSupplierId } = supplier || {};

    if (isEmpty(biddingRoundInfoDTOList)) {
      const currentSupplierDto = {
        ...supplier,
        biddingSupHeaderId: rfxLineSupplierId,
      };
      newData.push(currentSupplierDto);
      return currentSupplierDto;
    }

    const newRoundDataRange = biddingRoundInfoDTOList.slice(startRound, endRound);

    newRoundDataRange.forEach((round) => {
      const { biddingRoundDateId } = round || {};

      const currentRoundSupplier = {
        ...supplier,
        ...round,
        biddingRoundInfoDTOList: null,
        biddingSupHeaderId: `${rfxLineSupplierId}-${biddingRoundDateId}`,
      };
      newData.push(currentRoundSupplier);
    });
  });

  return {
    ...data,
    newData,
  };
};

export { japanDutchAggregrationTableDataProcessing };
