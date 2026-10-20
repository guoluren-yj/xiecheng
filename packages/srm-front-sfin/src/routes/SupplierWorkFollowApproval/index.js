/**
 * index - 供应商扣款录入审批详情
 * @date: 2020-05-06
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import HistoryList from '@/routes/components/SupplierActionHistory';
import HeaderInfo from './Header';
import DeatilList from './DeatilList';

/**
 * 供应商扣款录入审批详情
 *
 * @export
 * @class Reception - 详情界面
 * @extends {Component} - React.Component
 * @reactProps {object} acceptanceSheetQuery - 数据源
 * @reactProps {boolean} fetchLoading - 获取数据状态
 * @reactProps {function} dispatch - redux dispatch
 * @returns React.element
 */
@connect(({ loading, supplierCommon }) => ({
  fetchLoading: loading.effects['supplierCommon/fetchSourceList'],
  fetchHeaderLoading: loading.effects['supplierCommon/queryList'],
  supplierCommon,
}))
@formatterCollections({
  code: [
    'sinv.supplierCommon',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
    'sfin.common',
    'sfin.acceptanceSheetCreate',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordModal: false,
    };
  }

  // 生命周期初始化
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询表单请求
   * @params {object} page - 分页
   */
  @Bind()
  handleSearch() {
    const {
      dispatch,
      match: {
        params: { id, supplierDeductionsId },
      },
    } = this.props;
    // supplierDeductionsId,
    dispatch({
      type: 'supplierCommon/queryList',
      payload: { supplierDeductionsId: id || supplierDeductionsId },
    });
    this.fetchList();
  }

  // 查询
  @Bind()
  fetchList(page = {}) {
    const {
      dispatch,
      match: {
        params: { id, supplierDeductionsId },
      },
    } = this.props;
    dispatch({
      type: 'supplierCommon/fetchSourceList',
      payload: { supplierDeductionsId: id || supplierDeductionsId, page },
    });
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState({
      recordModal: true,
      deductionsId: record,
    });
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */

  @Bind()
  hideOperationRecord() {
    this.setState({
      recordModal: false,
    });
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const {
      supplierCommon: { sourceDataSource = [], sourceDataPagation = {}, header = {} },
      fetchLoading,
      fetchHeaderLoading,
      dispatch,
    } = this.props;

    const { recordModal, deductionsId } = this.state;

    const headerInfoProps = {
      header,
      openOperationRecord: this.openOperationRecord,
    };
    const detailInfoProps = {
      loading: fetchLoading,
      pagination: sourceDataPagation,
      dataSource: sourceDataSource,
      handleSearch: this.fetchList,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      deductionsId,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord,
    };
    return (
      <Fragment>
        <Content>
          <Spin spinning={fetchHeaderLoading}>
            <HeaderInfo {...headerInfoProps} />
            <DeatilList {...detailInfoProps} />
            {recordModal && <HistoryList {...operationRecordProps} />}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
