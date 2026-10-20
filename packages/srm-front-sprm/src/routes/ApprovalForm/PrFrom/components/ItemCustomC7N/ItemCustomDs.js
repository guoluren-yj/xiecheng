/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:17:02
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-02 17:34:40
 */
import intl from 'utils/intl';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

export default () => {
  return {
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        label: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
        name: 'attributeName',
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'attributeValue',
      },
    ],
  };
};
