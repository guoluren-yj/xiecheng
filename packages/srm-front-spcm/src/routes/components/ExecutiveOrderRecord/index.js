import React, { Component } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';
import { Bind } from 'lodash-decorators';

import { dateRender } from 'utils/renderer';
import { renderStatus } from '@/utils/renderer';
import StatusTag from '../StatusTag';
import executiveRecordDS from './DataSet';

@withProps(
  () => {
    const tableDs = new DataSet(executiveRecordDS());
    return {
      tableDs,
    };
  },
  { cacheState: true }
)
export default class ExecutiveOrderRecord extends Component {
  componentDidMount() {
    const { tableDs, pcSubjectId } = this.props;
    tableDs.setQueryParameter('queryParams', { pcSubjectId });
    tableDs.query();
  }

  componentWillUnmount() {
    const { tableDs } = this.props;
    if (tableDs.props.queryDataSet) {
      tableDs.props.queryDataSet.reset();
    }
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'seqNum',
        width: 80,
      },
      {
        name: 'orderStatus',
        width: 180,
        renderer: ({ value, record }) => renderStatus(value, record.get('orderStatusMeaning')),
      },
      {
        name: 'poNum',
        width: 150,
      },
      {
        name: 'poTypeDesc',
        width: 150,
      },
      {
        name: 'executeQuantity',
        width: 150,
      },
      {
        name: 'executedAmount',
        width: 150,
      },
      {
        name: 'executeBy',
        width: 150,
      },
      {
        name: 'executeDate',
        width: 150,
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'receiptsStatus',
        width: 150,
        // receiptsStatus只有一个状态：CONTRACT_CHANGE_ORDER（已转订单）
        renderer: ({ record }) => (
          <StatusTag text={record.get('receiptsStatusMeaning')} color="green" />
        ),
      },
    ];
    return columns;
  }

  render() {
    const { tableDs } = this.props;
    const columns = this.getColumns();
    return <Table style={{ maxHeight: 'calc(100vh - 200px)' }} dataSet={tableDs} columns={columns} />;
  }
}
