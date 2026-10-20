/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 19:50:27
 * @LastEditors: yanglin
 * @LastEditTime: 2023-08-24 16:19:13
 */
import React from 'react';
import { Tag } from 'choerodon-ui';
import classnames from 'classnames';

export function renderAmount({ dataSet, record, name, text }) {
  // 判断来源是头还是行
  const field = dataSet?.parent ? 'linePriceHiddenFlag' : 'headerPriceHiddenFlag';

  if (record && record.get(field) === 1) {
    return record.get(`${name}Meaning`);
  }

  return text;
}

export function renderStatus({ record, name, value }) {
  const colorStatus = (val) =>
    val === 'NOT_STARTED'
      ? 'rgba(0,0,0,0.25)'
      : val === 'FINISHED'
      ? '#47B881'
      : val === 'CLOSED'
      ? 'red'
      : '#FCA000';

  return record && record?.get(`${name}Meaning`) ? (
    <Tag color={colorStatus(value)} style={{ verticalAlign: 'text-top' }}>
      {record.get(`${name}Meaning`)}
    </Tag>
  ) : null;
}

// 采购申请工作台tag颜色
// export function colorRender(value, meaning) {
//   if (value) {
//     if (['SUBMIT_SYNC', 'EXCUTED', 'ASSIGNED', 'APPROVED', 'SUBMITTED'].includes(value)) {
//       // 绿色
//       return <Tag className={classnames('c7n-tag-has-color', 'success-tag')}>{meaning}</Tag>;
//     } else if (['PENDING', 'EXOSYS_APPROVAL', 'WORKFLOW_APPROVAL'].includes(value)) {
//       // 橘色（注释校正）
//       return <Tag className={classnames('c7n-tag-has-color', 'notice-tag')}>{meaning}</Tag>;
//     } else if (['REJECTED', 'SEND_BACK', 'CANCELLED', 'CLOSED'].includes(value)) {
//       //  红色
//       return <Tag className={classnames('c7n-tag-has-color', 'danger-tag')}>{meaning}</Tag>;
//     } else {
//       // 橘色
//       return <Tag className={classnames('c7n-tag-has-color', 'warning-tag')}>{meaning}</Tag>;
//     }
//   } else {
//     return '-';
//   }
// }

// 采购申请工作台tag颜色
export const colorRender = (value, meaning) => {
  let styleColor = 'c7n-tag-yellow';
  if (['REJECTED', 'SEND_BACK', 'CANCELLED', 'CLOSED'].includes(value)) {
    styleColor = 'c7n-tag-red';
  } else if (
    ['SUBMIT_SYNC', 'EXCUTED', 'ASSIGNED', 'APPROVED', 'SUBMITTED', 'FINISHED'].includes(value)
  ) {
    styleColor = 'c7n-tag-green';
  } else {
    styleColor = 'c7n-tag-yellow';
  }
  return (
    value && (
      <Tag className={classnames(styleColor)} style={{ border: 0 }}>
        {meaning}
      </Tag>
    )
  );
};
