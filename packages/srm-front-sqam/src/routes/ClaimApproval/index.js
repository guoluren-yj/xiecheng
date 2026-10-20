/**
 * 索赔单审批
 * @date: 2019-11-05
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import { createPagination } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import moment from 'moment';

import { DATETIME_MIN } from 'utils/constants';

import OperationRecord from '../components/OperationRecord/OperationRecord';

import FilterForm from './FilterForm';
import List from './List';

@connect(({ claimApproval, sqamCommon, loading }) => ({
  sqamCommon,
  claimApproval,
  fetchClaimLoading: loading.effects['claimApproval/fetchClaim'],
  fetchOperationRecordListLoading: loading.effects['sqamCommon/fetchOperationRecord'],
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.item',
    'hzero.common',
    'entity.roles',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.attachment',
  ],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SQAM.CLAIM_APPROVAL_LIST.FILTER'],
})
export default class ClaimApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      claimList: [],
      pagination: {},
      formHeaderId: null,
      operationRecordVisible: false,
    };
  }

  componentDidMount() {
    this.fetchClaim();
  }

  // 查询索赔单列表
  @Bind()
  fetchClaim(page = {}) {
    const {
      dispatch,
      form: { getFieldsValue = (e) => e },
    } = this.props;
    const values = this.handleFormQuery(getFieldsValue());
    dispatch({
      type: 'claimApproval/fetchClaim',
      payload: {
        page,
        ...values,
        customizeUnitCode: 'SQAM.CLAIM_APPROVAL_LIST.FILTER,SQAM.CLAIM_APPROVAL_LIST.GRID',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          claimList: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  // 跳转详情页
  @Bind()
  goDetail(formHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/sqam/claimApproval/detail',
        search: formHeaderId ? stringify({ formHeaderId }) : null,
      })
    );
  }

  // 操作记录弹窗显隐
  @Bind()
  operationRecord(visible, formHeaderId = null) {
    this.setState({
      operationRecordVisible: visible,
      formHeaderId,
    });
  }

  // 操作记录查询
  @Bind()
  fetchOperationRecord(page = {}) {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    dispatch({
      type: 'sqamCommon/fetchOperationRecord',
      payload: {
        page,
        formHeaderId,
      },
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item]
        ? moment(filterValues[item]).format(DATETIME_MIN)
        : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  render() {
    const { claimList, pagination, operationRecordVisible } = this.state;
    const {
      form,
      fetchClaimLoading,
      sqamCommon,
      fetchOperationRecordListLoading,
      customizeFilterForm,
    } = this.props;
    const { operationRecordList = [], operationRecordPagination = {} } = sqamCommon;
    const filterFormProps = {
      form,
      customizeFilterForm,
      fetchClaim: this.fetchClaim,
    };
    const listProps = {
      form,
      pagination,
      fetchClaimLoading,
      onChange: this.fetchClaim,
      goDetail: this.goDetail,
      dataSource: claimList,
      operationRecord: this.operationRecord,
    };
    const OperationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.operationRecord(false),
      visible: operationRecordVisible,
    };
    return (
      <Fragment>
        <Header title={intl.get('sqam.common.view.title.claimApproval').d('索赔单审批')} />
        <Content>
          <FilterForm {...filterFormProps} />
          <List {...listProps} />
        </Content>
        <OperationRecord {...OperationRecordProps} />
      </Fragment>
    );
  }
}
