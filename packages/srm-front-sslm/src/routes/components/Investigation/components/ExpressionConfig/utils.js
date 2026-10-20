/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-02 16:00:05
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */

/**
 * @description: 根据传入数字转换为字母；
 * @param {number} num length：要生成的
 * @param {26 | 52} type : 26 26 ----> 0——a; 26——aa  | 52 52 ----> 0——a; 52——aa
 * @return {string}
 */
const num2CodeStr = (num, type = 26) => {
  let str = '';
  let number = num;
  while (number >= 0) {
    const tempNum = number % type;
    if (tempNum < 26) {
      str = String.fromCharCode(tempNum + 97) + str;
    } else {
      str = String.fromCharCode(tempNum - 26 + 65) + str;
    }
    number = Math.floor(number / type) - 1;
  }
  return str;
};

export { num2CodeStr };
