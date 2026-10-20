// 生成从start到end的序列化数组
export function generateArray(start: number, end: number) {
  return Array.from(new Array(end + 1).keys()).slice(start);
}

// export const formula2Desc = (formula, mappingList) => {
//   let temp = formula;
//   // eslint-disable-next-line no-unused-expressions
//   mappingList.forEach((i) => {
//     temp = temp?.replace(i.value, i.meaning);
//   });
//   return temp;
// };

export const formula2Desc = (mappingList) => {
  let str = '';
  mappingList.forEach((item, index) => {
    if (mappingList.length - 1 > index) {
      str = str?.concat(`${item.meaning},`);
    } else {
      str = str?.concat(`${item.meaning}`);
    }
  });
  return str;
};
