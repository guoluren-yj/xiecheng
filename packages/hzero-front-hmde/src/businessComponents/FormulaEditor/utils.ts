import { blockReg, drillFormulaReg } from '@/businessGlobalData/common';

export const dataMapTransfer = (initValue, mapList, from, to) => {
  let temp = initValue;
  // const reg = new RegExp('#(.*?)#', 'g');
  const matchList = (temp?.match(drillFormulaReg) || []).concat(temp?.match(blockReg) || []);
  // eslint-disable-next-line no-unused-expressions
  matchList?.forEach((item) => {
    const matchItem = mapList.find((i) => i?.[from] === item);
    temp = temp?.replace(item, matchItem?.[to]);
  });
  return temp;
};

export const formula2Desc = (formula, mappingList) => {
  let temp = formula;
  // eslint-disable-next-line no-unused-expressions
  mappingList.forEach((i) => {
    temp = temp?.replace(i.value, i.meaning);
  });
  return temp;
};
