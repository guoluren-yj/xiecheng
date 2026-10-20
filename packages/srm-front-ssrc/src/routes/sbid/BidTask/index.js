/**
 * models - 报价作业/数据列表
 * @date: 2019-05-27
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import OperationRecord from '../components/OperationRecord';
import FilterForm from './FilterForm';
import TableList from './TableList';

@formatterCollections({ code: ['ssrc.bidTask', 'ssrc.common'] })
@connect(({ bidTask, commonModel, loading }) => ({
  bidTask,
  commonModel,
  fetchDataLoading: loading.effects['bidTask/fetchDataList'],
  organizationId: getCurrentOrganizationId(),
}))
export default class BidTask extends Component {
  form;

  state = {
    operationRecordModalVisible: false, // 招标作业modal
    bidHeaderId: '',
  };

  componentDidMount() {
    const {
      dispatch,
      bidTask: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);

    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 寻源方式
      bidStatus: 'SSRC.BID_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 投标方向
      quotationType: 'SSRC.QUOTATION_TYPE', // 投标方式
      bidType: 'SSRC.BID_TYPE', // 招标类别
    };

    dispatch({
      type: 'bidTask/batchCode',
      payload: { lovCodes },
    });
  }

  @Bind()
  handleSearch(page) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    dispatch({
      type: 'bidTask/fetchDataList',
      payload: {
        page,
        ...handleFormValues,
        organizationId,
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['creationDateFrom'];
    const timeToArray = ['creationDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  resetFields() {
    this.form.resetFields();
  }

  @Bind()
  onRef(ref = {}) {
    this.openingBidForm = (ref.props || {}).form;
  }

  @Bind()
  handleTaskAction(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-task/task-action/${record.bidHeaderId}/${record.bidRuleType}/${record.templateScoreType}`,
        search: querystring.stringify({
          expertSource: record.expertSource,
        }),
      })
    );
  }

  /**
   *记录招标作业进入招标明细页面返回路由
   *
   */
  @Bind()
  backPath() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bidTask/updateState',
      payload: {
        historys: `/ssrc/bid-task/list`,
      },
    });
  }

  /**
   * 操作记录
   */
  @Bind()
  operationRender(record) {
    const { organizationId, dispatch } = this.props;
    const page = {};
    this.setState({
      operationRecordModalVisible: true,
      bidHeaderId: record.bidHeaderId,
    });

    dispatch({
      type: 'commonModel/operationRecord',
      payload: {
        page,
        organizationId,
        bidHeaderId: record.bidHeaderId,
      },
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ operationRecordModalVisible: false });
    this.props.dispatch({
      type: 'commonModel/updateState',
      payload: {
        operationPagination: {},
        operationData: [],
      },
    });
  }

  render() {
    const {
      dispatch,
      fetchDataLoading,
      organizationId,
      bidTask: {
        dataList = [],
        pagination = {},
        code: {
          sourceMethod = [],
          bidStatus = [],
          auctionDirection = [],
          quotationType = [],
          bidType = [],
        },
      },
      commonModel: { operationPagination = {}, operationData = [] },
      match: { path = null },
    } = this.props;

    const { operationRecordModalVisible, bidHeaderId } = this.state;

    const formProps = {
      sourceMethod,
      bidStatus,
      auctionDirection,
      quotationType,
      bidType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };

    const tableProps = {
      path,
      dispatch,
      sourceMethod,
      bidStatus,
      auctionDirection,
      pagination,
      dataSource: dataList,
      loading: fetchDataLoading,
      onChange: this.handleSearch,
      onInquiryUpdate: this.handleTaskAction,
      operationRender: this.operationRender,
      backPath: this.backPath,
    };

    // 操作记录
    const operationRecordProps = {
      dispatch,
      organizationId,
      visible: operationRecordModalVisible,
      hideModal: this.hideOperationRecord,
      pagination: operationPagination,
      dataSource: operationData,
      bidHeaderId,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.bidTask.view.message.title.bidTask`).d('招标作业')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
