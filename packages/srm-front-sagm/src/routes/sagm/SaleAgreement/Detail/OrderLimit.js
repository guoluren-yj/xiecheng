import React, { Component } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default class orderLimit extends Component {
  getColumns = () => {
    const { disabled } = this.props;
    return [
      { name: 'labelIdObj', editor: !disabled },
      { name: 'pointsLimit', editor: !disabled },
      {
        name: 'action',
        width: 200,
        renderer: ({ record }) => (
          <a disabled={disabled} onClick={() => this.handleDelete(record)}>
            {intl.get('sagm.common.model.delete').d('删除')}
          </a>
        ),
      },
    ];
  };

  handleCreate = () => {
    const { tableDs } = this.props;
    tableDs.create({}, 0);
  };

  handleDelete = (record) => {
    const { tableDs } = this.props;
    if (record.status === 'add') {
      tableDs.remove([record]);
    } else {
      tableDs.delete(record, false);
    }
  };

  render() {
    const { tableDs, disabled } = this.props;
    let buttons = [];
    buttons = [
      <Button
        color="primary"
        funcType="flat"
        icon="playlist_add"
        disabled={disabled}
        onClick={this.handleCreate}
      >
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>,
    ];
    return <Table dataSet={tableDs} columns={this.getColumns()} buttons={buttons} />;
  }
}
