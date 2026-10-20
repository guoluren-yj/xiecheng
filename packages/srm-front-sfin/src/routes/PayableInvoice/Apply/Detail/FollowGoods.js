/**
 * FollowGoodsInvoice - 应付发票申请 - 随货开票明细
 * @date: 2019-02-21
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Spin, Collapse, Icon, Modal, Tabs, InputNumber, Form } from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import moment from 'moment';

import { Header, Content } from 'components/Page';
import Upload from 'components/Upload';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_FINANCE } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import EditTable from 'components/EditTable';
import remote from 'hzero-front/lib/utils/remote';
import { dateTimeRender } from 'utils/renderer';

import { thousandsRender } from '@/utils/utils';
import FollowGoodsForm from './FollowGoodsForm';
import FollowGoodsInvoiceForm from './FollowGoodsInvoiceForm';
import ActionHistory from '../../../Invoice/Components/ActionHistory';
import ElectTaxInvoiceLine from '../../../Invoice/Components/ElectTaxInvoiceLine.js';
import TaxElectInvoiceTable from '../../../Invoice/Components/TaxElectInvoiceTable.js';
import Change from '../../../components/ChangeFormItem';
import styles from '../../index.less';
// import { thousandBitSeparator, thousandBitSeparatorDJ } from '@/routes/utils';

const { confirm } = Modal;
const { TabPane } = Tabs;
const promptCode = 'sfin.payableInvoice';

/**
 * 随货开票
 * @extends {Component} - Component
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@remote({
  code: 'SFIN_INVOICE_SUMMARY_READ_ONLY_FOLLOWGOODS_DETAIL_CUX',
  name: 'remote',
})
@connect(({ payableInvoice, loading }) => ({
  payableInvoice,
  loading:
    loading.effects['payableInvoice/fetchInvoiceHeaderPurchaser'] ||
    loading.effects['payableInvoice/fetchInvoiceLinePurchaser'],
  deleting: loading.effects['payableInvoice/deletePayableInvoice'],
  saving: loading.effects['payableInvoice/savePayableInvoice'],
  submitting: loading.effects['payableInvoice/submitPayableInvoice'],
  confirmLoading: loading.effects['invoice/confirm'],
  rejectLoading: loading.effects['invoice/reject'],
}))
@formatterCollections({
  code: ['entity.item', 'sfin.payableInvoice', 'sfin.invoiceBill'],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE'],
})
export default class FollowGoodsInvoice extends Component {
  constructor(props) {
    const {
      match: {
        path,
        params: { invoiceHeaderId },
      },
    } = props;
    super(props);
    const pathArray = path.split('/');
    this.state = {
      invoiceHeaderId,
      tenantId: getCurrentOrganizationId(),
      attachmentUUID: null,
      backPath: `/sfin/${pathArray[2]}/list`,
      isEdit: pathArray[3] !== 'read-only-followGoodsDetail',
      isSupplier: pathArray[2] === 'invoice-supplier',
      recordModal: false,
      collapseKeys: {},
      routeSource: pathArray[2],
    };
    const Change_ = Change('taxInvoiceLineId');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isSave = Change_.isSave;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  componentDidMount() {
    const { isSupplier } = this.state;
    if (isSupplier) {
      this.handelSearchSupplier();
    } else {
      this.handelSearchPurchaser();
    }
  }

  /**
   * 查询集中发票明细 头
   */
  @Bind()
  handelSearchPurchaser(flag) {
    const { invoiceHeaderId } = this.state;
    const {
      dispatch,
      payableInvoice: { [invoiceHeaderId]: { purchaserLinePagination = {} } = {} },
    } = this.props;
    dispatch({
      type: 'payableInvoice/fetchInvoiceHeaderPurchaser',
      payload: {
        invoiceHeaderId,
        customizeUnitCode: [
          'SFIN.INVOICE_SUMMARY_DETAIL.CENTRALIZED_BASIC',
          'SFIN.INVOICE_EC_UPDATE_DETAIL.BASIC_INFO',
        ].join(),
      },
    });
    if (!flag) {
      this.handelSearchPurchaserLine(purchaserLinePagination);
    }
  }

  /**
   * 查询集中发票明细 行
   * @param {Object} page 分页参数
   */
  @Bind()
  handelSearchPurchaserLine(page = {}) {
    const { dispatch } = this.props;
    const { invoiceHeaderId } = this.state;
    dispatch({
      type: 'payableInvoice/fetchInvoiceLinePurchaser',
      payload: {
        page,
        invoiceHeaderId,
        customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
      },
    });
  }

  /**
   * 查询集中发票明细 头 - 供应商
   */
  @Bind()
  handelSearchSupplier() {
    const { invoiceHeaderId } = this.state;
    const {
      dispatch,
      payableInvoice: { [invoiceHeaderId]: { supplierLinePagination = {} } = {} },
    } = this.props;
    dispatch({
      type: 'payableInvoice/fetchInvoiceHeaderSupplier',
      payload: invoiceHeaderId,
    });
    this.handelSearchSupplierLine(supplierLinePagination);
  }

  /**
   * 查询集中发票明细 行 - 供应商
   * @param {Object} page 分页参数
   */
  @Bind()
  handelSearchSupplierLine(page = {}) {
    const { dispatch } = this.props;
    const { invoiceHeaderId } = this.state;
    dispatch({
      type: 'payableInvoice/fetchInvoiceLineSupplier',
      payload: {
        page,
        invoiceHeaderId,
      },
    });
  }

  /**
   * 保存或提交
   * @param {Boolean} flag true - 保存
   */
  @Bind()
  @Throttle(1000)
  handleSaveOrSubmit(flag, info) {
    const { invoiceHeaderId, attachmentUUID, backPath } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: {
        [invoiceHeaderId]: { purchaserHeaderInfo = {}, purchaserLineList = [] } = {},
      },
    } = this.props;
    const form = this.filterForm || {};
    form.validateFields((err, formData) => {
      if (!err) {
        const lines = getEditTableData(purchaserLineList, []);
        const data = {
          ...purchaserHeaderInfo,
          ...formData,
          taxInvoiceDateIssued:
            formData.taxInvoiceDateIssued &&
            moment(formData.taxInvoiceDateIssued).format('YYYY-MM-DD 00:00:00'),
          attachmentUuid: attachmentUUID,
          // 如果是电商开票异常税额可编辑
          invoiceLines:
            info?.invoiceStatus === 'EC_INVOICE_EXCEPTION'
              ? lines.length === 0
                ? purchaserLineList
                : lines
              : purchaserLineList,
        };
        if (flag) {
          dispatch({
            type: 'payableInvoice/savePayableInvoice',
            payload: data,
          }).then((res) => {
            if (res) {
              notification.success();
              this.handelSearchPurchaser();
            }
          });
        } else {
          confirm({
            title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交？'),
            onOk: () => {
              dispatch({
                type: 'payableInvoice/submitPayableInvoice',
                payload: data,
              }).then((res) => {
                if (res) {
                  notification.success();
                  history.push(backPath);
                }
              });
            },
          });
        }
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  @Throttle(1000)
  handleDelete() {
    const { dispatch, history } = this.props;
    const { invoiceHeaderId, backPath } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除？'),
      onOk: () => {
        dispatch({
          type: 'payableInvoice/deletePayableInvoice',
          payload: invoiceHeaderId,
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(backPath);
          }
        });
      },
    });
  }

  @Bind()
  afterOpenUploadModal(attachmentUUID) {
    this.setState({
      attachmentUUID,
    });
  }

  /**
   * 计算table列宽度
   * @param {Array} columns 列
   * @param {Number} fixWidth 固定列宽度
   */
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.filterForm = ref.props.form;
  }

  /**
   * openOperationRecord - 打开操作记录弹窗
   */
  @Bind()
  openOperationRecord() {
    this.setState(
      {
        recordModal: true,
      },
      () => {
        this.historyModal.handleSearch();
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
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(arr, key) {
    const { collapseKeys } = this.state;
    this.setState({
      collapseKeys: {
        ...collapseKeys,
        [key]: arr,
      },
    });
  }

  /**
   * 发票复核确认
   */
  @Bind()
  @Throttle(1000)
  confirm() {
    const { invoiceHeaderId, isSupplier } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: { [invoiceHeaderId]: { purchaserLineList = [], supplierLineList = [] } = {} },
    } = this.props;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const invoiceLines = getEditTableData(dataSource, ['_status']);
    confirm({
      title: intl.get(`${promptCode}.view.message.title.modal.pass`).d('是否确认通过?'),
      onOk() {
        dispatch({
          type: 'invoice/confirm',
          payload: {
            type: 'review',
            body: [{ invoiceHeaderId, reviewedRemark: null, invoiceLines }],
            customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(`/sfin/invoice-review/list`);
          }
        });
      },
    });
  }

  /**
   * 复核退回
   */
  @Bind()
  @Throttle(1000)
  reject() {
    const { invoiceHeaderId, isSupplier } = this.state;
    const {
      dispatch,
      history,
      payableInvoice: { [invoiceHeaderId]: { purchaserLineList = [], supplierLineList = [] } = {} },
    } = this.props;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const invoiceLines = getEditTableData(dataSource, ['_status']);
    confirm({
      title: intl.get(`${promptCode}.view.message.title.modal.detail`).d('是否确认要退回?'),
      onOk() {
        dispatch({
          type: 'invoice/reject',
          payload: {
            type: 'review',
            body: [{ invoiceHeaderId, reviewedRemark: null, invoiceLines }],
            customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            history.push(`/sfin/invoice-review/list`);
          }
        });
      },
    });
  }

  render() {
    const {
      isEdit,
      isSupplier,
      backPath,
      tenantId,
      invoiceHeaderId,
      recordModal,
      collapseKeys,
      routeSource,
    } = this.state;
    const {
      loading,
      deleting,
      saving,
      submitting,
      dispatch,
      confirmLoading,
      rejectLoading,
      customizeTable,
      payableInvoice: {
        [invoiceHeaderId]: {
          purchaserHeaderInfo = {},
          purchaserLineList = [],
          purchaserLinePagination = {},
          supplierHeaderInfo = {},
          supplierLineList = [],
          supplierLinePagination = {},
        } = {},
      },
      remote: remoteProps,
    } = this.props;

    const headerInfo = isSupplier ? supplierHeaderInfo : purchaserHeaderInfo;
    const dataSource = isSupplier ? supplierLineList : purchaserLineList;
    const pagination = isSupplier ? supplierLinePagination : purchaserLinePagination;
    const showTaxLine = ['invoice-summary', 'invoice-supplier', 'invoice-review'].includes(
      routeSource
    );
    const uploadProps = {
      tenantId,
      btnProps: { icon: 'upload' },
      attachmentUUID: headerInfo.attachmentUuid,
      afterOpenUploadModal: this.afterOpenUploadModal,
    };
    const uploadReadOnlyProps = {
      tenantId,
      viewOnly: true,
      btnProps: { icon: 'upload', type: 'primary' },
      attachmentUUID: headerInfo.attachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sfin-file-bucket',
    };
    const followGoodsFormProps = {
      isEdit,
      headerInfo,
      onRef: this.handleBindRef,
    };
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      onRef: (ref) => {
        this.historyModal = ref;
      },
      hideModal: this.hideOperationRecord,
    };
    const { amountPrecision, pricePrecision, invoiceStatus } = headerInfo;
    const taxTicketTableProps = {
      amountPrecision,
      pricePrecision,
      tenantId,
      invoiceHeaderId,
      fetchHeader: this.handelSearchPurchaser,
      wrappedComponentRef: (node) => {
        this.list = node;
      },
      onRef: (ref) => {
        this.taxTicketTableRef = ref;
      },
      setUpdate: this.setUpdate,
      headerInfo,
      isSave: this.isSave,
      ChangeFormItem: this.ChangeFormItem,
      routeSource,
      remoteProps,
      remoteCode: 'SFIN_INVOICE_SUMMARY_READ_ONLY_FOLLOWGOODS_DETAIL_CUX_TAXINVOICE_COLUMNS',
    };
    const requestUrl = isSupplier
      ? `${SRM_FINANCE}/v1/${tenantId}/invoice-line/supplier/${invoiceHeaderId}/export`
      : `${SRM_FINANCE}/v1/${tenantId}/invoice-line/${invoiceHeaderId}/export`;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.payableInvoice.invoiceLineNum`).d('发票行号'),
        dataIndex: 'invoiceLineNum',
        fixed: 'left',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductNum`).d('商品编码'),
        dataIndex: 'ecProductNum',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecProductName`).d('商品名称'),
        dataIndex: 'ecProductName',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesNum`).d('物料编码'),
        dataIndex: 'itemCode',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.suppliesName`).d('物料名称'),
        dataIndex: 'itemName',
        fixed: 'left',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierItemDesc`).d('供应商料号描述'),
        dataIndex: 'supplierItemDesc',
        width: 180,
      },
      {
        title: intl.get(`${promptCode}.model.specificationsAndModel`).d('规格型号'),
        dataIndex: 'specificationsAndModel',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.unit`).d('单位'),
        dataIndex: 'uom',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.quantity`).d('本次开票数量'),
        dataIndex: 'quantity',
        width: 120,
        render: thousandsRender,
        // render: (text) => thousandBitSeparator(Number(text)),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.netPrice`).d('不含税单价'),
        dataIndex: 'netPrice',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparatorDJ(Number(text), record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.netAmount`).d('不含税金额'),
        dataIndex: 'netAmount',
        align: 'right',
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        align: 'right',
        render: (val, record) =>
          invoiceStatus === 'EC_INVOICE_EXCEPTION' ? (
            <Form.Item>
              {record.$form?.getFieldDecorator(`taxAmount`, {
                initialValue: record.taxAmount,
              })(
                <InputNumber
                  // precision={amountPrecision}
                  max={9999999}
                  min={0}
                  allowThousandth
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxIncludedPrice`).d('含税单价'),
        dataIndex: 'taxIncludedPrice',
        align: 'right',
        render: thousandsRender,
        // render: (text, record) => thousandBitSeparatorDJ(Number(text), record.pricePrecision),
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.taxIncludedAmount`).d('含税金额'),
        dataIndex: 'taxIncludedAmount',
        align: 'right',
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoNum`).d('父订单号'),
        dataIndex: 'ecPoNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号'),
        dataIndex: 'ecPoSubNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.asnNum`).d('送货单号|行号'),
        dataIndex: 'asnNumAndAsnLineNum',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.payableInvoice.deliverTime`).d('妥投时间'),
        dataIndex: 'deliverTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.billNumAndBillLineNum`).d('对账单号|行号'),
        dataIndex: 'billNumAndBillLineNum',
        width: 150,
      },
    ];
    return (
      <React.Fragment>
        <Header
          backPath={backPath}
          title={intl.get(`${promptCode}.view.title.payableInvoice.detail`).d('应付发票明细')}
        >
          {isEdit ? (
            <React.Fragment>
              <Button
                icon="save"
                type="primary"
                loading={saving || loading}
                onClick={() => this.handleSaveOrSubmit(true, headerInfo)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="check"
                loading={submitting || loading}
                onClick={() => this.handleSaveOrSubmit(false, headerInfo)}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              {!(
                routeSource === 'payable-invoice-maintain' &&
                invoiceStatus === 'EC_INVOICE_EXCEPTION'
              ) && (
                <Button icon="delete" loading={deleting || loading} onClick={this.handleDelete}>
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>
              )}
              <Upload {...uploadProps} />
              {/* <Button icon="clock-circle-o">
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button> */}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {routeSource === 'invoice-review' && (
                <Button
                  type="primary"
                  icon="check"
                  loading={confirmLoading || rejectLoading}
                  onClick={this.confirm}
                >
                  {intl.get(`${promptCode}.model.invoiceBill.approve`).d('通过')}
                </Button>
              )}
              {routeSource === 'invoice-review' && (
                <Button
                  icon="close"
                  loading={confirmLoading || rejectLoading}
                  onClick={this.reject}
                >
                  {intl.get(`${promptCode}.model.invoiceBill.return`).d('退回')}
                </Button>
              )}
              <Upload {...uploadReadOnlyProps} />
              <Button icon="clock-circle-o" onClick={this.openOperationRecord}>
                {intl.get('hzero.common.button.operating').d('操作记录')}
              </Button>
              <ExcelExport
                requestUrl={requestUrl}
                queryParams={{
                  invoiceHeaderId,
                  customizeUnitCode: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
                }}
                otherButtonProps={{ icon: 'export', type: 'default' }}
              />
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Spin spinning={loading} wrapperClassName={styles['payable-invoice']}>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['followGoodsForm']}
              onChange={(arr) => this.onCollapseChange(arr, 'followGoodsForm')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="followGoodsForm"
                header={
                  <React.Fragment>
                    <h3>
                      {intl
                        .get(`${promptCode}.view.message.title.payableInvoice`)
                        .d('应付发票头信息')}
                    </h3>
                    <a>
                      {collapseKeys.followGoodsForm
                        ? collapseKeys.followGoodsForm.some((o) => o === 'followGoodsForm')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.followGoodsForm
                          ? collapseKeys.followGoodsForm.some((o) => o === 'followGoodsForm')
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                <FollowGoodsForm {...followGoodsFormProps} />
              </Collapse.Panel>
            </Collapse>
            <Collapse
              className="form-collapse"
              defaultActiveKey={['followGoodsInvoiceForm']}
              onChange={(arr) => this.onCollapseChange(arr, 'followGoodsInvoiceForm')}
            >
              <Collapse.Panel
                forceRender
                showArrow={false}
                key="followGoodsInvoiceForm"
                header={
                  <React.Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.title.detail.invoice`).d('基本信息')}
                    </h3>
                    <a>
                      {collapseKeys.followGoodsInvoiceForm
                        ? collapseKeys.followGoodsInvoiceForm.some(
                            (o) => o === 'followGoodsInvoiceForm'
                          )
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')
                        : intl.get(`hzero.common.button.up`).d('收起')}
                    </a>
                    <Icon
                      type={
                        collapseKeys.followGoodsInvoiceForm
                          ? collapseKeys.followGoodsInvoiceForm.some(
                              (o) => o === 'followGoodsInvoiceForm'
                            )
                            ? 'up'
                            : 'down'
                          : 'up'
                      }
                    />
                  </React.Fragment>
                }
              >
                <FollowGoodsInvoiceForm {...followGoodsFormProps} />
              </Collapse.Panel>
            </Collapse>
            <Tabs animated={false}>
              <TabPane
                tab={intl.get(`${promptCode}.view.invoiceRow`).d('发票行')}
                key="invoiceLine"
              >
                {customizeTable(
                  {
                    code: 'SFIN.INVOICE_SUMMARY_DETAIL.EC_INVOICE_LINE',
                  },
                  <EditTable
                    bordered
                    rowKey="invoiceLineId"
                    columns={columns}
                    dataSource={dataSource}
                    pagination={pagination}
                    onChange={this.handelSearchPurchaserLine}
                    scroll={{ x: this.scrollWidth(columns, 750) }}
                  />
                )}
              </TabPane>
              {(showTaxLine || invoiceStatus === 'EC_INVOICE_EXCEPTION') && (
                <TabPane
                  tab={intl.get(`${promptCode}.view.taxInvoiceRow`).d('税务发票行')}
                  key="taxInvoiceLine"
                >
                  {routeSource === 'payable-invoice-maintain' ? (
                    <TaxElectInvoiceTable {...taxTicketTableProps} />
                  ) : (
                    <ElectTaxInvoiceLine
                      invoiceHeaderId={invoiceHeaderId}
                      remoteProps={remoteProps}
                      routeSource={routeSource}
                      remoteCode="SFIN_INVOICE_SUMMARY_READ_ONLY_FOLLOWGOODS_DETAIL_CUX_ELECT_TAX_COLUMNS"
                    />
                  )}
                </TabPane>
              )}
            </Tabs>
          </Spin>
        </Content>
        {!isEdit && <ActionHistory {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
