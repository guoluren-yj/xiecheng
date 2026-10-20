/**
 * service 弹性域组件utils工具包
 * @date: 2019-4-25
 * @version: 0.0.1
 * @author: lijun <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */

import { omit } from 'lodash';

// 静态变量:弹性域触发器
const FLEX_FIELDS_DEFAULT_FIELD_NAME = 'FLEX_FIELDS_TRIGGERS';

/**
 * withFormDataSourceFlex - 弹性域应用页面表单数据源flex解析
 *
 * @export
 * @param {*} [dataSource={}] - 表单数据源
 * @example
 * const { formDataSource } = this.props;
 * withFormDataSourceFlex(formDataSource);
 *
 * @returns Object
 */
export function withFormDataSourceFlex(dataSource = {}) {
  return omit({ ...dataSource, ...(dataSource.flex || {}) }, [FLEX_FIELDS_DEFAULT_FIELD_NAME]);
}

export function withFormDataFlex(data = {}) {
  const flexFieldsKeys =
    Object.keys(data).filter((o) => o.includes('FLEX_') && o !== FLEX_FIELDS_DEFAULT_FIELD_NAME) ||
    [];
  const flex = {};
  flexFieldsKeys.forEach((n) => {
    flex[n.split('_')[1]] = data[n];
  });
  return { ...withFormDataSourceFlex(omit(data, flexFieldsKeys)), flex };
}
