import React, { Component } from 'react';
import { Table, Form, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class LadderLevel extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  renderHeader() {
    const { recordData = {} } = this.props;

    const { itemCode, itemName } = recordData || {};
    return (
      <Form columns={2}>
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
          value={itemName}
        />
      </Form>
    );
  }

  ladderLevelModalTable() {
    const Columns = [
      {
        name: 'rfxLadderLineNum',
        width: 100,
      },
      {
        name: 'ladderFrom',
        width: 100,
      },
      {
        width: 100,
        name: 'ladderTo',
      },
      {
        name: 'remark',
      },
    ];

    return Columns;
  }

  render() {
    const { ladderLevelModalDS } = this.props;

    return (
      <div>
        {this.renderHeader()}
        <Table
          rowKey="rfxLadderLineNum"
          columns={this.ladderLevelModalTable()}
          dataSet={ladderLevelModalDS}
        />
      </div>
    );
  }
}
