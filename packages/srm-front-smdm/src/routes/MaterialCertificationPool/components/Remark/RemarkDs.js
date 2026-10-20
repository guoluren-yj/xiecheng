/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:19:10
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-22 11:45:28
 */

export default ({ required = false }) => {
  return {
    dataToJSON: 'all',
    autoCreate: true,
    fields: [
      {
        required,
        name: 'operationReason',
      },
    ],
  };
};
