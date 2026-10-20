/**
 * index - 应收单审批
 * @date: 2019-11-19
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import Search from './Search.js';
import List from './List.js';
import OperationRecord from '../components/AcceptanceOperation';

/**
 * 应收单审批入口界面
 *
 * @export
 * @class Reception - 入口界面
 * @extends {Component} - React.Component
 * @reactProps {object} acceptanceSheetApproved - 数据源
 * @reactProps {boolean} fetchLoading - 获取数据状态
 * @reactProps {function} dispatch - redux dispatch
 * @returns React.element
 */
@connect(({ loading, acceptanceSheetApproved }) => ({
  fetchLoading: loading.effects['acceptanceSheetApproved/fetchApproveList'],
  approveLoading: loading.effects['acceptanceSheetApproved/approveAcceptance'],
  rejectLoading: loading.effects['acceptanceSheetApproved/rejectAcceptance'],
  // fetchValueLoading: loading.effects['acceptanceSheetApproved/fetchValue'],
  acceptanceSheetApproved,
}))
@formatterCollections({
  code: [
    'sinv.acceptanceSheet',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
    'sinv.acceptance',
    'model.common',
    'sinv.acceptance',
    'hzn.date',
    'sinv.acceptanceApproved',
  ],
})
export default class Reception extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordId: '', // table中打开的对应操作记录的id
      operationRecordModalVisible: false, // 修改操作记录模态框
    };
  }

  componentDidMount() {
    // const { dispatch } = this.props;
    this.handleSearch();
    this.queryValueCode();
    // dispatch({
    //   type: 'acceptanceSheetApproved/fetchValue',
    // });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetApproved/queryValueCode',
      payload: {
        // statusCode: 'SPUC.ACCEPT_SELECT_STATUS',
        orderSource: 'SPUC.ACCEPT_SOURCE_CODE',
      },
    });
  }

  /**
   * 查询表单请求
   * @params {object} page - 分页
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.searchForm && this.searchForm.props.form.getFieldsValue()) || {};
    const acceptDateStart = filterValues.acceptDateStart
      ? filterValues.acceptDateStart.format(DATETIME_MIN)
      : undefined;
    const acceptDateEnd = filterValues.acceptDateEnd
      ? filterValues.acceptDateEnd.format(DATETIME_MAX)
      : undefined;
    dispatch({
      type: 'acceptanceSheetApproved/fetchApproveList',
      payload: { page, ...filterValues, acceptDateStart, acceptDateEnd },
    }).then(res => {
      if (res) {
        this.setState({ selectedRows: [], selectedRowKeys: [] });
      }
    });
  }

  /**
   * 跳转验收单审批详情
   */
  @Bind()
  handleJumpApproved(record) {
    this.props.history.push({
      pathname: `/sinv/acceptance-sheet-approved/detail/${record.acceptListHeaderId}/${record.sourceCode}`,
    });
  }

  /**
   * 审批列表通过
   */
  @Bind()
  handleApproved() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetApproved/approveAcceptance',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 审批列表拒绝
   */
  @Bind()
  handleReject() {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetApproved/rejectAcceptance',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
    });
  }

  /**
   * 勾选列表key
   */
  @Bind()
  handleSelectRows(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   *
   * 修改操作记录可见
   * @memberof deliveryApproved
   * @param {Boolean} flag
   */
  @Bind()
  handleOperationRecordVisible(flag, operationRecordId) {
    this.setState({
      operationRecordId,
      operationRecordModalVisible: !!flag,
    });
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const { selectedRowKeys, operationRecordModalVisible, operationRecordId } = this.state;
    const {
      acceptanceSheetApproved: {
        approveList = [],
        approveListPagination = {},
        code: { orderSource = [] },
      },
      fetchLoading,
      approveLoading,
      rejectLoading,
      match: {
        params: { sourceCode },
      },
    } = this.props;
    const searchProps = {
      onSearch: this.handleSearch,
      onRef: node => {
        this.searchForm = node;
      },
      orderSource,
    };
    const operationRecordProps = {
      operationRecordId,
      visible: operationRecordModalVisible,
      hideModal: () => this.handleOperationRecordVisible(false),
    };
    const listProps = {
      loading: fetchLoading,
      dataSource: approveList,
      pagination: approveListPagination,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectRows,
      },
      onChange: this.handleSearch,
      handleJumpApproved: this.handleJumpApproved,
      openOperationRecord: this.handleOperationRecordVisible,
      sourceCode,
    };
    return (
      <Fragment>
        <Header title={intl.get(`sinv.acceptanceApproved.view.message.title`).d('验收单审批')}>
          <Button
            disabled={selectedRowKeys.length === 0}
            type="primary"
            icon="check"
            loading={approveLoading}
            onClick={this.handleApproved}
          >
            {intl.get(`sinv.acceptanceSheet.view.message.Approve`).d('审批通过')}
          </Button>
          <Button
            disabled={selectedRowKeys.length === 0}
            loading={rejectLoading}
            icon="close"
            onClick={this.handleReject}
          >
            {intl.get(`sinv.acceptanceSheet.view.message.refuse`).d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
