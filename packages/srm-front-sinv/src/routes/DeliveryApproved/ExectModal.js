/**
 * ExectModal - 导入
 * @date: 2020-11-26
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { PureComponent } from 'react';
import { Table, Modal, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';
// import { createPagination } from 'utils/utils';
// import { dateTimeRender } from 'utils/renderer';

export default class ExectModal extends PureComponent {
  // constructor(props) {
  //   super(props);
  //   // const { onRef = (e) => e } = props;
  //   this.state = {
  //     dataSource: [],
  //     //   pagination: {},
  //   };
  //   // onRef(this);
  // }

  componentDidMount() {
    const { asnHeaderId } = this.props;
    if (asnHeaderId) {
      this.handleSearch({ asnHeaderId });
    }
  }
  /**
   * 查询操作列表
   * @param {Object} fields
   */

  @Bind()
  handleSearch(fields) {
    const { onFetchExect } = this.props;
    if (isFunction) {
      onFetchExect(fields);
    }
  }
  /**
   * 分页改变回调
   * @param {Object} pagination
   */

  @Bind()
  handleActionHistoryTableChange() {
    const { asnHeaderId } = this.props;
    this.handleSearch({ asnHeaderId });
  }

  @Bind()
  syncAlign(record) {
    const { syncAlign, asnHeaderId } = this.props;
    syncAlign(record, asnHeaderId);
  }

  render() {
    // const { dataSource } = this.state;
    const { loading, hideModal, visible, recordList, dataSource } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.common.model.common.importStatus`).d('导入状态'),
        dataIndex: 'importStatusMeaning',
        width: 150,
        render: (_, record) =>
          record.importStatus === 'SUCCESS' ? (
            <span style={{ color: '#00DD00' }}> {record.importStatusMeaning} </span>
          ) : record.importStatus === 'ERROR' ? (
            <span style={{ color: '#FF0000' }}> {record.importStatusMeaning} </span>
          ) : (
            <span style={{ color: '#0066FF' }}> {record.importStatusMeaning} </span>
          ),
      },
      {
        title: intl.get(`sinv.common.model.common.async`).d('同步执行'),
        dataIndex: 'sync',
        width: 150,
        render: (_, record) =>
          record.importStatus === 'SUCCESS' || record.importStatus === 'IMPORTING' ? null : (
            <a onClick={() => this.syncAlign(record)}>
              {intl.get(`sinv.common.model.common.sync`).d('重新同步')}
            </a>
          ),
      },
      {
        title: intl.get(`sinv.common.mmodel.closeSyncResponseMsg`).d('反馈信息'),
        dataIndex: 'importMessage',
        width: 150,
        render: (value, record) => (
          <Tooltip title={value}>
            <span>{record.importMessage}</span>
          </Tooltip>
        ),
      },
      {
        title: intl.get(`sinv.common.model.common.exSystemName`).d('外部系统'),
        dataIndex: 'sourceCode',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.mportType`).d('接口代码'),
        dataIndex: 'importType',
        width: 150,
      },
      {
        title: intl.get(`sinv.common.model.common.interName`).d('接口名称'),
        dataIndex: 'interName',
        width: 150,
      },
    ];
    const tableProps = {
      loading,
      pagination: false,
      columns,
      dataSource,
      bordered: true,
      rowKey: 'asnActionId',
    };
    return (
      <Modal
        title={`${recordList.asnTypeCodeMeaning}${recordList.asnNum}`}
        width={820}
        visible={visible}
        bodyStyle={{ maxHeight: '600px', overflow: 'auto' }}
        onCancel={hideModal}
        footer={null}
      >
        <Table {...tableProps} />
      </Modal>
    );
  }
}
