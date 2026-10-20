/*
 * @Date: 2022-02-16 19:12:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { Form, Output, TextField, TextArea, DateTimePicker } from 'choerodon-ui/pro';
import { renderStatus } from '@/routes/components/utils';

export default class BaseInfo extends Component {
  render() {
    const { dataSet, customizeForm, custLoading, isEdit } = this.props;
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_BASE_INFO',
      },
      <Form
        columns={3}
        dataSet={dataSet}
        custLoading={custLoading}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        style={{ width: '75%', maxWidth: 1172 }}
      >
        {isEdit ? <TextField name="expandNum" /> : <Output name="expandNum" />}
        {isEdit ? (
          <TextField name="supplyAbilityExpandStatus" />
        ) : (
          <Output name="supplyAbilityExpandStatus" renderer={renderStatus} />
        )}
        {isEdit ? (
          <TextField name="sourceCompanyNames" tooltip="overflow" />
        ) : (
          <Output name="sourceCompanyNames" />
        )}
        {isEdit ? <TextField name="companyName" /> : <Output name="companyName" />}
        {isEdit ? <TextField name="supplierCompanyNum" /> : <Output name="supplierCompanyNum" />}
        {isEdit ? <TextField name="supplierCompanyName" /> : <Output name="supplierCompanyName" />}
        {isEdit ? <TextField name="createdUserName" /> : <Output name="createdUserName" />}
        {isEdit ? <DateTimePicker name="creationDate" /> : <Output name="creationDate" />}
        {isEdit ? <TextField name="lastUpdatedUserName" /> : <Output name="lastUpdatedUserName" />}
        {isEdit ? <DateTimePicker name="lastUpdateDate" /> : <Output name="lastUpdateDate" />}
        {isEdit ? <TextArea name="remark" cols={2} rows={2} /> : <Output name="remark" />}
      </Form>
    );
  }
}
