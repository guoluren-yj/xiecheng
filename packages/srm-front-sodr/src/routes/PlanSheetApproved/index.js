/*
 * PlanSheet - 计划单审批
 * @date: 2018/10/13 11:47:39
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import UpdateList from './List';
import OperationRecord from '../components/PlantOperationRecord/OperationRecord';

/**
 * 计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} planSheetApproved - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.planSheetApproved',
    'sodr.common',
    'entity.company',
    'entity.order',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.item',
  ],
})
@connect(({ loading, planSheetApproved }) => ({
  loadingList: loading.effects['planSheetApproved/queryPlanApprovedList'],
  planSheetApproved,
}))
export default class ReceivedOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      supplierTenantId: getUserOrganizationId(),
      selectedUpdateRowKeys: [], // 修改计划单 key,
      operatingVisible: false, // 操作记录模态框
      operatingPlanHeaderId: null, // 计划单主键id
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 值集查询
    dispatch({
      type: 'planSheetApproved/init',
    });
  }

  /**
   * 跳转详情
   */
  @Bind()
  onJumpDetail(record) {
    const { history } = this.props;
    history.push({
      pathname: `/sodr/plan-sheet-approved/detail/${record.planHeaderId}`,
    });
  }

  /**
   * 查询列表
   * @param {Object} fields
   * @param {*} otherParams
   */
  @Bind()
  handleSearch(page = {}) {
    const fields = this.detailForm ? this.detailForm.searchForm.props.form.getFieldsValue() : {};
    const handleFormValues = this.handleFormQuery(fields);
    this.handleSearchDetailList({
      page,
      ...handleFormValues,
    });
    this.setState({
      selectedUpdateRowKeys: [],
    });
  }

  /**
   * 查询维护列表
   */
  @Bind()
  handleSearchDetailList(fields) {
    const { dispatch } = this.props;
    dispatch({
      type: 'planSheetApproved/queryPlanApprovedList',
      payload: { ...fields },
    });
  }

  /**
   * 明细选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleUpdateSelectChange(selectedRowKeys) {
    this.setState({ selectedUpdateRowKeys: selectedRowKeys });
  }

  /**
   *修改审批计划单
   */
  @Bind()
  handleApproved() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmUpdatePlan`)
        .d('是否确认修改计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheetApproved/approvedPlan',
          payload: selectedUpdateRowKeys,
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  /**
   *批量废弃计划单
   */
  @Bind()
  handleDelete() {
    const { dispatch } = this.props;
    const { selectedUpdateRowKeys = [] } = this.state;
    Modal.confirm({
      title: intl
        .get(`sodr.planSheet.view.message.title.confirmDiscardPlan`)
        .d('是否确认废弃计划单'),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => {
        dispatch({
          type: 'planSheetApproved/cancelPlan',
          payload: selectedUpdateRowKeys,
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch();
          }
        });
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    let timeArray = [];
    timeArray = ['creationDateStart', 'creationDateEnd'];
    timeArray.forEach(item => {
      if (item === 'creationDateEnd') {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
      } else {
        dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
      }
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(flag, record) {
    if (flag) {
      this.setState({
        operatingVisible: true,
        operatingPlanHeaderId: record.planHeaderId,
      });
    } else {
      this.setState({
        operatingVisible: false,
      });
    }
  }

  render() {
    const {
      tenantId,
      supplierTenantId,
      selectedUpdateRowKeys,
      operatingVisible,
      operatingPlanHeaderId,
    } = this.state;
    const {
      planSheetApproved: { enumMap = {}, planUpdateList = [], planUpdateListPagination = {} },
      dispatch,
      loadingList,
    } = this.props;
    const detailSearchProps = {
      enumMap,
      dispatch,
      handleOperating: this.handleOperating,
      onJumpDetail: this.onJumpDetail,
      rowSelection: {
        selectedRowKeys: selectedUpdateRowKeys,
        onChange: this.handleUpdateSelectChange,
      },
      tenantId,
      supplierTenantId,
      loading: loadingList,
      dataSource: planUpdateList,
      pagination: planUpdateListPagination,
      onSearch: this.handleSearch,
      onRef: node => {
        this.detailForm = node;
      },
    };
    const operationRecordProps = {
      dispatch,
      id: operatingPlanHeaderId,
      // loading: queryPlanOperateLoading,
      visible: operatingVisible,
      hideModal: this.handleOperating,
    };
    return (
      <Fragment>
        <Header title={intl.get(`sodr.planSheetApproved.view.message.title`).d('计划单审批')}>
          <Button type="primary" icon="edit" onClick={this.handleApproved}>
            {intl.get('sodr.common.button.planSheetApproved').d('修改计划单')}
          </Button>
          <Button icon="delete" onClick={this.handleDelete}>
            {intl.get('sodr.common.button.planSheetApproved.delete').d('废弃')}
          </Button>
        </Header>
        <Content>
          <UpdateList {...detailSearchProps} />
        </Content>
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
