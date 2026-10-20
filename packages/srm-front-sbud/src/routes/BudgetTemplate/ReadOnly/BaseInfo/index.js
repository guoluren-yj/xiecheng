/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2024-03-27 11:35:16
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-28 14:42:21
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, Output } from 'choerodon-ui/pro';

import { colorRender } from '../../util';

// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';

const Base = ({ baseInfoDs }) => {
  return (
    <Form
      useWidthPercent
      dataSet={baseInfoDs}
      showLines={6}
      columns={3}
      useColon={false}
      labelLayout="vertical"
      labelAlign="left"
      className="c7n-pro-vertical-form-display"
    >
      <Output name="budgetTemplateCode" />
      <Output name="budgetTemplateDesc" />

      <Output
        name="templateStatus"
        renderer={({ value, record }) => colorRender(value, record.get('templateStatusMeaning'))}
      />
      <Output name="createdByName" />
      <Output name="creationDate" />
      <Output name="version" />

      <Output name="lastUpdateDate" />
    </Form>
  );
};

export default Base;
