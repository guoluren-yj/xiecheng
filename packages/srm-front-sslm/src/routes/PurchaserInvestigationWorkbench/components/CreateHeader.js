/**
 * CreateHeader - 头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
// import { isEmpty } from 'lodash';
// import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';

export default class CreateHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 清空行供应商数据
  @Bind()
  handleClearLine() {
    const { tableDs, isAmktClient } = this.props;
    // 应用商店过来的自带供应商，变更公司不清空，后端校验是否合作
    console.log(isAmktClient);
    if (!isAmktClient) {
      tableDs.loadData([]);
    }
  }

  render() {
    const { isEdit = true, dataSet, customizeForm } = this.props;

    return customizeForm(
      {
        code: 'SSLM.INVESTIGATION_WORKBENCH_DETAIL.CREATE_HEADER',
      },
      <Form
        useWidthPercent
        dataSet={dataSet}
        columns={3}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField
          isEdit={isEdit}
          name="investigateLevel"
          componentType="SELECT"
          onChange={this.handleClearLine}
        />
        <FormField
          isEdit={isEdit}
          name="companyIdLov"
          componentType="LOV"
          onChange={this.handleClearLine}
        />
        <FormField isEdit={isEdit} name="investigateType" componentType="SELECT" />
        <FormField isEdit={isEdit} name="investigateTemplateIdLov" componentType="LOV" />
        <FormField isEdit={isEdit} name="createUserName" />
        <FormField isEdit={isEdit} name="unitName" />
        <FormField
          isEdit={isEdit}
          name="remark"
          componentType="TextArea"
          colSpan={2}
          resize="vertical"
        />
      </Form>
    );
  }
}
