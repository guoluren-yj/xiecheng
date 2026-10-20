/**
 * supplierRecord - 开标弹框
 * @date: 2019 12-30
 * @author: zhijian.li@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, DataSet, Output, TextArea, Select } from 'choerodon-ui/pro';

import { projectDS } from './store/ProjectDS';

export default class supplierRecord extends Component {
  constructor(props) {
    super(props);
    this.projectDS = new DataSet(projectDS());
  }

  render() {
    return (
      <React.Fragment>
        <Form dataSet={this.projectDS} labelLayout="vertical" columns={1}>
          <Output name="projectNum" />
          <Output name="projectName" />
        </Form>
        <Form dataSet={this.projectDS} labelLayout="float" columns={1}>
          <Select name="whetherRule" />
          <Select name="whetherOverBudget" />
          <TextArea name="PricingInstructions" rows={2} resize="vertical" />
        </Form>
      </React.Fragment>
    );
  }
}
