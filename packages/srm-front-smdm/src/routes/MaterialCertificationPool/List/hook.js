import React from 'react';
import { Tag } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

// tag颜色
export function colorRender(value, meaning, flag = true) {
  if (!value) return;

  if (
    [
      'PENDING',
      'CLOSEDING',
      'SUBMITTED',
      'APPROVED',
      'PREAPPROVAL',
      'SAMPLE_DELIVERY_WAIT_FEEDBACK',
      'AUTHENTICATION_APPROVAL',
      'AUTHENTICATION_APPROVED',
      'TEST_RESULTS_TO_BE_ENTERED',
    ].includes(value)
  ) {
    // 黄色
    return (
      <Tag color="yellow" style={{ border: 'none' }}>
        {meaning}
        {!!flag && <Icon type="alt_route-o" style={{ fontSize: '0.12rem', marginTop: '-3px' }} />}
      </Tag>
    );
  }
  if (['EARLY_TERMINATION', 'CLOSED', 'FINAL_AUTHENTICATION_COMPLETE', 'SUCCESS'].includes(value)) {
    // 绿色
    return (
      <Tag color="green" style={{ border: 'none' }}>
        {meaning}
        {!!flag && <Icon type="alt_route-o" style={{ fontSize: '0.12rem', marginTop: '-3px' }} />}
      </Tag>
    );
  }
  if (
    [
      'CANCEL',
      'REJECTED',
      'AUTHENTICATION_REJECTED',
      'ERROR',
      'PREAPPROVAL_REJECTED',
      'FEEDBACK_REJECTED',
    ].includes(value)
  ) {
    // 红色
    return (
      <Tag color="red" style={{ border: 'none' }}>
        {meaning}
        {!!flag && <Icon type="alt_route-o" style={{ fontSize: '0.12rem', marginTop: '-3px' }} />}
      </Tag>
    );
  } else {
    // 灰色
    return (
      <Tag color="gray" style={{ border: 'none' }}>
        {meaning}
        {!!flag && <Icon type="alt_route-o" style={{ fontSize: '0.12rem', marginTop: '-3px' }} />}
      </Tag>
    );
  }
}
