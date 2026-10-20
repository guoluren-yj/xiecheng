/**
 * openBidding - 开标弹框
 * @date: 2019 12-30
 * @author: zhijian.li@hand-china
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, Password } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class openBidding extends Component {
  render() {
    return (
      <React.Fragment>
        <Form labelLayout="float" dataSet={this.props.openingBidDS}>
          <Password
            name="openPassword"
            restrict="a-z || A-Z || 0-9"
            placeholder={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.openingBidPassword`)
              .d('开标密码')}
            label={intl
              .get(`ssrc.inquiryHall.model.inquiryHall.inputBidPassword`)
              .d('输入开标密码')}
          />
        </Form>
      </React.Fragment>
    );
  }
}
