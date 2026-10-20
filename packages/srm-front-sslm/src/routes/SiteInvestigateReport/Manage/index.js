/**
 * Manage - 现场考察报告管理
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { isNumber, sum, isArray, isEmpty } from 'lodash';
import { SRM_SSLM } from '_utils/config';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Modal } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import React, { Component, Fragment } from 'react';
import { Button as PerButton } from 'components/Permission';
import CommonImport from 'components/Import';

import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import Table from 'srm-front-boot/lib/components/Table';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { checkPermission } from 'services/api';

import { dealCopy } from '@/services/siteInvestigateReportService';
import FilterForm from './FilterForm';

const tenantId = getCurrentOrganizationId();

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@withCustomize({
  unitCode: [
    'SSLM_SITEVISITREPORTMANAGEMENTLIST.LIST_INFO',
    'SSLM_SITEVISITREPORTMANAGEMENTLIST.QUERY_INFO',
    'SSLM_SITEVISITREPORTMANAGEMENTLIST.BTN_GROUP',
  ],
})
@connect(({ siteInvestigateReport, loading }) => ({
  siteInvestigateReport,
  queryLoading: loading.effects['siteInvestigateReport/queryManageList'],
  invalidLoading: loading.effects['siteInvestigateReport/listInvalid'],
  deleteLoading: loading.effects['siteInvestigateReport/listDelete'],
}))
export default class Manage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // 选中行的key
      selectedRows: [],
      isCopyFlag: false,
    };
  }

  componentDidMount() {
    const {
      siteInvestigateReport: { manageListPagination = {} },
    } = this.props;
    this.init();
    this.handleQueryList(manageListPagination);
    this.handlePermissionButton();
  }

  /**
   * 手动查询权限集
   */
  @Bind()
  handlePermissionButton() {
    checkPermission(['srm.partner.site-investigate-report.manage.ps.button.copy']).then(
      response => {
        const res = getResponse(response);
        if (res && isArray(res)) {
          const { approve } = res[0];
          this.setState({
            isCopyFlag: approve,
          });
        }
      }
    );
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
   * 选中项发生改变的回调
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    const {
      dispatch,
      siteInvestigateReport: { manageList = [] },
    } = this.props;
    const newList = manageList.map(item => {
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
    this.setState({ selectedRowKeys, selectedRows });
    dispatch({
      type: 'siteInvestigateReport/updateState',
      payload: {
        manageList: newList,
      },
    });
  }

  // 获取查询参数
  @Bind()
  getQueryParam() {
    const filterValue =
      this.filterForm && this.filterForm.props && this.filterForm.props.form.getFieldsValue();
    const creationDateFrom =
      filterValue.creationDateFrom && moment(filterValue.creationDateFrom).format(DATETIME_MIN);
    const creationDateTo =
      filterValue.creationDateTo && moment(filterValue.creationDateTo).format(DATETIME_MAX);
    return filterNullValueObject({ ...filterValue, creationDateFrom, creationDateTo });
  }

  /**
   * 列表查询
   */
  @Bind()
  handleQueryList(page = {}) {
    const { dispatch } = this.props;
    const filterValue = this.getQueryParam();

    dispatch({
      type: 'siteInvestigateReport/queryManageList',
      payload: {
        page,
        ...filterValue,
        customizeUnitCode:
          'SSLM_SITEVISITREPORTMANAGEMENTLIST.LIST_INFO,SSLM_SITEVISITREPORTMANAGEMENTLIST.QUERY_INFO',
      },
    });
  }

  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record) {
    const { history } = this.props;
    const { evalHeaderId, evalType } = record;
    history.push(`/sslm/site-investigate-report/manage/detail/${evalHeaderId}/${evalType}`);
  }

  /**
   * 新建
   */
  @Bind()
  handleJumpAdd() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/site-investigate-report/manage/create`,
      })
    );
  }

  /**
   * 作废
   */
  @Bind()
  handleInvalid() {
    const {
      dispatch,
      siteInvestigateReport: { manageListPagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.destroyConfirm').d('确认作废？'),
      onOk: () => {
        dispatch({
          type: 'siteInvestigateReport/listInvalid',
          payload: {
            params: selectedRowKeys,
            customizeUnitCode:
              'SSLM_SITEVISITREPORTMANAGEMENTLIST.LIST_INFO,SSLM_SITEVISITREPORTMANAGEMENTLIST.QUERY_INFO',
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleQueryList(manageListPagination);
            this.setState({ selectedRowKeys: [] });
          }
        });
      },
    });
  }

  // 删除
  @Bind()
  handleDelete() {
    const {
      dispatch,
      siteInvestigateReport: { manageListPagination = {} },
    } = this.props;
    const { selectedRowKeys } = this.state;
    Modal.confirm({
      title: intl.get('sslm.siteInvestigateReport.view.message.deleteConfirm').d('确认删除？'),
      onOk: () => {
        dispatch({
          type: 'siteInvestigateReport/listDelete',
          payload: {
            params: selectedRowKeys,
            customizeUnitCode:
              'SSLM_SITEVISITREPORTMANAGEMENTLIST.LIST_INFO,SSLM_SITEVISITREPORTMANAGEMENTLIST.QUERY_INFO',
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleQueryList(manageListPagination);
            this.setState({ selectedRowKeys: [] });
          }
        });
      },
    });
  }

  // 复制
  @Bind
  handleCopy(record) {
    C7nModal.confirm({
      children: intl
        .get(`sslm.siteInvestigateReport.view.message.copyConfirm`)
        .d('是否复制此单据生成一张新单据？'),
      onOk: () =>
        new Promise(() => {
          const { evalHeaderId } = record;
          dealCopy({ evalHeaderId }).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              this.handleJumpDetail(res);
            }
          });
        }),
    });
  }

  render() {
    const { selectedRows, isCopyFlag } = this.state;
    const {
      queryLoading,
      customizeTable,
      customizeFilterForm,
      custLoading,
      invalidLoading,
      deleteLoading,
      siteInvestigateReport: {
        manageList = [],
        manageListPagination = {},
        code: { evalStatus = [] } = {},
      },
      customizeBtnGroup,
    } = this.props;
    const columns = [
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'evalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 100,
        render: (_, record) =>
          isCopyFlag && (
            <a onClick={() => this.handleCopy(record)}>
              {intl.get('hzero.common.button.copy').d('复制')}
            </a>
          ),
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
        width: 200,
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

    const buttons = [
      {
        name: 'create',
        btnProps: {
          icon: 'plus',
          type: 'primary',
          onClick: () => this.handleJumpAdd(),
        },
        child: intl.get('hzero.common.button.create').d('新建'),
      },
      {
        name: 'invalid',
        btnComp: PerButton,
        btnProps: {
          icon: 'close',
          disabled: isEmpty(selectedRows),
          loading: invalidLoading,
          onClick: () => this.handleInvalid(),
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.botton.delete',
              type: 'button',
              meaning: '现场考察报告管理-作废',
            },
          ],
        },
        child: intl.get('sslm.siteInvestigateReport.view.button.invalid').d('作废'),
      },
      {
        name: 'delete',
        btnComp: PerButton,
        btnProps: {
          permissionList: [
            {
              code: 'srm.partner.site-investigate-report.manage.ps.button.new.delete',
              type: 'button',
              meaning: '删除',
            },
          ],
          disabled:
            selectedRows.length === 0 || selectedRows.findIndex(o => o.evalStatus !== 'NEW') !== -1,
          icon: 'delete',
          loading: deleteLoading,
          onClick: () => this.handleDelete(),
        },
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      {
        name: 'batchImport',
        btnComp: CommonImport,
        child: intl.get('hzero.common.title.batchImport').d('批量导入'),
        btnProps: {
          refreshButton: true,
          prefixPatch: SRM_SSLM,
          businessObjectTemplateCode: 'SSLM.BATCH_IMPORT_SITE_EVAL_HEADER',
          buttonProps: {
            type: 'c7n-pro',
            icon: 'archive',
            permissionList: [
              {
                code: 'srm.partner.site-investigate-report.manage.ps.button.batch_import',
                type: 'button',
                meaning: '现场考察报告管理-批量导入按钮',
              },
            ],
          },
        },
      },
      {
        name: 'exportPro',
        btnComp: ExcelExportPro,
        btnProps: {
          requestUrl: `${SRM_SSLM}/v1/${tenantId}/site-eval-headers/export`,
          queryParams: () => this.getQueryParam(),
          buttonText: intl.get('hzero.common.button.newExport').d('(新)导出'),
          otherButtonProps: {
            permissionList: [
              {
                code: 'srm.partner.site-investigate-report.manage.button.ps.list.export',
                type: 'button',
                meaning: '现场考察报告管理-导出',
              },
            ],
          },
          templateCode: 'SRM_C_SRM_SSLM_SITE_EVAL_MANAGE_EXPORT',
        },
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.handleRowSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: [
            'BACK',
            'PUBLISHED',
            'SYSTEM_PROCESSING',
            'APPROVALING',
            'NEW_APPROVALING',
            'FEEDBACK_APPROVALING',
            'DISCARDED',
          ].includes(record.evalStatus),
        };
      },
    };

    const filterFormProps = {
      evalStatus,
      onSearch: this.handleQueryList,
      onRef: node => {
        this.filterForm = node;
      },
      customizeFilterForm,
      code: 'SSLM_SITEVISITREPORTMANAGEMENTLIST.QUERY_INFO',
      custLoading,
    };

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));

    return (
      <Fragment>
        <Header
          title={intl.get('sslm.siteInvestigateReport.view.manage.title').d('现场考察报告管理')}
        >
          {customizeBtnGroup(
            {
              code: 'SSLM_SITEVISITREPORTMANAGEMENTLIST.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons buttons={buttons} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterFormProps} />
          </div>
          {customizeTable(
            {
              code: 'SSLM_SITEVISITREPORTMANAGEMENTLIST.LIST_INFO',
            },
            <Table
              bordered
              rowKey="evalHeaderId"
              columns={columns}
              loading={queryLoading}
              dataSource={manageList}
              rowSelection={rowSelection}
              pagination={manageListPagination}
              onChange={this.handleQueryList}
              custLoading={custLoading}
              scroll={{ x: scrollX, y: 'calc(100vh - 339px)' }}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}
