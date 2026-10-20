/*
 * @Date: 2024-12-12 14:44:48
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import moment from 'moment';
import { isObject } from 'lodash';
import { dateRender } from 'utils/renderer';

// 只读状态下的值渲染
export const readOnlyRenderer = (props = {}) => {
  const { value, name, componentType, record, displayField, remote } = props;
  let renderValue = null;
  switch (componentType) {
    case 'LOV':
      renderValue = record?.get(displayField);
      break;
    case 'SELECT':
      renderValue = record?.get(`${name}Meaning`);
      break;
    case 'DATEPICKER':
      renderValue = dateRender(value);
      break;
    case 'MONTHPICKER':
      renderValue = value && moment(value).format('YYYY-MM');
      break;
    default:
      renderValue = isObject(value) ? value[displayField] : value;
      break;
  }
  const remoteValue = remote?.process('SSLM_EVALUATION_PLAN_DETAIL_VALUE', renderValue, props);
  return remoteValue || '-';
};

// 个性化字段渲染
export const handleExtTextRenderIntercept = (props = {}, node) => {
  const { remote } = props;
  const custNode = remote?.process('SSLM_EVALUATION_PLAN_DETAIL_CUST_VALUE', node, props);
  return custNode || '-';
};
