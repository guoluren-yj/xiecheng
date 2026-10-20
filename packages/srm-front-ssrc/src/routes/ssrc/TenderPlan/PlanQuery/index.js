/**
 * TenderPlanQuery -寻源计划查询
 * @date: 2019-4-16
 * @author YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';

import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { SRM_SSRC } from '_utils/config';

import { Header, Content } from 'components/Page';

import FilterList from './FilterList';
import TableList from './TableList';

@withCustomize({
  unitCode: ['SSRC.PLAN_QUERY_LIST.LIST_V2', 'SSRC.PLAN_QUERY_LIST.FILTER'],
})
@connect(({ tenderPlan, loading }) => ({
  tenderPlan,
  loading: loading.effects['tenderPlan/fetchPlansQueryList'],
}))
@formatterCollections({ code: ['ssrc.tenderPlan', 'ssrc.common'] })
export default class planList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
    };
  }

  form;

  componentDidMount () {
    this.fetchPlansList();
    this.batchCode();
  }

  /**
   * 查询寻源计划列表
   * @param {object} page  分页参数
   */
  @Bind()
  fetchPlansList (page = {}) {
    const { dispatch } = this.props;
    const { organizationId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'tenderPlan/fetchPlansQueryList',
      payload: {
        page: isEmpty(page) ? {} : page,
        ...fieldValues,
        organizationId,
        customizeUnitCode: 'SSRC.PLAN_QUERY_LIST.LIST_V2,SSRC.PLAN_QUERY_LIST.FILTER',
      },
    });
  }

  /**
   * 查询寻源方式值级
   */
  @Bind()
  batchCode () {
    const { dispatch } = this.props;
    const code = 'SSRC.BID_METHOD';
    dispatch({
      type: 'tenderPlan/batchSourceCode',
      payload: code,
    });
  }

  @Bind()
  handleRef (ref = {}) {
    this.form = (ref || {}).props.form;
  }

    /**
   * 获取form数据
   */
    @Bind()
    handleGetFormValue() {
      const { form } = this;
      const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
      const customizeData = {
        customizeUnitCode: 'SSRC.PLAN_QUERY_LIST.LIST_V2,SSRC.PLAN_QUERY_LIST.FILTER',
      };
      return { ...formValues, ...customizeData };
    }

  render () {
    const { organizationId } = this.state;
    const {
      tenderPlan: { planQueryList = [], planQueryPagination = {}, sourceTypeCode = [] },
      loading,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const filterProps = {
      customizeFilterForm,
      organizationId,
      sourceTypeCode,
      onRef: this.handleRef,
      onFetchPlans: this.fetchPlansList,
    };
    const tableProps = {
      customizeTable,
      list: planQueryList,
      loading,
      pagination: planQueryPagination,
      onFetchPlans: this.fetchPlansList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('ssrc.tenderPlan.view.message.title.tendersPlanQuery').d('寻源计划查询')}
        >
          <ExcelExportPro
            templateCode="SRM_C_SRM_SSRC_PROJECT_BID_PLAN_LN"
            requestUrl={`${SRM_SSRC}/v1/${organizationId}/bid-plan-line/export-bidPlanLn`}
            queryParams={this.handleGetFormValue()}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
            }}
          />
        </Header>
        <Content>
          <FilterList {...filterProps} />
          <TableList {...tableProps} />
        </Content>
      </React.Fragment>
    );
  }
}
