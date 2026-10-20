/**
 * Result - 现场考察结果查询
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

import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import remote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';

import FilterForm from './FilterForm';
import '@/routes/index.less';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['sslm.common', 'sslm.siteInvestigateReport'],
})
@withCustomize({
  unitCode: [
    'SSLM_SITEINVESTIGATE_RESULT_LIST.LIST_INFO',
    'SSLM_SITEINVESTIGATE_RESULT_LIST.QUERY_INFO',
    'SSLM_SITEINVESTIGATE_RESULT_LIST.BTN_GROUP',
  ],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryResultList'],
}))
@remote({
  code: 'SSLM_SITE_REPORT_RESULT_LIST',
  name: 'resultListRemote',
})
export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // 选中行的key
      loading: false,
    };
  }

  componentDidMount() {
    const {
      siteInvestigateReport: { resultListPagination = {} },
    } = this.props;
    this.init();
    this.handleQueryList(resultListPagination);
  }

  // 改变loading
  @Bind()
  changeLoading(loading) {
    this.setState({ loading });
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
      type: 'siteInvestigateReport/queryResultList',
      payload: {
        page,
        ...filterValue,
        creationDateFrom,
        creationDateTo,
        customizeUnitCode:
          'SSLM_SITEINVESTIGATE_RESULT_LIST.LIST_INFO,SSLM_SITEINVESTIGATE_RESULT_LIST.QUERY_INFO',
      },
    });
  }

  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record) {
    const { history } = this.props;
    const { evalHeaderId, evalType, evalStatus } = record;
    history.push(
      `/sslm/site-investigate-report/result/detail/${evalHeaderId}/${evalType}/${evalStatus}`
    );
  }

  /**
   * 获取导出查询参数
   * @returns {Object}
   */
  @Bind()
  getExcelExportQueryParam() {
    if (this.filterForm) {
      const { props: { form: { getFieldsValue = e => e } = {} } = {} } = this.filterForm;
      const fieldsValue = getFieldsValue() || {};
      if (fieldsValue.creationDateFrom) {
        fieldsValue.creationDateFrom = moment(fieldsValue.creationDateFrom).format(DATETIME_MIN);
      }
      if (fieldsValue.creationDateTo) {
        fieldsValue.creationDateTo = moment(fieldsValue.creationDateTo).format(DATETIME_MAX);
      }
      return fieldsValue;
    }
    return {};
  }

  /**
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys) {
    const {
      dispatch,
      siteInvestigateReport: { resultList = [] },
    } = this.props;
    const newList = resultList.map(item => {
      const selected = selectedRowKeys.includes(item.evalHeaderId);
      if (selected) {
        return {
          ...item,
          selected: true,
        };
      }
      return {
        ...item,
        selected: false,
      };
    });
    this.setState({ selectedRowKeys });
    dispatch({
      type: 'siteInvestigateReport/updateState',
      payload: {
        resultList: newList,
      },
    });
  }

  render() {
    const {
      queryLoading,
      resultListRemote,
      siteInvestigateReport: {
        resultList = [],
        resultListPagination = {},
        code: { evalStatus = [] } = {},
      },
      customizeTable,
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
    } = this.props;
    const { loading } = this.state;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码'),
        dataIndex: 'evalNum',
        width: 150,
        render: (value, record) => <a onClick={() => this.handleJumpDetail(record)}>{value}</a>,
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述'),
        width: 150,
        dataIndex: 'evalDescription',
      },
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        width: 120,
        dataIndex: 'supplierCompanyNum',
        render: (value, record) => record.supplierNum,
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
        title: intl.get('sslm.siteInvestigateReport.view.title.inspectResults').d('考察结果'),
        width: 100,
        dataIndex: 'resultsFlagMeaning',
      },
      {
        title: intl.get('sslm.siteInvestigateReport.modal.mange.approvedDate').d('审批时间'),
        width: 160,
        dataIndex: 'approvedDate',
        render: dateTimeRender,
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
      {
        title: intl.get('sslm.common.view.creator.unitName').d('创建人部门'),
        dataIndex: 'unitName',
        width: 120,
      },
    ];

    const filterFormProps = {
      evalStatus,
      onSearch: this.handleQueryList,
      onRef: node => {
        this.filterForm = node;
      },
      code: 'SSLM_SITEINVESTIGATE_RESULT_LIST.QUERY_INFO',
      customizeFilterForm,
      custLoading,
    };

    const excelExportProps = {
      loading,
      requestUrl: `${SRM_SSLM}/v1/${tenantId}/site-eval-headers/result/export`,
      queryParams: this.getExcelExportQueryParam(),
      otherButtonProps: {
        type: 'c7n-pro',
        icon: 'unarchive',
        permissionList: [
          {
            code: 'srm.partner.site-investigate-report.result.ps.list.export.old',
            type: 'button',
            meaning: '现场考察报告查询-导出',
          },
        ],
      },
    };
    const buttons = [
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/site-eval-headers/result/export`,
          queryParams: () => this.getExcelExportQueryParam(),
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          otherButtonProps: {
            loading,
            permissionList: [
              {
                code: 'srm.partner.site-investigate-report.result.ps.list.export.new',
                type: 'button',
                meaning: '现场考察报告查询-导出',
              },
            ],
          },
          templateCode: 'SRM_C_SRM_SSLM_SITE_EVAL_HEADER_EXPORT',
        },
      },
      {
        name: 'export',
        btnComp: ExcelExport,
        btnProps: {
          ...excelExportProps,
        },
      },
    ];

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const resultListRemoteProps = {
      loading,
      setLoading: this.changeLoading,
      getQueryParams: this.getExcelExportQueryParam,
    };

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.siteInvestigateReport.view.result.title').d('现场考察报告查询')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEINVESTIGATE_RESULT_LIST.BTN_GROUP',
              // code: '',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
          {resultListRemote &&
            resultListRemote.render('SSLM_SITE_REPORT_RESULT_LIST_HEADER_BTN', <></>, {
              resultListRemoteProps,
            })}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {customizeTable(
            {
              code: 'SSLM_SITEINVESTIGATE_RESULT_LIST.LIST_INFO',
            },
            <Table
              bordered
              rowKey="evalHeaderId"
              columns={columns}
              loading={queryLoading}
              dataSource={resultList}
              scroll={{ x: scrollX, y: 'calc(100vh - 339px)' }}
              pagination={resultListPagination}
              onChange={this.handleQueryList}
              custLoading={custLoading}
              rowSelection={rowSelection}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
