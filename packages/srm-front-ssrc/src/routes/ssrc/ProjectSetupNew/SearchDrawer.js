/**
 * 高级搜索组件
 * @date: 2021-01-27
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import React, { PureComponent } from 'react';
import { Form, TextField } from 'choerodon-ui/pro';

export default class Search extends PureComponent {
  render() {
    const { dataSet } = this.props;
    return (
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <TextField name="sourceProjectNum" />
        <TextField name="sourceProjectName" />
        <TextField name="purAgent" />
      </Form>
    );
  }
}
