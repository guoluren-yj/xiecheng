/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-19 11:51:37
 * @LastEditors: yanglin
 * @LastEditTime: 2024-01-12 16:57:16
 */
import React from 'react';
import { Tag } from 'choerodon-ui';
// import { Icon } from 'choerodon-ui/pro';

// tag颜色
export function colorRender(value, meaning) {
  if (!value) return;

  if (
    [
      'WAIT_FEEDBACK',
      'AUTHENTICATION_APPROVAL',
      'SAMPLE_DELIVERY_WAIT_FEEDBACK',
      'TEST_RESULTS_TO_BE_ENTERED',
      'PREAPPROVAL',
    ].includes(value)
  ) {
    // 橘色
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        {meaning}
        {/* {!!flag && <Icon type="alt_route-o" />} */}
      </Tag>
    );
  }
  if (
    [
      'AUTHENTICATION_APPROVED',
      'EARLY_TERMINATION',
      'FINAL_AUTHENTICATION_COMPLETE',
      'SUCCESS',
      'CLOSED',
    ].includes(value)
  ) {
    // 绿色
    return (
      <Tag color="green" style={{ border: 'none' }}>
        {meaning}
        {/* {!!flag && <Icon type="alt_route-o" />} */}
      </Tag>
    );
  }
  if (
    [
      'CANCEL',
      'AUTHENTICATION_REJECTED',
      'ERROR',
      'FEEDBACK_REJECTED',
      'PREAPPROVAL_REJECTED',
    ].includes(value)
  ) {
    // 红色
    return (
      <Tag color="red" style={{ border: 'none' }}>
        {meaning}
        {/* {!!flag && <Icon type="alt_route-o" />} */}
      </Tag>
    );
  } else {
    // 灰色
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        {meaning}
        {/* {!!flag && <Icon type="alt_route-o" />} */}
      </Tag>
    );
  }
}
