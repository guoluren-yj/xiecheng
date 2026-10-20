/**
 * EditForm.js
 * 预算科目-新建和编辑页面
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, TextField, IntlField, Switch, Lov } from 'choerodon-ui/pro';

export default class EditForm extends Component {
  render() {
    const { dataRecord, create } = this.props;
    return (
      <React.Fragment>
        <Form record={dataRecord}>
          <TextField name="budgetAccountNum" disabled={!create} />
          <IntlField name="budgetAccountName" />
          <Lov name="companyLov" disabled={!create} />
          <TextField name="companyName" disabled />
          <Switch name="openBudgetFlag" />
          <Switch name="enabledFlag" />
        </Form>
      </React.Fragment>
    );
  }
}
