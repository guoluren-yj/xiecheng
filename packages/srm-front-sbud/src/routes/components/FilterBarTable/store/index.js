/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:17:02
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-14 15:58:32
 */

const searchInputDS = ({ fuzzyQueryCode }) => {
  return {
    autoQuery: false,
    autoCreate: true,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        name: fuzzyQueryCode,
        type: 'string',
      },
    ],
  };
};

export { searchInputDS };
