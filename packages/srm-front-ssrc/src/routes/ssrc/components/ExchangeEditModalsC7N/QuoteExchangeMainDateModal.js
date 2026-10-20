/**
 * 组件 - 汇率编辑 - 引用汇率主数据 - QuoteExchangeMainDateModalModal
 * @date: 20120-3-9
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, DatePicker, Lov } from 'choerodon-ui/pro';

import { observer } from 'mobx-react';

@observer
export default class QuoteExchangeMainDateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    const { dataSet } = this.props;

    return (
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <Lov name="rateTypeCode" />
        <DatePicker name="rateDate" mode="date" />
      </Form>
    );
  }
}
