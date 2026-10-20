// 价格，显示保留小数点2-10位小数
// const toFixedPrice = (price = '') => {
//   if (price === null || price === '' || isNaN(price)) {
//     return '';
//   } else {
//     const value = price.toString();
//     const ind = value.indexOf('.');
//     const precision = ind === -1 ? 0 : Math.abs(value.length - ind);
//     if (precision > 2) {
//       return Math.round(price * 10000000000) / 10000000000;
//     } else {
//       return price.toFixed(2);
//     }
//   }
// };

// 阶梯价格
const ladderPriceColumns = () => [
  {
    name: 'lineNum',
    width: 90,
  },
  {
    name: 'ladderFrom',
    width: 110,
    editor: true,
  },
  {
    name: 'ladderTo',
    width: 110,
    editor: true,
  },
  {
    name: 'taxPrice',
    width: 90,
    editor: true,
  },
  {
    name: 'unitPrice',
    width: 90,
    align: 'right',
    editor: true,
  },
];

// 可采买组织
const unitColumns = () => [
  {
    name: 'unitCode',
    width: 130,
  },
  {
    name: 'unitName',
    width: 130,
  },
];

// 送货区域
const regionColumns = () => [
  {
    name: 'regionCode',
    width: 100,
  },
  {
    name: 'regionName',
    width: 100,
  },
];

export { unitColumns, regionColumns, ladderPriceColumns };
