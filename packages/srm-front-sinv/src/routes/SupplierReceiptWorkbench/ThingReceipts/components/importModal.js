/**
 * index - 我的收货记录-操作
 * @date: 2018-12-4
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import moment from 'moment';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { alingeDetail } from '../../../../services/ReceipWorkbenchService';
import { importModalDS } from './importModalDS';
import { useLineTag } from '../../../ReceipWorkbench/util';

export default class ImportModal extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.alingeDetail = this.alingeDetail.bind(this);
  }

  tableDs = new DataSet(importModalDS());

  state = {
    alingeDetailLoading: false,
  };

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch(page = {}) {
    const { id, headerId } = this.props;
    this.tableDs.setQueryParameter('params', { id, headerId, ...page });
    this.setState({ alingeDetailLoading: true });
    this.tableDs.query().then((res) => {
      if (res && !res.failed) {
        this.setState({ alingeDetailLoading: false });
      }
    });
  }

  handleClose() {
    const { close = (e) => e } = this.props;
    close();
  }

  alingeDetail(record) {
    const { id, headerId } = this.props;
    this.setState({ alingeDetailLoading: true });
    alingeDetail({ headerId, id, record }).then((res) => {
      this.setState({ alingeDetailLoading: false });
      if (res.type === 'error') return notification.error({ message: res?.message });
      if (res) {
        const newData = this.tableDs.data.map((i) =>
          i.get('recordId') === res.recordId ? res : i
        );
        this.tableDs.loadData(newData, this.tableDs.currentPage);
      }
    });
  }

  getColumns = () => {
    return [
      {
        name: 'importTypeMeaning',
        width: 100,
      },
      {
        name: 'importStatusMeaning',
        width: 100,
        renderer: ({ record }) => useLineTag(record),
      },
      {
        name: 'importMessage',
        width: 140,
      },
      {
        name: 'lastUpdateDate',
        width: 150,
        renderer: ({ value }) => (value ? moment(value).format(DEFAULT_DATETIME_FORMAT) : null),
      },
      {
        name: 'lastUpdatedName',
        width: 100,
      },
    ];
  };

  render() {
    const { alingeDetailLoading = false } = this.state;
    const tableProps = {
      columns: this.getColumns(),
      dataSet: this.tableDs,
      spin: {
        spinning: alingeDetailLoading,
      },
    };

    return (
      // <Sidebar
      //   title={intl.get(`sinv.common.view.title.detailStatus`).d('状态明细')}
      //   visible={visible}
      //   width={742}
      //   footer={[
      //     <Button onClick={this.handleClose.bind(this)} type="primary">
      //       {intl.get(`sinv.common.model.common.close`).d('关闭')}
      //     </Button>,
      //   ]}
      //   bodyStyle={{ minHeight: `calc(100vh - 121px)` }}
      //   onChange={fetchDataSource}
      //   // onCancel={this.handleClose.bind(this)}
      // >
      <Table {...tableProps} customizable customizedCode="supplier-receipt-all-workbench" />
      // </Sidebar>
    );
  }
}
