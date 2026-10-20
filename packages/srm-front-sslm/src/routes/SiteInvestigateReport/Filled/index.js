/**
 * Filled - 已填制现场考察报告
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { isNumber, sum } from 'lodash';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import FilterForm from './FilterForm';
import '@/routes/index.less';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_FILLED_LIST.LIST',
    'SSLM_SITEINVESTIGATE_FILLED_LIST.SEARCH_FORM',
  ],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryFilledList'],
}))
export default class Filled extends Component {
  componentDidMount() {
    const {
      siteInvestigateReport: { filledListPagination = {} },
    } = this.props;
    this.init();
    this.handleQueryList(filledListPagination);
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const lovCodes = {
      evalStatus: 'SSLM.SITE_EVAL_STATUS',
      tenantId,
    };

    dispatch({
      type: 'siteInvestigateReport/init',
      payload: lovCodes,
    });
  }

  /**
   * 列表查询
   */
  @Bind()
  handleQueryList(page = {}) {
    const { dispatch } = this.props;
    const filterValue =
      this.filterForm && this.filterForm.props && this.filterForm.props.form.getFieldsValue();
    const creationDateFrom =
      filterValue.creationDateFrom && moment(filterValue.creationDateFrom).format(DATETIME_MIN);
    const creationDateTo =
      filterValue.creationDateTo && moment(filterValue.creationDateTo).format(DATETIME_MAX);

    dispatch({
      type: 'siteInvestigateReport/queryFilledList',
      payload: {
        page,
        ...filterValue,
        creationDateFrom,
        creationDateTo,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATE_FILLED_LIST.LIST,SSLM_SITEINVESTIGATE_FILLED_LIST.SEARCH_FORM',
      },
    });
  }

  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record) {
    const { history } = this.props;
    const { evalHeaderId } = record;
    history.push(`/sslm/site-investigate-report/filled/detail/${evalHeaderId}`);
  }

  render() {
    const {
      queryLoading,
      siteInvestigateReport: {
        filledList = [],
        filledListPagination = {},
        code: { evalStatus = [] } = {},
      },
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.siteInvestigateReport.modal.mange.scoreStatus`).d('评分状态'),
        dataIndex: 'scoreStatusMeaning',
        width: 120,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
        dataIndex: 'evalNum',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleJumpDetail(record)}>{value}</a>,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
        dataIndex: 'evalDescription',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.supplierName').d('供应商'),
        width: 200,
        dataIndex: 'supplierName',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.template').d('考察模板'),
        dataIndex: 'evalTplName',
        width: 200,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.score').d('得分'),
        width: 100,
        dataIndex: 'finalScore',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.grade').d('等级'),
        width: 100,
        dataIndex: 'grade',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间'),
        dataIndex: 'creationDate',
        width: 160,
        render: dateTimeRender,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人'),
        dataIndex: 'realName',
        width: 120,
      },
    ];
    const filterFormProps = {
      evalStatus,
      onSearch: this.handleQueryList,
      onRef: node => {
        this.filterForm = node;
      },
      customizeFilterForm,
      custLoading,
      code: 'SSLM_SITEINVESTIGATE_FILLED_LIST.SEARCH_FORM',
    };
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.siteInvestigateReport.view.filled.title').d('已填制现场考察报告')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {customizeTable(
            {
              code: 'SSLM_SITEINVESTIGATE_FILLED_LIST.LIST',
            },
            <Table
              bordered
              rowKey="evalHeaderId"
              columns={columns}
              loading={queryLoading}
              dataSource={filledList}
              scroll={{ x: scrollX, y: 'calc(100vh - 339px)' }}
              pagination={filledListPagination}
              onChange={this.handleQueryList}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
