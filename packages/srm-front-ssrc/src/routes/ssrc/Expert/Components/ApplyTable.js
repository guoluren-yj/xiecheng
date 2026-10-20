/**
 * ApplyTable.js - 专家注册申请表格
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { isFunction } from 'lodash';

import ActionHistory from '../Components/ActionHistory';

const promptCode = 'ssrc.expert';

@withRouter
export default class ApplyTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordModal: false,
    };
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState(
      {
        recordModal: true,
        data: record,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  linkDetail(expertReqId, expertReqStatus) {
    const { history, type } = this.props;
    if (type === 'requisition') {
      if (expertReqStatus === 'NEW' || expertReqStatus === 'REJECTED') {
        history.push(`/ssrc/expert-requisition/detail/${expertReqId}`);
      } else {
        history.push(`/ssrc/expert-requisition/read-only-detail/${expertReqId}`);
      }
    } else if (type === 'approve') {
      history.push(`/ssrc/expert-approve/detail/${expertReqId}`);
    } else if (type === 'reqQuery') {
      history.push(`/ssrc/expert-reqQuery/detail/${expertReqId}`);
    }
  }

  render() {
    const {
      dispatch,
      loading,
      onTableChange,
      rowSelection,
      expertList: { content = [] },
      expertPagination = {},
      customizeTable,
      customizeUnitCode = '',
    } = this.props;
    const { recordModal, data } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const columns = [
      {
        title: intl.get(`${promptCode}.model.expert.expertReqNum`).d('申请单号'),
        dataIndex: 'expertReqNum',
        width: 130,
        render: (value, record) => {
          const { expertReqId, expertReqStatus } = record;
          return <a onClick={() => this.linkDetail(expertReqId, expertReqStatus)}>{value}</a>;
        },
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertsName`).d('专家姓名'),
        dataIndex: 'expertName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expert.registeredDate`).d('注册日期'),
        dataIndex: 'registeredDate',
        width: 170,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertLevel`).d('专家级别'),
        dataIndex: 'expertLevelMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertType`).d('专家类型'),
        dataIndex: 'expertTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertCategory`).d('专家类别'),
        dataIndex: 'expertCategoryMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.expert.subAccount`).d('子账户'),
        dataIndex: 'loginName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.expert.expertReqStatus`).d('单据状态'),
        dataIndex: 'expertReqStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'taxAmount',
        width: 150,
        render: (val, record) => (
          <a onClick={() => this.openOperationRecord(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        {isFunction(customizeTable) ? (
          customizeTable(
            {
              code: customizeUnitCode,
            },
            <Table
              bordered
              loading={loading}
              rowKey="expertReqId"
              columns={columns}
              dataSource={content}
              pagination={expertPagination}
              rowSelection={rowSelection}
              onChange={onTableChange}
            />
          )
        ) : (
          <Table
            bordered
            loading={loading}
            rowKey="expertReqId"
            columns={columns}
            dataSource={content}
            pagination={expertPagination}
            rowSelection={rowSelection}
            onChange={onTableChange}
          />
        )}
        <ActionHistory {...operationRecordProps} />
      </React.Fragment>
    );
  }
}
