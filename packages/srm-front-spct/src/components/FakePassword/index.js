import React from 'react';
import { Password } from 'choerodon-ui/pro';

// 为了防止记住密码自动填充进password组件
export default function FakePassword({ name = '' }) {
  return <Password name={name} style={{ opacity: 0, height: '0px' }} />;
}
