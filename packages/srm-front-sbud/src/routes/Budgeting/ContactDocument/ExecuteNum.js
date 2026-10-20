/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-01 14:15:14
 * @LastEditors: yanglin
 * @LastEditTime: 2021-11-15 11:43:31
 */
/**
 * @Description:
 * @Date: 2021-09-07
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';

const ExecuteNum = ({ count, label }) => {
  return (
    <div
      style={{
        width: '188px',
        display: 'flex',
        justifyContent: 'space-between',
        height: '32px',
        background: '#F5F5F5',
        lineHeight: '22px',
        marginBottom: 16,
      }}
    >
      <span
        style={{
          padding: '8px 10px',
          fontSize: '12px',
          color: 'rgba(0,0,0,0.65)',
          lineHeight: '18px',
          fontWeight: 400,
        }}
      >
        {label || intl.get('sodr.workspace.model.common.totalExecutedQuantity').d('总执行数量')}
      </span>
      <span style={{ padding: '5px 10px', fontWeight: 600 }}>{count || 0}</span>
    </div>
  );
};

export default ExecuteNum;
