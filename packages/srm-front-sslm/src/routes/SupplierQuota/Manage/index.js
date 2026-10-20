/**
 * Manage - 供应商配额管理
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { isEmpty, sum, isNumber, isNil } from 'lodash';
import { Form, Spin } from 'hzero-ui';
import querystring from 'querystring';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { dateTimeRender, dateRender } from 'utils/renderer';
import Checkbox from 'components/Checkbox';
import Table from 'srm-front-boot/lib/components/Table';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { Button as PerButton } from 'components/Permission';
import { dealCopy } from '@/services/supplierQuotaService';

import FilterForm from './FilterForm';
import HeaderBtns from './HeaderBtns';
import OperationRecords from './OperationRecords';

const customizeUnitCode = 'SSLM.SUPPLIER_QUOTA_MANAGE.LIST,SSLM.SUPPLIER_QUOTA_MANAGE.QUERY_LIST';

@formatterCollections({
  code: ['sslm.supplierQuotaManage'],
})
@connect(({ supplierQuota, loading }) => ({
  supplierQuota,
  allLoading:
    loading.effects['supplierQuota/fetchQuotaAsignList'] ||
    loading.effects['supplierQuota/fetchOperationRecords'] ||
    loading.effects['supplierQuota/unlock'] ||
    loading.effects['supplierQuota/handleBatchRelease'] ||
    loading.effects['supplierQuota/handleBatchForbidden'],
}))
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_QUOTA_MANAGE.LIST',
    'SSLM.SUPPLIER_QUOTA_MANAGE.QUERY_LIST',
    'SSLM.SUPPLIER_QUOTA_MANAGE.LIST.BTN_GROUP',
  ],
})
@remote({
  code: 'SSLM_SUPPLIER_QUOTA_LIST',
  name: 'supplierQuotaRemote',
})
export default class Manage extends Component {
  state = {
    operationRecordsVisible: false,
    selectedRows: [], // 选中的row
  };

  componentDidMount() {
    const {
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    this.init();
    this.handleList(quotaAsignManagePagination);
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    const payload = {
      statusList: 'SSLM.SUPPLIER_QUOTA_STATUS',
      enableList: 'HPFM.FLAG',
    };
    dispatch({
      type: 'supplierQuota/init',
      payload,
    });
  }

  @Bind()
  handleFilterFormRef(formRef) {
    this.filterFormRef = formRef;
  }

  @Bind()
  handleQueryParams() {
    const { form } = this.props;
    const { form: filterForm } = this.filterFormRef?.props || {};
    const filterFormValue = filterForm?.getFieldsValue() || {};
    const { createDateFrom: newStartDate, createDateTo: newEndDate } = filterFormValue;
    const createDateFrom = newStartDate && moment(newStartDate).format(DATETIME_MIN);
    const createDateTo = newEndDate && moment(newEndDate).format(DATETIME_MAX);
    const filterValue = form?.getFieldsValue() || {};
    return { ...filterValue, ...filterFormValue, createDateFrom, createDateTo, customizeUnitCode };
  }

  /**
   * 列表数据查询
   */
  @Bind()
  handleList(page = {}) {
    const { dispatch } = this.props;
    const formValues = this.handleQueryParams();
    dispatch({
      type: 'supplierQuota/fetchQuotaAsignList',
      payload: {
        page,
        ...formValues,
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    const { history } = this.props;
    history.push('/sslm/supplier-quota-manage/create');
  }

  /**
   * 导出参数
   */
  @Bind()
  handleParams() {
    const formValues = this.handleQueryParams();
    const filterValues = {
      ...formValues,
    };
    return filterNullValueObject(filterValues);
  }

  /**
   * 查询操作记录
   */
  @Bind()
  queryOperationRecords(page = {}) {
    const { dispatch } = this.props;
    const { quotaHeaderId } = this.state;
    dispatch({
      type: 'supplierQuota/fetchOperationRecords',
      payload: { quotaHeaderId, page },
    });
  }

  /**
   * 操作记录弹框
   */
  @Bind
  handleOperationRecords(record) {
    const { quotaHeaderId } = record;
    const { operationRecordsVisible } = this.state;
    this.setState({ operationRecordsVisible: !operationRecordsVisible, quotaHeaderId });
    if (!operationRecordsVisible) {
      const { dispatch } = this.props;
      dispatch({
        type: 'supplierQuota/fetchOperationRecords',
        payload: { quotaHeaderId },
      });
    }
  }

  /**
   * 跳转详情页
   */
  @Bind()
  handleJumpDetail(record, jumpType) {
    const { history } = this.props;
    const { quotaHeaderId, evalStatus, sourceDocUrl } = record;
    switch (jumpType) {
      case 'sourceNumber':
        history.push(`${sourceDocUrl}`);
        break;
      default:
        history.push(`/sslm/supplier-quota-manage/detail/${quotaHeaderId}/${evalStatus}`);
        break;
    }
  }

  /**
   * 解锁
   */
  @Bind()
  handleUnlock(record) {
    const { quotaHeaderId } = record;
    const {
      dispatch,
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    dispatch({
      type: 'supplierQuota/unlock',
      payload: { quotaHeaderId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleList(quotaAsignManagePagination);
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePublish(record) {
    const {
      dispatch,
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    const { quotaHeaderId } = record;
    dispatch({
      type: 'supplierQuota/linePublish',
      payload: { quotaHeaderId },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleList(quotaAsignManagePagination);
      }
    });
  }

  @Bind()
  handleBatchExport() {
    openTab({
      key: `/sslm/supplier-quota-manage/comment-import/SSLM.SUPPLIER_QUOTA_IMPORT`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        action: 'hzero.common.title.batchImport',
      }),
    });
  }

  /**
   * 启用／禁用
   */
  @Bind()
  handleEnable(record) {
    const {
      dispatch,
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    const { quotaHeaderId, enableFlag } = record;
    dispatch({
      type: 'supplierQuota/handleEnable',
      payload: { quotaHeaderId, enableFlag: enableFlag ? 0 : 1 },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleList(quotaAsignManagePagination);
      }
    });
  }

  /**
   * 隐藏历史版本的回调
   */
  @Bind()
  handleHistoryVersion(e) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ enableHistory: e.target.checked });
    this.handleList();
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 处理发布
   */
  @Bind()
  handleBatchRelease() {
    const {
      dispatch,
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    const { selectedRows } = this.state;
    if (!isEmpty(selectedRows)) {
      dispatch({
        type: 'supplierQuota/handleBatchRelease',
        payload: {
          selectedRows,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          this.setState({ selectedRows: [] });
          this.handleList(quotaAsignManagePagination);
          notification.success();
        }
      });
    }
  }

  // 复制
  @Bind()
  handleCopy(record) {
    Modal.confirm({
      children: intl
        .get(`sslm.supplierQuotaManage.view.message.copyConfirm`)
        .d('是否复制此单据生成一张新单据？'),
      onOk: () =>
        new Promise(() => {
          const { quotaHeaderId } = record;
          dealCopy({ quotaHeaderId }).then(respose => {
            const res = getResponse(respose);
            if (res) {
              notification.success();
              this.handleJumpDetail(res);
            }
          });
        }),
    });
  }

  // 批量禁用
  @Bind()
  handleBatchForbidden() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      supplierQuota: { quotaAsignManagePagination },
    } = this.props;
    const notLastRows = selectedRows.filter(rows => isNil(rows.maxSign));
    if (!isEmpty(notLastRows)) {
      notification.warning({
        message: intl
          .get('sslm.supplierQuotaManage.view.notification.disableMsg')
          .d('不允许禁用历史版本单据，请重新勾选！'),
      });
    } else {
      dispatch({
        type: 'supplierQuota/handleBatchForbidden',
        payload: {
          selectedRows,
          customizeUnitCode,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleList(quotaAsignManagePagination);
          this.setState({ selectedRows: [] });
        }
      });
    }
  }

  render() {
    const { operationRecordsVisible, selectedRows } = this.state;
    const {
      form,
      supplierQuotaRemote,
      supplierQuota: {
        code: { statusList = [], enableList = [] },
        quotaAsignManageList,
        quotaAsignManagePagination,
        operationRecordsList,
        operationRecordsPagination,
      },
      allLoading,
      customizeTable,
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
    } = this.props;
    const columns = [
      {
        dataIndex: 'quotaAgreementNum',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.agreementNo').d('配额协议号'),
        render: (val, record) => <a onClick={() => this.handleJumpDetail(record)}>{val}</a>,
      },
      {
        dataIndex: 'quotaAgreementDescription',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.agreementDesc').d('配额协议描述'),
      },
      {
        dataIndex: 'evalStatusMeaning',
        width: 100,
        title: intl.get('hzero.common.status').d('状态'),
      },
      {
        dataIndex: 'versionNum',
        width: 100,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.version').d('版本'),
      },
      {
        dataIndex: 'companyName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.company').d('公司'),
      },
      {
        dataIndex: 'ouName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.businessEntity').d('业务实体'),
      },
      {
        dataIndex: 'categoryCode',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.categoryCode').d('品类编码'),
      },
      {
        dataIndex: 'itemCategoryName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.categoryName').d('品类名称'),
      },
      {
        dataIndex: 'itemCode',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.itemCode').d('物料编码'),
      },
      {
        dataIndex: 'itemName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.itemName').d('物料名称'),
      },
      {
        dataIndex: 'effectiveDateFrom',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.isValidFrom').d('有效期从'),
        render: dateRender,
      },
      {
        dataIndex: 'effectiveDateTo',
        width: 120,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.isValidTo').d('有效期至'),
        render: dateRender,
      },
      {
        dataIndex: 'createName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.founder').d('创建人'),
      },
      {
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.creationTime').d('创建时间'),
      },
      {
        dataIndex: 'sourceDocType',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.sourceDocType').d('来源单据类型'),
        render: (val, record) => record.sourceDocTypeMeaning,
      },
      {
        dataIndex: 'sourceNumber',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.sourceNumber').d('来源单据编号'),
        render: (val, record) => (
          <a onClick={() => this.handleJumpDetail(record, 'sourceNumber')}>{val}</a>
        ),
      },
      {
        dataIndex: 'buyerName',
        width: 150,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.buyer').d('分管采购员'),
      },
      {
        dataIndex: 'option',
        width: 140,
        title: intl.get('hzero.common.button.action').d('操作'),
        render: (_, record) => (
          <Fragment>
            <PerButton
              type="text"
              style={{ marginRight: 16 }}
              onClick={() => this.handleCopy(record)}
            >
              {intl.get('hzero.common.button.copy').d('复制')}
            </PerButton>
            {record.maxSign && (
              <Fragment>
                <PerButton
                  type="text"
                  onClick={() => this.handleEnable(record)}
                  style={{ marginRight: 16, display: record.enableFlag ? 'inline-block' : 'none' }}
                  permissionList={[
                    {
                      code: `srm.partner.supplier-quota-manage.manage.ps.btn-disabled`,
                      type: 'button',
                      meaning: '禁用',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.disable').d('禁用')}
                </PerButton>
                <PerButton
                  type="text"
                  onClick={() => this.handleEnable(record)}
                  style={{ marginRight: 16, display: record.enableFlag ? 'none' : 'inline-block' }}
                  permissionList={[
                    {
                      code: `srm.partner.supplier-quota-manage.manage.ps.btn-enable`,
                      type: 'button',
                      meaning: '启用',
                    },
                  ]}
                >
                  {intl.get('hzero.common.status.enable').d('启用')}
                </PerButton>
              </Fragment>
            )}
            {record.maxSign && record.evalStatus === 'PUBLISHED' && (
              <PerButton
                type="text"
                onClick={() => this.handleUnlock(record)}
                permissionList={[
                  {
                    code: `srm.partner.supplier-quota-manage.manage.ps.btn-unlock`,
                    type: 'button',
                    meaning: '解锁',
                  },
                ]}
              >
                {intl.get('hzero.common.button.unlock').d('解锁')}
              </PerButton>
            )}
            {record.maxSign && record.evalStatus !== 'PUBLISHED' && (
              <PerButton
                type="text"
                onClick={() => this.handlePublish(record)}
                permissionList={[
                  {
                    code: `srm.partner.supplier-quota-manage.manage.ps.btn-feild-release`,
                    type: 'button',
                    meaning: '发布',
                  },
                ]}
              >
                {intl.get(`hzero.common.button.release`).d('发布')}
              </PerButton>
            )}
          </Fragment>
        ),
      },
      {
        dataIndex: 'operationRecords',
        width: 100,
        title: intl.get('sslm.supplierQuotaManage.modal.quota.operationRecords').d('操作记录'),
        render: (_, record) => (
          <a onClick={() => this.handleOperationRecords(record)}>
            {intl.get('sslm.supplierQuotaManage.modal.quota.operationRecords').d('操作记录')}
          </a>
        ),
      },
    ];
    const operationRecordsProps = {
      allLoading,
      visible: operationRecordsVisible,
      dataSource: operationRecordsList,
      pagination: operationRecordsPagination,
      onCancel: this.handleOperationRecords,
      onChange: this.queryOperationRecords,
    };
    const filterFormProps = {
      statusList,
      enableList,
      customizeFilterForm,
      code: 'SSLM.SUPPLIER_QUOTA_MANAGE.QUERY_LIST',
      onSearch: this.handleList,
      onRef: this.handleFilterFormRef,
    };
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.quotaHeaderId),
      selectedRows,
      onChange: this.handleSelectChange,
    };

    // const scrollY = window.innerHeight > 170 ? window.innerHeight - 170 : window.innerHeight;

    return (
      <Fragment>
        <Header
          title={intl
            .get('sslm.supplierQuotaManage.view.title.supplierQuotaManage')
            .d('供应商配额管理')}
        >
          <HeaderBtns
            loading={allLoading}
            selectedRows={selectedRows}
            customizeBtnGroup={customizeBtnGroup}
            onQuery={this.handleList}
            onCreate={this.handleCreate}
            queryParams={this.handleParams}
            onRelease={this.handleBatchRelease}
            onBatchExport={this.handleBatchExport}
            onBatchForbidden={this.handleBatchForbidden}
          />
          {supplierQuotaRemote &&
            supplierQuotaRemote.render('SSLM_SUPPLIER_QUOTA_LIST_HEADER_BTNS', null, {
              selectedRows,
              loading: allLoading,
              onQuery: this.handleList,
            })}
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <div className="table-list-search">
              <FilterForm {...filterFormProps} />
            </div>
            {form.getFieldDecorator('enableHistory', {
              initialValue: 1,
            })(
              <Checkbox style={{ marginBottom: 8 }} onChange={this.handleHistoryVersion}>
                {intl
                  .get('sslm.supplierQuotaManage.view.quota.hiddenHistoryVersion')
                  .d('隐藏历史版本')}
              </Checkbox>
            )}
            {customizeTable(
              {
                code: 'SSLM.SUPPLIER_QUOTA_MANAGE.LIST',
              },
              <Table
                bordered
                scroll={{
                  x: sum(columns.map(n => (isNumber(n.width) ? n.width : 150))),
                  y: 'calc(100vh - 370px)',
                }}
                rowKey="quotaHeaderId"
                columns={columns}
                dataSource={quotaAsignManageList}
                pagination={quotaAsignManagePagination}
                onChange={this.handleList}
                custLoading={custLoading}
                rowSelection={rowSelection}
              />
            )}
          </Spin>
        </Content>
        {operationRecordsVisible && <OperationRecords {...operationRecordsProps} />}
      </Fragment>
    );
  }
}
