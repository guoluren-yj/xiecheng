import React, { Component } from 'react';
import { Table, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum } from 'lodash';

import intl from 'utils/intl';

export default class TableList extends Component {
  @Bind()
  renderLadderTable() {
    const { dataSource = [], rowKey, columns, loading = false } = this.props;
    const defaultRowKey =
      dataSource.length > 0 && dataSource[0].ladderId ? 'ladderId' : 'agreementLadderId';
    const defaultColumns = [
      {
        title: intl.get('small.common.model.lineNumber').d('行号'),
        dataIndex: 'ladderLineNum',
        width: 60,
        render: (val, record) => val || record.lineNum,
      },
      {
        title: intl.get('small.common.model.numberFrom').d('数量从(>=)'),
        dataIndex: 'ladderFrom',
        width: 100,
      },
      {
        title: intl.get('small.common.model.numberTo').d('数量至(<)'),
        dataIndex: 'ladderTo',
        width: 100,
      },
      {
        title: intl.get('small.common.model.noTaxPrice').d('未税单价'),
        dataIndex: 'unitPrice',
        width: 120,
        align: 'right',
        render: (val, record) => val || record.ladderPrice,
      },
      {
        title: intl.get('small.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        width: 120,
        align: 'right',
        render: (val, record) => val || record.ladderPrice || record.taxIncludedUnitPrice,
      },
    ];
    const scrollWidth = sum((columns || defaultColumns).map(n => n.width));
    return (
      <Table
        bordered
        loading={loading}
        className="small-table-all-space"
        style={{ maxHeight: 500, overflowY: 'auto' }}
        scroll={{ x: scrollWidth }}
        rowKey={rowKey || defaultRowKey}
        columns={columns || defaultColumns}
        pagination={false}
        dataSource={dataSource}
      />
    );
  }

  render() {
    const {
      link = intl.get('small.common.model.ladderPrice').d('阶梯价格'),
      disabled = false,
      onClick = e => e,
      popOverProps = {},
    } = this.props;
    const popProps = {
      arrowPointAtCenter: true,
      placement: 'leftBottom',
      content: this.renderLadderTable(),
      visible: disabled ? false : null,
      ...popOverProps,
    };

    if (disabled) {
      popProps.visible = false;
    } else {
      delete popProps.visible;
    }

    return (
      <Popover {...popProps}>
        <a disabled={disabled} onClick={onClick}>
          {link}
        </a>
      </Popover>
    );
  }
}
