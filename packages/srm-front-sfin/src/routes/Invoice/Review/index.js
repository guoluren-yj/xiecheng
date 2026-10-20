/**
 * index.js - 非寄销应付发票复核查询界面
 * @date: 2018-11-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Modal, Select } from 'hzero-ui';
import moment from 'moment';
import { isEmpty, isNil } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';
import remote from 'hzero-front/lib/utils/remote';
import { dateTimeRender } from 'utils/renderer';

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import ExcelExport from 'components/ExcelExport';
import { Header } from 'components/Page';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import { SRM_FINANCE } from '_utils/config';
import {
  getCurrentOrganizationId,
  getDateFormat,
  getEditTableData,
  // getUserOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import LovMulti from '@/routes/components/MultipleLov';

import { thousandBitSeparator } from '@/routes/utils';
import ActionHistory from '../Components/ActionHistory';
import TypeInModal from '../Components/TypeInModal';
import styles from '../index.less';

const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
const promptCode = 'sfin.invoiceBill';
const unitCode = ['SFIN.INVOICE_REVIEW_LIST.FILTER', 'SFIN.INVOICE_REVIEW_LIST.GRID'];

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  confirmLoading: loading.effects['invoice/confirm'],
  rejectLoading: loading.effects['invoice/reject'],
  organizationId: getCurrentOrganizationId(),
}))
@remote({
  code: 'SFIN_INVOICE_REVIEW_LIST_CUX',
  name: 'remote',
})
@formatterCollections({
  code: 'sfin.invoiceBill',
})
@withCustomize({
  unitCode,
})
export default class Review extends SearchPage {
  constructor(props) {
    super(props);
    this.state = {
      recordModal: false,
    };
    this.tableCode = 'SFIN.INVOICE_REVIEW_LIST.GRID';
  }

  componentDidMount() {
    const {
      invoice: { pagination },
    } = this.props;
    this.handleSearch(pagination);
    this.fetchCheckStatusList();
  }

  /**
   * 获取查验状态值级
   */
  @Bind()
  fetchCheckStatusList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/fetchCheckStatusList',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'invoice/updateList',
      payload: {
        list: {},
        pagination: {},
        type: 'review',
      },
    });
  }

  @Bind()
  pageConfig() {
    return {
      modelName: 'invoice',
      dataName: 'list',
      customSearch: true,
      searchDispatch: 'invoice/queryList',
      cacheKey: '/sfin/invoice-review/list',
      paramsFilter: (values) => {
        const { submitDateFrom, submitDateTo } = values;
        return {
          ...values,
          submitDateFrom: submitDateFrom ? moment(submitDateFrom).format(DATETIME_MIN) : '',
          submitDateTo: submitDateTo ? moment(submitDateTo).format(DATETIME_MAX) : '',
          type: 'review',
          customizeUnitCode: 'SFIN.INVOICE_REVIEW_LIST.FILTER,SFIN.INVOICE_REVIEW_LIST.GRID',
        };
      },
    };
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset() {
    const { form } = this.filterForm.props;

    form.resetFields();
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    const {
      dispatch,
      invoice: { expand },
    } = this.props;
    dispatch({
      type: 'invoice/updateExpand',
      payload: {
        type: 'review',
        expand: !expand.review,
      },
    });
  }

  /**
   * 辅助函数，查询前调用，缓存当前页面的编辑数据
   */
  @Bind()
  searchMiddleware() {
    const {
      dispatch,
      invoice: { list = {}, cacheList = [] },
    } = this.props;
    const editList = getEditTableData(list.content, [this.rowKey]);
    const newCacheList = editList.reduce((prev, cur) => {
      const index = prev.findIndex((e) => e[this.rowKey] === cur[this.rowKey]);
      if (~index) {
        prev.splice(index, 1, cur);
      } else {
        prev.push(cur);
      }
      return prev;
    }, cacheList);

    dispatch({
      type: 'invoice/updateState',
      payload: {
        cacheList: newCacheList,
      },
    });
  }

  @Bind()
  @Throttle(1000)
  confirm() {
    const {
      dispatch,
      invoice: { pagination = {} },
    } = this.props;
    const { selectedRows = [] } = this.state;

    if (!isEmpty(selectedRows)) {
      confirm({
        title: intl.get(`${promptCode}.view.message.title.modal.pass`).d('是否确认通过?'),
        onOk: () => {
          dispatch({
            type: 'invoice/confirm',
            payload: {
              type: 'review',
              body: selectedRows.map((selected) => ({ ...selected, checkSource: 'COPE' })),
            },
          }).then((res) => {
            if (res) {
              this.setState({
                selectedRows: [],
              });
              this.handleSearch(pagination.review);
              notification.success();
            }
          });
        },
      });
    }
  }

  @Bind()
  @Throttle(1000)
  reject() {
    const {
      dispatch,
      invoice: { pagination = {} },
    } = this.props;
    const { selectedRows = [] } = this.state;

    if (!isEmpty(selectedRows)) {
      confirm({
        title: intl.get(`${promptCode}.view.message.title.modal.detail`).d('是否确认要退回?'),
        onOk: () => {
          dispatch({
            type: 'invoice/reject',
            payload: {
              type: 'review',
              body: selectedRows,
            },
          }).then((res) => {
            if (res) {
              this.setState({
                selectedRows: [],
              });
              this.handleSearch(pagination.review);
              notification.success();
            }
          });
        },
      });
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

  @Bind()
  onRef(ref) {
    this.historyModal = ref;
  }

  @Bind()
  linkDetail(record) {
    const { invoiceHeaderId, taxCategory } = record;
    const { history } = this.props;
    if (taxCategory === 'WITH_GOODS') {
      history.push(`/sfin/invoice-review/read-only-followGoodsDetail/${invoiceHeaderId}`);
    } else if (taxCategory === 'CENTRALIZED') {
      history.push(`/sfin/invoice-review/read-only-centralized-detail/${invoiceHeaderId}`);
    } else {
      history.push(`/sfin/invoice-review/detail/${invoiceHeaderId}`);
    }
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * hideOperationRecord - 打开录入物流信息弹框
   */
  @Bind()
  showModal(batch, record) {
    if (this.typeInModalRef) {
      this.setState({
        typeInModal: true,
      });
      const { dispatch } = this.props;
      if (!batch) {
        const { invoiceHeaderId } = record;
        this.typeInModalRef.record = [record];
        dispatch({
          type: 'invoice/queryLogisticsInfo',
          payload: {
            invoiceHeaderId,
          },
        }).then(this.typeInModalRef.init);
      } else {
        this.typeInModalRef.record = this.state.selectedRows;
      }
    }
  }

  /**
   * handleCloseModal 关闭 录入物流信息Modal
   */
  @Bind()
  handleCloseModal() {
    this.setState({
      typeInModal: false,
    });
  }

  renderHeader() {
    const { organizationId, loading, confirmLoading, rejectLoading } = this.props;
    const { selectedRows } = this.state;
    const params =
      (this.filterForm.props &&
        filterNullValueObject(this.filterForm.props.form.getFieldsValue())) ||
      {};
    return (
      <Header title={intl.get(`${promptCode}.view.message.title.invoice.review`).d('复核应付发票')}>
        <React.Fragment>
          <Button
            icon="check"
            type="primary"
            disabled={isEmpty(selectedRows)}
            loading={loading || confirmLoading || rejectLoading}
            onClick={this.confirm}
          >
            {intl.get(`${promptCode}.model.invoiceBill.approve`).d('通过')}
          </Button>
          <Button
            icon="close"
            disabled={isEmpty(selectedRows)}
            loading={loading || confirmLoading || rejectLoading}
            onClick={this.reject}
          >
            {intl.get(`${promptCode}.model.invoiceBill.return`).d('退回')}
          </Button>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/invoice/review-export`}
            queryParams={{
              ...params,
              submitDateFrom: params.submitDateFrom
                ? moment(params.submitDateFrom).format(DATETIME_MIN)
                : '',
              submitDateTo: params.submitDateTo
                ? moment(params.submitDateTo).format(DATETIME_MAX)
                : '',
              customizeUnitCode: 'SFIN.INVOICE_REVIEW_LIST.FILTER,SFIN.INVOICE_REVIEW_LIST.GRID',
            }}
          />
        </React.Fragment>
      </Header>
    );
  }

  renderForm(form) {
    const {
      invoice: {
        expand, // 查询条件是否展开
        checkStatusList = [], // 查验状态集合
      },
      organizationId,
      customizeFilterForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    const dateFormat = getDateFormat();

    return customizeFilterForm(
      {
        code: 'SFIN.INVOICE_REVIEW_LIST.FILTER',
        form,
        expand: expand.review,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`)
                    .d('税务发票号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('taxInvoiceNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.supplierCompanyId`).d('供应商')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId: organizationId }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand.review ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.submitDateFrom`).d('提交日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('submitDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateTo') &&
                        moment(getFieldValue('submitDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.submitDateAt`).d('提交日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('submitDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('submitDateFrom') &&
                        moment(getFieldValue('submitDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPFM.USER_AUTH.OU"
                      queryParams={
                        getFieldValue('companyId')
                          ? {
                              companyId: getFieldValue('companyId'),
                            }
                          : {}
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.priceDifferenceFlag`)
                    .d('比对结果')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('priceDifferenceFlag')(
                    <ValueList lovCode="SFIN.INVOICE_PRICE_DIFF" lazyLoad={false} allowClear />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.company`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTHORITY_COMPANY" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('validateStatusCode')(
                    <Select allowClear>
                      {checkStatusList.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别')}
                >
                  {getFieldDecorator('businessType')(
                    <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sfin.invoiceBill.model.invoiceBill.purAgentName').d('采购员')}
                >
                  {getFieldDecorator('purchaseAgentIds')(
                    <LovMulti
                      code="SPUC.PURCHASE_AGENT_NOUSER"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sfin.invoiceBill.model.invoiceBill.purchaseOrgName')
                    .d('采购组织')}
                >
                  {getFieldDecorator('purOrganizationIds')(
                    <LovMulti
                      code="HPFM.PURCHASE_ORGANIZATION"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand.review
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => this.handleSearch()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  tableProps() {
    const {
      loading,
      invoice: { list = {}, pagination = {} },
      remote: remoteProps,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
        render: (value, record) => {
          return <a onClick={() => this.linkDetail(record)}>{value}</a>;
        },
        onCell: (record) => {
          const {
            taxIncludedAmountSystem,
            taxIncludedAmount,
            taxAmountSystem,
            taxAmount,
            priceDifferenceFlag,
          } = record;
          const defaultRender = () => {
            if (
              !math.eq(taxIncludedAmount, taxIncludedAmountSystem) ||
              !math.eq(taxAmount, taxAmountSystem) ||
              +priceDifferenceFlag
            ) {
              return { className: styles['invoice-diff-col'] };
            } else {
              return {};
            }
          };
          const className = defaultRender();
          if (remoteProps) {
            return remoteProps.process('SFIN_INVOICE_REVIEW_LIST_CUX_CELL', className, {
              record,
            });
          } else return className;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.company`).d('公司'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.ouName`).d('业务实体'),
        width: 150,
        dataIndex: 'ouName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        width: 150,
        dataIndex: 'supplierNum',
        render: (value, record) => value || record.supplierCompanyNum,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        width: 150,
        dataIndex: 'supplierName',
        render: (value, record) => value || record.supplierCompanyName,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.purchaseOrgName`).d('采购组织'),
        dataIndex: 'purOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.checkState`).d('查验状态'),
        width: 100,
        dataIndex: 'validateStatusCodeMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceLogis`).d('税务发票物流'),
        dataIndex: 'taxInvoiceLogis',
        width: 150,
        render: (_, record) => (
          <a onClick={() => this.showModal(false, record)}>
            {intl.get(`${promptCode}.operationalRecords`).d('物流信息查看')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierSiteName`).d('供应商地点'),
        width: 150,
        dataIndex: 'supplierSiteName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`).d('税务发票号'),
        width: 150,
        dataIndex: 'taxInvoiceNum',
      },
      {
        title: intl
          .get(`${promptCode}.model.invoiceBill.taxIncludedAmountSystem`)
          .d('含税总额（系统）'),
        width: 150,
        align: 'right',
        dataIndex: 'taxIncludedAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          if (priceShieldFlag === 1) {
            return '***';
          } else {
            return math.eq(value, record.taxIncludedAmount) ? (
              thousandBitSeparator(value, record.amountPrecision)
            ) : (
              <span style={{ color: '#EF5350' }}>
                {thousandBitSeparator(value, record.amountPrecision)}
              </span>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmountSystem`).d('税额（系统）'),
        width: 150,
        align: 'right',
        dataIndex: 'taxAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          if (priceShieldFlag === 1) {
            return '***';
          } else {
            return math.eq(value, record.taxAmount) ? (
              thousandBitSeparator(value, record.amountPrecision)
            ) : (
              <span style={{ color: '#EF5350' }}>
                {thousandBitSeparator(value, record.amountPrecision)}
              </span>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceAmount`).d('发票总额'),
        width: 100,
        align: 'right',
        dataIndex: 'taxIncludedAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          if (priceShieldFlag === 1) {
            return '***';
          } else {
            return math.eq(value, record.taxIncludedAmountSystem) ? (
              thousandBitSeparator(value, record.amountPrecision)
            ) : (
              <span style={{ color: '#EF5350' }}>
                {thousandBitSeparator(value, record.amountPrecision)}
              </span>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceTaxAmount`).d('发票税额'),
        width: 100,
        align: 'right',
        dataIndex: 'taxAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          if (priceShieldFlag === 1) {
            return '***';
          } else {
            return math.eq(value, record.taxAmountSystem) ? (
              thousandBitSeparator(value, record.amountPrecision)
            ) : (
              <span style={{ color: '#EF5350' }}>
                {thousandBitSeparator(value, record.amountPrecision)}
              </span>
            );
          }
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.remark`).d('供应商备注'),
        width: 100,
        dataIndex: 'remark',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceStatusMeaning`).d('发票状态'),
        width: 100,
        dataIndex: 'invoiceStatusMeaning',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.createName`).d('创建人'),
        width: 100,
        dataIndex: 'createName',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.creationDate`).d('创建日期'),
        width: 150,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        dataIndex: 'recordOperation',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 300);
    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      dataSource: list.review && list.review.content,
      pagination: pagination.review,
      scroll: {
        x: scrollWidth,
        y: 'calc(100vh - 422px)',
      },
    };
  }

  renderOther() {
    const { dispatch } = this.props;
    const { recordModal, data, typeInModal } = this.state;
    const operationRecordProps = {
      dispatch,
      visible: recordModal,
      data,
      onRef: this.onRef,
      hideModal: this.hideOperationRecord.bind(this),
    };
    const typeInModalProps = {
      visible: typeInModal,
      onClose: this.handleCloseModal,
      onRef: (ref) => {
        this.typeInModalRef = ref;
      },
      editable: false,
    };
    return (
      <Fragment>
        <ActionHistory {...operationRecordProps} />
        <TypeInModal {...typeInModalProps} />
      </Fragment>
    );
  }
}
