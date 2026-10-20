/**
 * ReviewList - 供货能力评审
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { dateRender } from 'utils/renderer';
import {
  createPagination,
  getCurrentOrganizationId,
  filterNullValueObject,
  getUserOrganizationId,
} from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import FilterForm from './FilterForm';

/**
 * 供货能力评审
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplyAbility - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplyAbility, loading, user }) => ({
  supplyAbility,
  userId: user.currentUser.id,
  organizationId: getCurrentOrganizationId(),
  userOrganizationId: getUserOrganizationId(),
  loading: loading.effects['supplyAbility/queryReviewList'],
}))
@formatterCollections({
  code: ['sslm.common', 'sslm.supplyAbility', 'sslm.supplierDocManage'],
})
@withCustomize({
  unitCode: ['SSLM.SUPPLIER_ABILITY_REVIEW.LIST', 'SSLM.SUPPLIER_ABILITY_REVIEW.SEARCH_FORM'],
})
export default class ReviewList extends PureComponent {
  state = {};

  componentDidMount() {
    const {
      supplyAbility: { reviewData = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = _back === -1 ? createPagination(reviewData) : {};
    this.queryStageList();
    this.handleSupplyAbility(page);
  }

  /**
   * 查询页面初始数据
   * @param {Object} payload 分页参数和表单对象
   */
  @Bind()
  handleSupplyAbility(payload) {
    const { dispatch, organizationId } = this.props;
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());

    const {
      startCreateDate,
      startUpdateDate,
      endCreateDate,
      endUpdateDate,
      supplierNameLov,
      ...others
    } = filterValues;
    let startDate;
    let endDate;
    let startUpdate;
    let endUpdate;
    if (startCreateDate) {
      startDate = moment(startCreateDate).format(DATETIME_MIN);
    }
    if (endCreateDate) {
      endDate = moment(endCreateDate).format(DATETIME_MAX);
    }
    if (startUpdateDate) {
      startUpdate = moment(startUpdateDate).format(DATETIME_MIN);
    }
    if (endUpdateDate) {
      endUpdate = moment(endUpdateDate).format(DATETIME_MAX);
    }
    const newFilterValues = {
      ...others,
      startCreateDate: startDate,
      endCreateDate: endDate,
      startUpdateDate: startUpdate,
      endUpdateDate: endUpdate,
    };
    dispatch({
      type: 'supplyAbility/queryReviewList',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        ...filterNullValueObject(newFilterValues),
        customizeUnitCode:
          'SSLM.SUPPLIER_ABILITY_REVIEW.LIST,SSLM.SUPPLIER_ABILITY_REVIEW.SEARCH_FORM',
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  queryStageList() {
    const { dispatch, organizationId } = this.props;
    // 查询lov值集
    dispatch({
      type: 'supplyAbility/queryStageList',
      payload: { lovCode: 'SSLM.LIFE_CYCLE_STAGE', organizationId },
    });
    // 查询独立值集
    const lovCode = {
      organizationId,
      statusList: 'SUPPLY_ABILITY_REVIEW_STATUS',
    };
    dispatch({
      type: 'supplyAbility/queryValueSet',
      payload: lovCode,
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
   * 跳转到详情页
   * @param {Number} supplyAbilityId 供货能力申请单Id
   */
  @Bind()
  handleGoDetail(supplyAbilityId) {
    this.props.history.push(`/sslm/supplier-ablility-review/detail/${supplyAbilityId}`);
  }

  render() {
    const {
      loading,
      organizationId,
      userOrganizationId,
      userId,
      supplyAbility: { reviewData = {}, stageList = [], code: { statusList = [] } = {} },
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const { content = [] } = reviewData;
    const filterProps = {
      userId,
      stageList,
      statusList,
      organizationId,
      userOrganizationId,
      onSearch: this.handleSupplyAbility,
      onRef: this.handleBindRef,
      customizeFilterForm,
      custLoading,
      code: 'SSLM.SUPPLIER_ABILITY_REVIEW.SEARCH_FORM',
    };
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'supplyAbilityStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        render: (text, record) => (
          <a onClick={() => this.handleGoDetail(record.supplyAbilityId)}>{text}</a>
        ),
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lifeCycleStage`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.company.name`).d('公司'),
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`sslm.common.view.creator.name`).d('创建人'),
        dataIndex: 'createUserName',
      },
      {
        title: intl.get(`hzero.common.date.creation`).d('创建日期'),
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        dataIndex: 'lastUpdateUserName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        dataIndex: 'lastUpdateDate',
        render: dateRender,
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.supplyAbility.view.message.title.review`).d('供货能力清单评审')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SSLM.SUPPLIER_ABILITY_REVIEW.LIST',
            },
            <Table
              bordered
              rowKey="supplyAbilityId"
              loading={loading}
              dataSource={content}
              columns={columns}
              pagination={createPagination(reviewData)}
              onChange={this.handleSupplyAbility}
            />
          )}
        </Content>
      </React.Fragment>
    );
  }
}
