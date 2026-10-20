/**
 * SupplierReviewList - 合格供应商评审入口
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { isEmpty, isUndefined, sum, isNumber } from 'lodash';
import { Table, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateTimeRender } from 'utils/renderer';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import FilterForm from './FilterForm';

const { TabPane } = Tabs;

/**
 * 合格供应商评审入口
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplierReview - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplierReview, loading, user }) => ({
  supplierReview,
  userId: user.currentUser.id,
  loading: loading.effects['supplierReview/querySupplierReview'],
  reviewedLoading: loading.effects['supplierReview/queryReviewedList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sslm.supplierReview'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_SEARCH',
    'SSLM.SUPPLIER_REVIEW.LIST.NOTREVIEW_LIST',
    'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_LIST',
  ],
})
export default class SupplierReviewList extends PureComponent {
  state = {};

  componentDidMount() {
    const {
      supplierReview: { pagination = {}, reviewedPagination = {} },
      location: { state: { _back } = {} },
      dispatch,
    } = this.props;
    this.init();
    const page = _back === -1 ? pagination : {};
    const reviewedPage = _back === -1 ? reviewedPagination : {};
    // 查询未评审
    this.handleEligibleSupplier(page);
    // 查询已评审
    this.handleReviewedSupplier(reviewedPage);
    // 清空详情页数据
    if (_back === -1) {
      dispatch({
        type: 'supplierReview/updateState',
        payload: {
          headerInfo: {},
          scoreInforDataSoruce: [],
          supplierClassificationData: [],
          reviewMaterialData: {},
          materialsCategoriesList: [],
          enclosureDataSource: [],
        },
      });
    }
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierReview/init',
    });
  }

  /**
   * 查询列表数据
   * @param {Number} [payload.page = 0] - 数据页码
   * @param {Number} [payload.size = 10] - 分页大小
   */
  @Bind()
  handleSearch() {
    // 查询未评审
    this.handleEligibleSupplier();
    // 查询已评审
    this.handleReviewedSupplier();
  }

  /**
   * 查询列表数据
   * @param {Number} [payload.page = 0] - 数据页码
   * @param {Number} [payload.size = 10] - 分页大小
   */
  @Bind()
  handleEligibleSupplier(payload = {}) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());

    const { releaseDateFrom, releaseDateTo, supplierNameLov, ...others } = filterValues;
    let startDate;
    let endDate;
    if (releaseDateFrom) {
      startDate = moment(releaseDateFrom).format(DEFAULT_DATETIME_FORMAT);
    }
    if (releaseDateTo) {
      endDate = moment(releaseDateTo).format(DEFAULT_DATETIME_FORMAT);
    }
    const newFilterValues = {
      ...others,
      releaseDateFrom: startDate,
      releaseDateTo: endDate,
    };
    dispatch({
      type: 'supplierReview/querySupplierReview',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        ...newFilterValues,
        customizeUnitCode: [
          'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_SEARCH',
          'SSLM.SUPPLIER_REVIEW.LIST.NOTREVIEW_LIST',
          'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_LIST',
        ].join(),
      },
    });
  }

  /**
   * 查询已评审列表数据
   * @param {Number} [payload.page = 0] - 数据页码
   * @param {Number} [payload.size = 10] - 分页大小
   */
  @Bind()
  handleReviewedSupplier(payload = {}) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());

    const { releaseDateFrom, releaseDateTo, supplierNameLov, ...others } = filterValues;
    let startDate;
    let endDate;
    if (releaseDateFrom) {
      startDate = moment(releaseDateFrom).format(DEFAULT_DATETIME_FORMAT);
    }
    if (releaseDateTo) {
      endDate = moment(releaseDateTo).format(DEFAULT_DATETIME_FORMAT);
    }
    const newFilterValues = {
      ...others,
      releaseDateFrom: startDate,
      releaseDateTo: endDate,
    };
    dispatch({
      type: 'supplierReview/queryReviewedList',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        reviewedFlag: 1,
        ...newFilterValues,
        customizeUnitCode: [
          'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_SEARCH',
          'SSLM.SUPPLIER_REVIEW.LIST.NOTREVIEW_LIST',
          'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_LIST',
        ].join(),
      },
    });
  }

  /**
   * tab 切换重渲染明细table
   */
  @Bind()
  handleTabChange(activeKey) {
    this.props.dispatch({
      type: 'supplierReview/updateState',
      payload: { activeKey },
    });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    // this.setState({ form: ref.props.form });
    this.filterForm = ref.props.form;
  }

  /**
   * 未评审跳转到明细
   * @param {*} record - 行数据
   */
  @Bind()
  handleSkipDetail(record, pageType) {
    const { requisitionId, stageCode } = record;
    this.props.history.push(
      `/sslm/eligible-supplier-review/detail/${requisitionId}?stageCode=${stageCode}&pageType=${pageType}`
    );
  }

  render() {
    const {
      loading,
      reviewedLoading,
      organizationId,
      userId,
      supplierReview: {
        code: { stageList = [] },
        requisitionDataSoruce = {},
        pagination = {},
        reviewedList = [],
        reviewedPagination = {},
        activeKey = 'unReview',
      },
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const filterProps = {
      userId,
      stageList,
      organizationId,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
      customizeFilterForm,
      custLoading,
      code: 'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_SEARCH',
    };
    const commonColumns = [
      {
        title: intl
          .get(`sslm.supplierReview.model.supplierReview.supplierCompanyNum`)
          .d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
      },
      {
        title: intl
          .get(`sslm.supplierReview.model.supplierReview.supplierCompanyName`)
          .d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.stageDescription`).d('当前阶段'),
        width: 100,
        dataIndex: 'stageDescription',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.targetStageDesc`).d('目标阶段'),
        width: 100,
        dataIndex: 'targetStageDescription',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.remark`).d('说明'),
        width: 200,
        dataIndex: 'remark',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.companyCode`).d('公司编码'),
        width: 120,
        dataIndex: 'companyNum',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.companyName`).d('公司名称'),
        width: 200,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.realName`).d('创建人'),
        width: 100,
        dataIndex: 'realName',
        render: (text, record) => (isEmpty(text) ? record.loginName : text),
      },
      {
        title: intl.get('hzero.common.date.creation').d('创建时间'),
        width: 120,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
    ];
    const unReviewColumns = [
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.qualifiedNumber`).d('申请单号'),
        width: 180,
        dataIndex: 'qualifiedNumber',
        render: (text, record) => (
          <a onClick={() => this.handleSkipDetail(record, 'edit')}>{text}</a>
        ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'processStatusMeaning',
      },
    ].concat(commonColumns);
    const reviewedColumns = [
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.qualifiedNumber`).d('申请单号'),
        width: 180,
        dataIndex: 'qualifiedNumber',
        render: (text, record) => (
          <a onClick={() => this.handleSkipDetail(record, 'view')}>{text}</a>
        ),
      },
    ].concat(commonColumns);
    const scrollX = sum(unReviewColumns.map((n) => (isNumber(n.width) ? n.width : 150)));
    const reviewedScrollX = sum(reviewedColumns.map((n) => (isNumber(n.width) ? n.width : 150)));
    return (
      <React.Fragment>
        <Header title={intl.get(`sslm.supplierReview.view.title.supplierReview`).d('供应商评审')} />
        <Content>
          <FilterForm {...filterProps} />
          <Tabs activeKey={activeKey} animated={false} onChange={this.handleTabChange}>
            <TabPane
              tab={intl.get('sslm.supplierReview.view.message.tab.unReview').d('未评审')}
              key="unReview"
            >
              {customizeTable(
                {
                  code: 'SSLM.SUPPLIER_REVIEW.LIST.NOTREVIEW_LIST',
                },
                <Table
                  bordered
                  scroll={{ x: scrollX }}
                  rowKey="requisitionId"
                  loading={loading}
                  dataSource={requisitionDataSoruce.content}
                  columns={unReviewColumns}
                  pagination={pagination}
                  onChange={this.handleEligibleSupplier}
                  custLoading={custLoading}
                />
              )}
            </TabPane>
            <TabPane
              tab={intl.get('sslm.supplierReview.view.message.tab.reviewed').d('已评审')}
              key="reviewed"
            >
              {customizeTable(
                {
                  code: 'SSLM.SUPPLIER_REVIEW.LIST.REVIEW_LIST',
                },
                <Table
                  bordered
                  scroll={{ x: reviewedScrollX }}
                  rowKey="requisitionId"
                  loading={reviewedLoading}
                  dataSource={reviewedList}
                  columns={reviewedColumns}
                  pagination={reviewedPagination}
                  onChange={this.handleReviewedSupplier}
                  custLoading={custLoading}
                />
              )}
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
