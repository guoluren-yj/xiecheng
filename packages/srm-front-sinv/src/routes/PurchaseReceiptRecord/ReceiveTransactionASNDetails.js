import React, { PureComponent } from 'react';
import { Modal, Table } from 'hzero-ui';
import { isInteger } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { showBigNumber } from '../components/utils';

export default class ReceiveTransactionASNDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.handleFetchDataSource = this.handleFetchDataSource.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  state = {
    dataSource: [],
    pagination: {},
  };

  componentDidMount() {
    this.handleFetchDataSource();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, id } = this.props;
    return visible && isInteger(id) && id !== prevProps.id;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.handleFetchDataSource();
    }
  }

  handleClose() {
    const { close = (e) => e } = this.props;
    this.setState({
      dataSource: [],
      pagination: {},
    });
    close();
  }

  handleFetchDataSource(params = {}) {
    const { fetchDataSource = (e) => e, id } = this.props;
    fetchDataSource(params, id).then((res) => {
      if (getResponse(res)) {
        this.setState({
          dataSource: res?.content,
          pagination: res,
        });
      }
    });
  }

  defaultTableRowKey = 'rcvTrxLineId';

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 150,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      visible,
      loading,
      fetchDataSource = (e) => e,
      // id,
    } = this.props;
    const { dataSource, pagination } = this.state;

    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.asnNum`).d('送货单号'),
          dataIndex: 'asnNum',
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get(`sinv.common.model.common.displayAsnLineNum`).d('送货单行号'),
          dataIndex: 'displayAsnLineNum',
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get(`sinv.common.model.common.trxQuantity`).d('事务数量'),
          dataIndex: 'quantity',
          onCell: this.onCell.bind(this),
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.remark`).d('备注'),
          dataIndex: 'remark',
          onCell: this.onCell.bind(this),
        },
      ].map((item) => ({
        ...item,
        title: <div style={{ textAlign: (item.align && item.align) || 'left' }}>{item.title}</div>,
      })),
      pagination,
      dataSource,
      loading,
      bordered: true,
      // onChange: this.onSourceTableChange.bind(this),
    };

    return (
      <Modal
        title={intl.get(`sinv.common.view.title.receiveTransactionASNDetails`).d('事务送货单明细')}
        visible={visible}
        onCancel={this.handleClose.bind(this)}
        width={700}
        footer={null}
        onChange={fetchDataSource}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}
