import React, { Component } from 'react';
import { Table, Form, Output } from 'choerodon-ui/pro';
// import { Bind, } from 'lodash-decorators';

import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

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
    const { doubleUnitFlag } = this.props;
    const Columns = [
      {
        name: 'rfxLadderLineNum',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryLadderFrom',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            width: 100,
            name: 'secondaryLadderTo',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'ladderFrom',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 100,
        name: 'ladderTo',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      doubleUnitFlag ? {
        name: 'validLadderSecPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      } : null,

      doubleUnitFlag ? {
        name: 'validNetLadderSecPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      } : null,
      {
        width: 100,
        name: 'validLadderPrice',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        width: 120,
        name: 'validNetLadderPrice',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'remark',
      },
    ];

    return Columns;
  }

  render() {
    const { ladderLevelModalDS, customizeTable, LadderCode } = this.props;

    const table = (
      <Table
        dataSet={ladderLevelModalDS}
        rowKey="rfxLadderLineNum"
        columns={this.ladderLevelModalTable()}
      />
    );

    return (
      <div>
        {this.renderHeader()}
        {customizeTable
          ? customizeTable(
              {
                code: LadderCode,
                dataSet: ladderLevelModalDS,
              },
              table
            )
          : table}
      </div>
    );
  }
}
