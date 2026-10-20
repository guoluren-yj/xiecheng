/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-08 11:07:59
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, TextField, Select, DatePicker, IntlField } from 'choerodon-ui/pro';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const Base = ({ baseInfoDs }) => {
  return (
    <div className="config-right-content">
      <div className="config-right-content-one-title">
        {intl.get(`${commonPrompt}.baseInfo`).d('基本信息')}
      </div>
      <Form dataSet={baseInfoDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
        <TextField name="templateCode" />
        <IntlField name="templateName" />
        <Select name="enabledFlag" />

        <TextField name="createdByName" />
        <DatePicker name="creationDate" />
        <TextField name="lastUpdatedByName" />

        <DatePicker name="lastUpdateDate" />
      </Form>
    </div>
  );
};

export default Base;
