/**
 * 组件 - 汇率编辑Modal
 * @date: 20120-3-9
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { numberSeparatorRender } from '@/utils/renderer';

@observer
export default class ExchangeEditModal extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {}

  renderColumns() {
    const columns = [
      {
        name: 'supplierCompanyName',
        width: 280,
      },
      {
        name: 'quotationCurrencyCode',
        width: 100,
      },
      {
        name: 'baseCurrencyCode',
        width: 100,
      },
      {
        name: 'exchangeRate',
        width: 150,
        editor: true,
        renderer: ({ value }) => numberSeparatorRender(value, 10),
      },
    ];

    return columns;
  }

  render() {
    const { dataSet } = this.props;

    const columns = this.renderColumns();

    return dataSet ? (
      <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100vh - 150px)' }} />
    ) : null;
  }
}
