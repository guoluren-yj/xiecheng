/**
 * NoConsignment - 开票申请单审核 - 非寄销
 * @date: 2018-12-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { yesOrNoRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';
// import qs from 'querystring';
import { dateRender } from 'utils/renderer';
import { thousandBitSeparator } from '@/routes/utils';
import QueryForm from './QueryForm';
import ActionHistory from '../Components/ActionHistory';
import ErrorsModal from './errors';

/**
 * 开票申请单审核
 * @extends {Component} - React.Component
 * @reactProps {Object} bill - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const { confirm } = Modal;
@connect(({ bill, loading }) => ({
  bill,
  fetchLoading: loading.effects['bill/fetchAuditNoConsignment'],
}))
@withRouter
@withCustomize({
  unitCode: ['SFIN.BILL_AUDIT_LIST.GRID'],
})
@CacheComponent({ cacheKey: '/sfin/bill-audit' })
export default class NoConsignment extends PureComponent {
  form;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      recordModal: false,
      errorsModal: false,
    };
  }

  componentDidMount() {
    const {
      bill: { auditNCPagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : auditNCPagination;
    this.fetchNoConsignment(page);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: { auditRows: [] },
    });
  }

  @Bind()
  onConfirm() {
    const {
      dispatch,
      bill: { auditRows = [] },
    } = this.props;
    const ecRows = auditRows.filter((item) => item.businessType === 'EC');
    if (auditRows.length <= 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    } else if (ecRows.length && ecRows.length !== auditRows.length) {
      // 勾选数据有电商和标准
      notification.warning({
        message: intl
          .get(`sfin.invoiceBill.view.message.differentBusinessType`)
          .d('当前勾选数据业务类别不一致，请分开勾选'),
      });
    } else if (ecRows.length === auditRows.length) {
      // 都是电商的数据
      confirm({
        title: intl.get(`hzero.common.view.message.title.modal.pass`).d('是否确认通过?'),
        onOk: () => {
          dispatch({
            type: 'bill/confirmEcBill',
            payload: {
              organizationId: getCurrentOrganizationId(),
              billHeaderList: auditRows.map((item) => item.billHeaderId),
            },
          }).then((res) => {
            if (res) {
              dispatch({
                type: 'bill/updateState',
                payload: { auditRows: [] },
              });
              this.refreshValue();
              notification.success();
            }
          });
        },
      });
    } else {
      confirm({
        title: intl.get(`hzero.common.view.message.title.modal.pass`).d('是否确认通过?'),
        onOk: () => {
          dispatch({
            type: 'bill/confirmValidateBill',
            payload: {
              organizationId: getCurrentOrganizationId(),
              billHeaderList: auditRows,
            },
          }).then((response) => {
            if (response?.validatedCode === 'INFO') {
              confirm({
                title: response.msg,
                // content: '',
                onOk: () => {
                  dispatch({
                    type: 'bill/confirmBill',
                    payload: {
                      organizationId: getCurrentOrganizationId(),
                      billHeaderList: auditRows,
                    },
                  }).then((res) => {
                    if (res) {
                      dispatch({
                        type: 'bill/updateState',
                        payload: { auditRows: [] },
                      });
                      this.refreshValue();
                      notification.success();
                    }
                  });
                },
              });
            }
            if (response?.validatedCode === 'SUCCESS') {
              dispatch({
                type: 'bill/confirmBill',
                payload: {
                  organizationId: getCurrentOrganizationId(),
                  billHeaderList: auditRows,
                },
              }).then((res) => {
                if (res) {
                  dispatch({
                    type: 'bill/updateState',
                    payload: { auditRows: [] },
                  });
                  this.refreshValue();
                  notification.success();
                }
              });
            }
            if (response?.validatedCode === 'WIATING_CONFIRM') {
              confirm({
                title: response.msg,
                onOk: () => {
                  dispatch({
                    type: 'bill/confirmBill',
                    payload: {
                      organizationId: getCurrentOrganizationId(),
                      billHeaderList: auditRows,
                    },
                  }).then((res) => {
                    if (res) {
                      dispatch({
                        type: 'bill/updateState',
                        payload: { auditRows: [] },
                      });
                      this.refreshValue();
                      notification.success();
                    }
                  });
                },
              });
            }
          });
        },
      });
    }
  }

  @Bind()
  onGoBack() {
    const {
      dispatch,
      bill: { auditRows = [] },
    } = this.props;
    const ecRows = auditRows.filter((item) => item.businessType === 'EC');
    if (auditRows.length <= 0) {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
    if (ecRows.length && ecRows.length !== auditRows.length) {
      // 勾选数据有电商和标准
      notification.warning({
        message: intl
          .get(`sfin.invoiceBill.view.message.differentBusinessType`)
          .d('当前勾选数据业务类别不一致，请分开勾选'),
      });
    } else {
      const ecFlag = ecRows.length === auditRows.length;
      confirm({
        title: intl.get(`hzero.common.view.message.title.modal.detail`).d('是否确认要退回?'),
        onOk: () => {
          dispatch({
            type: 'bill/rejectBill',
            payload: {
              organizationId: getCurrentOrganizationId(),
              billHeaderList: ecFlag ? auditRows.map((item) => item.billHeaderId) : auditRows,
              ecFlag,
            },
          }).then((res) => {
            if (res) {
              dispatch({
                type: 'bill/updateState',
                payload: { auditRows: [] },
              });
              this.refreshValue();
              notification.success();
            }
          });
        },
      });
    }
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRows 选中行
   */
  @Bind()
  onSelectChange(_, selectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/updateState',
      payload: { auditRows: selectedRows },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchNoConsignment(pageData = {}) {
    const { dispatch, onSetQueryValue } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
      submittedDateFrom:
        filterValues.submittedDateFrom && filterValues.submittedDateFrom.format(DATETIME_MIN),
      submittedDateTo:
        filterValues.submittedDateTo && filterValues.submittedDateTo.format(DATETIME_MAX),
    };
    if (onSetQueryValue) {
      onSetQueryValue(searchData);
    }
    dispatch({
      type: 'bill/fetchAuditNoConsignment',
      payload: {
        page: pageData,
        ...searchData,
        customizeUnitCode: ['SFIN.BILL_AUDIT_LIST.GRID', 'SFIN.BILL_AUDIT_LIST.FILTER'].join(),
      },
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchNoConsignment();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryNoConsignment(queryData = {}) {
    this.fetchNoConsignment(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchNoConsignment(pagination);
  }

  @Bind()
  onHandleFormReset() {
    const { onClearQueryValue } = this.props;
    if (onClearQueryValue) {
      onClearQueryValue();
    }
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 跳转路由
   * @param {Object} record 行数据
   */
  @Bind()
  handleGoDetail(record) {
    const { billHeaderId, sourceCode } = record;
    if (sourceCode === 'EC') {
      this.props.history.push(`/sfin/bill-audit/electronic-mall/${billHeaderId}`);
    } else {
      this.props.history.push(`/sfin/bill-audit/detail/${billHeaderId}`);
    }
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord(record) {
    this.setState(
      {
        recordModal: true,
        data: record,
      },
      () => {
        this.historyModal.handleSearch();
      }
    );
  }

  /**
   * 打开错误记录弹出框
   */
  @Bind()
  openErrorRecord() {
    this.setState(
      {
        errorsModal: true,
      },
      () => {
        this.errorsRecordModal.handleSearch();
      }
    );
  }

  /**
   * hideOperationRecord - 关闭操作记录弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState(
      {
        recordModal: false,
      },
      () => {
        this.historyModal.closeSearch();
      }
    );
  }

  /**
   * 关闭错误记录弹出框
   */
  @Bind()
  closeOperationRecord() {
    this.setState(
      {
        errorsModal: false,
      },
      () => {
        this.errorsRecordModal.closeSearch();
      }
    );
  }

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  onRefErrors(ref) {
    this.errorsRecordModal = ref;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      bill: { auditNCDataSource = {}, auditNCPagination = {}, auditRows = [] },
      customizeTable,
      fetchLoading,
      dispatch,
    } = this.props;
    const { recordModal, data, errorsModal } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const errorsRecordProps = {
      dispatch,
      visible: errorsModal,
      data,
      onRef: this.onRefErrors,
      hideModal: this.closeOperationRecord.bind(this),
    };
    const columns = [
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号'),
        dataIndex: 'displayBillNum',
        width: 200,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record)}>{text}</a>,
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'billStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierNum').d('供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierName').d('供应商名称'),
        dataIndex: 'supplierName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierSiteName').d('供应商地点'),
        dataIndex: 'supplierSiteName',
        width: 150,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.netAmount').d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
        width: 150,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.taxIncludedAmount').d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
        width: 150,
        render: (val, record) => {
          return record.priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(val, record.amountPrecision);
        },
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.currencyCode').d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get('entity.company.tag').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.ouName').d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName').d('采购组织'),
        dataIndex: 'organizationName',
        width: 120,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.supplierCreateFlag').d('供应商创建'),
        dataIndex: 'supplierCreateFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.createName').d('创建人'),
        dataIndex: 'createdByName',
        width: 100,
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.submittedDate').d('提交日期'),
        dataIndex: 'submittedDate',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'actionRecord',
        width: 100,
        render: (val, record) => (
          <a onClick={() => this.openOperationRecord(record)}>
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get('sfin.invoiceBill.model.invoiceBill.dataSource').d('数据来源'),
        dataIndex: 'sourceCodeMeaning',
        width: 120,
      },
    ];

    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: auditRows.map((n) => n.billHeaderId),
    };

    return (
      <React.Fragment>
        <QueryForm
          onQueryNoConsignment={this.onQueryNoConsignment}
          onHandleFormReset={this.onHandleFormReset}
          onRef={this.handleBindRef}
        />
        {customizeTable(
          {
            code: 'SFIN.BILL_AUDIT_LIST.GRID',
          },
          <Table
            bordered
            loading={fetchLoading}
            rowKey="billHeaderId"
            dataSource={auditNCDataSource.content}
            columns={columns}
            pagination={auditNCPagination}
            scroll={{ x: '2000px' }}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
          />
        )}
        <ActionHistory {...operationRecordProps} />
        <ErrorsModal {...errorsRecordProps} />
      </React.Fragment>
    );
  }
}
