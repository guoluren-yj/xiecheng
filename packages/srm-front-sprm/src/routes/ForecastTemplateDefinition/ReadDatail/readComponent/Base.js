/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';

import { Store } from '../../Detail/stores';

const BaseInfo = function BaseInfo() {
  const { headerDs } = useContext(Store);

  return (
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      style={{ height: '100%' }}
    >
      <Output name="templateCode" />
      <Output name="templateName" />
      <Output name="enabledFlag" />
      <Output name="templateStatus" />
      <Output name="createdByName" />
      <Output name="creationDate" />
    </Form>
  );
};

export default BaseInfo;
