/**
 * index - 工作流排程审批
 * @date: 2021-11-26
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import WorlkList from './WorlkList'; // 创建列表
import AsnNumsModel from '../AsnNumsModel';
import OperationRecord from '@/routes/components/NewPlantOperationRecord/OperationRecord';

/**
 * 计划单
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} scheduleSheet - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.common',
    'entity.item',
    'entity.organization',
    'ssrc.inquiryHall',
    'sodr.scheduleSheet',
    'sodr.sendOrder',
  ],
})
@connect(({ loading, scheduleSheet }) => ({
  loadingList: loading.effects['scheduleSheet/queryPlanPublish'],
  operationAsnNumsLoading: loading.effects['scheduleSheet/operationAsnNums'],
  operationRecordLoading: loading.effects['scheduleSheetCommon/operationRecord'],
  scheduleSheet,
}))
export default class ScheduleSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      asnNumsVisible: false, // 送货单模态框
      poLineLocationId: null, // 计划单订单发运行id
      operatingVisible: false,
      planId: null,
    };
  }

  componentDidMount() {
    this.fetchDetailList();
  }

  @Bind()
  fetchDetailList(fields) {
    const { dispatch, match = {} } = this.props;
    dispatch({
      type: 'scheduleSheet/queryPlanPublish',
      payload: {
        planId: match.params.planId,
        ...fields,
        customizeUnitCode: 'SODR.PLAN_SHEET_PUBLISH.APPROVE_LIST',
      },
    });
  }

  /**
   * 查询送货单列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleAsnNumsSearch(page = {}) {
    const { dispatch } = this.props;
    const { poLineLocationId } = this.state;
    dispatch({
      type: `scheduleSheet/operationAsnNums`,
      payload: {
        page,
        poLineLocationId,
      },
    });
  }

  /**
   * 关联送货单
   * @param {*} record
   */
  @Bind()
  handleToAsnNums(record) {
    this.setState({ asnNumsVisible: true, poLineLocationId: record.poLineLocationId });
  }

  @Bind()
  hideAsnNumsModel(flag) {
    this.setState({ asnNumsVisible: flag });
  }

  /**
   * 操作记录
   */
  @Bind()
  handleOperating(flag, record) {
    if (flag) {
      this.setState({
        operatingVisible: true,
        planId: record.planId,
      });
    } else {
      this.setState({
        operatingVisible: false,
      });
    }
  }

  render() {
    const { asnNumsVisible, poLineLocationId, operatingVisible, planId } = this.state;
    const {
      scheduleSheet: { planPubLish = [], asnNumsPagination = {}, asnNumsDataSource = [] },
      loadingList,
      dispatch,
      operationAsnNumsLoading,
      form,
      operationRecordLoading,
    } = this.props;
    const listProps = {
      form,
      handleToAsnNums: this.handleToAsnNums,
      dispatch,
      loading: loadingList,
      dataSource: planPubLish,
      onRef: (node) => {
        this.listForm = node;
      },
      onSearch: this.fetchDetailList,
      handleOperating: this.handleOperating,
    };
    const asnNumsModelProps = {
      dispatch,
      poLineLocationId,
      operationAsnNumsLoading,
      visible: asnNumsVisible,
      pagination: asnNumsPagination,
      dataSource: asnNumsDataSource,
      hideAsnNumsModel: this.hideAsnNumsModel,
      handleAsnNumsSearch: this.handleAsnNumsSearch,
    };

    const operationRecordProps = {
      dispatch,
      id: planId,
      visible: operatingVisible,
      hideModal: this.handleOperating,
      operationRecordLoading,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.scheduleSheet.view.message.title.applore`).d('排程计划审核')}
        />
        <Content>
          <WorlkList {...listProps} />
        </Content>
        {asnNumsVisible && <AsnNumsModel {...asnNumsModelProps} />}
        {operatingVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
