/*
 * @author: biao.zhu@going-link.com
 * @Date: 2024-08-14 20:43:48
 * @LastEditTime: 2024-08-27 15:56:01
 * @Description: 发现商机列表-行渲染
 * @copyright: Copyright (c) 2020, Hand
 */
import React from 'react';
import { compose, isNil } from 'lodash';
import lineIcon from '@/assets/find-business-line.svg';

import style from './index.less';

const ColumnItem = (props) => {
  const { record } = props;
  const {
    rfxTitle,
    releasedDate,
    // companyName = '招标单位',
    // prequalEndDate = '资格预审截止时间',
    // quotationEndDate = '报价截止时间',
    // bidFileExpense = '招标文件费',
    // bidBond = '保证金',
  } = record?.get(['rfxTitle', 'releasedDate']);
  const getFields = () => {
    const list = ['companyName', 'prequalEndDate', 'quotationEndDate', 'bidFileExpense', 'bidBond'];
    return list.map((item, idx, arr) => {
      const last = arr.length - 1 === idx;
      const value = record.get(item);
      const label = record.getField(item).get('label') || '';
      return (
        <span key={item}>
          {!isNil(value) && (
            <span className={`field ${item}`}>
              <span className="label">{label}</span>:<span className="value">{value}</span>
            </span>
          )}
          {!last && !isNil(value) && <span className="split">|</span>}
        </span>
      );
    });
  };
  return (
    <>
      <div className={style.wrapper} {...props}>
        <div className="header">
          <span className="title">
            <img src={lineIcon} alt="" />
            {rfxTitle}
          </span>
          <span className="release-time">{releasedDate}</span>
        </div>
        <div className="divider" />
        <div className="content">{getFields()}</div>
      </div>
    </>
  );
};

export default compose()(ColumnItem);
