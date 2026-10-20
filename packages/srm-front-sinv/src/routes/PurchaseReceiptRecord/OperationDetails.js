/**
 * index - 我的收货记录-操作
 * @date: 2018-12-4
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Table } from 'hzero-ui';
// import { isInteger } from 'lodash';
import intl from 'utils/intl';
import { createPagination, getResponse } from 'utils/utils';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
@connect(({ loading = {}, purchaseReceiptRecord }) => ({
  operationDetailLoading: loading.effects['purchaseReceiptRecord/operationDetail'],
  alingeDetailLoading: loading.effects['purchaseReceiptRecord/alingeDetail'],
  purchaseReceiptRecord,
}))
export default class OperationDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.alingeDetail = this.alingeDetail.bind(this);
  }

  state = {
    dataSource: [],
    pagination: {},
  };

  defaultTableRowKey = 'recordId';

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch() {
    const { id, headerId, dispatch } = this.props;
    dispatch({
      type: 'purchaseReceiptRecord/operationDetail',
      payload: {
        headerId,
        id,
      },
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          dataSource: res?.content ?? [],
          pagination: createPagination(res),
        });
      }
    });
  }

  handleClose() {
    const { close = (e) => e } = this.props;
    this.setState({
      dataSource: [],
      pagination: {},
    });
    close();
  }

  alingeDetail(record) {
    const { id, headerId, dispatch } = this.props;
    const { dataSource = [] } = this.state;
    dispatch({
      type: 'purchaseReceiptRecord/alingeDetail',
      payload: {
        headerId,
        id,
        record,
      },
    }).then((res) => {
      if (res) {
        const newDataSource = dataSource.map((n) => {
          return n.recordId === res.recordId ? res : n;
        });
        this.setState({ dataSource: newDataSource });
      }
    });
  }

  render() {
    const {
      visible,
      operationDetailLoading = false,
      alingeDetailLoading = false,
      fetchDataSource = (e) => e,
    } = this.props;
    const { dataSource, pagination } = this.state;
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns: [
        {
          title: intl.get(`sinv.common.model.common.importTypeMeaning`).d('导入类型'),
          dataIndex: 'importTypeMeaning',
        },
        {
          title: intl.get(`sinv.common.model.common.importStatusMeaning`).d('导入状态'),
          dataIndex: 'importStatusMeaning',
        },
        {
          title: intl.get(`sinv.common.model.common.exectMessage`).d('导入消息'),
          dataIndex: 'importMessage',
          width: 140,
        },
        {
          title: intl.get(`sinv.common.model.common.lastUpdateDates`).d('操作日期'),
          dataIndex: 'lastUpdateDate',
          render: dateTimeRender,
        },
        {
          title: intl.get(`sinv.common.model.common.lastUpdatedName`).d('操作人'),
          dataIndex: 'lastUpdatedName',
        },
        {
          title: intl.get(`sinv.common.model.common.button`).d('按钮'),
          dataIndex: 'button',
          render: (_text, record) =>
            !['SUCCESS', 'IMPORTING'].includes(record.importStatus) ||
            (['FAIL'].includes(record.importStatus) &&
              (record.get('importType') === 'SINV_TO_SLOD' ||
                record.get('importType') === 'SINV_TO_SODR')) ? (
                  <a onClick={this.alingeDetail.bind(this, record)}>
                    {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
                  </a>
            ) : (
              intl.get(`sinv.common.model.common.alinge`).d('重新执行')
            ),
        },
      ],
      pagination,
      dataSource,
      loading: operationDetailLoading || alingeDetailLoading,
      bordered: true,
    };

    return (
      <Modal
        title={intl.get(`sinv.common.view.title.operation`).d('操作')}
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
