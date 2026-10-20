/**
 * index.js - 非寄销应付发票退回查询界面
 * @date: 2018-11-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import moment from 'moment';
import { isEmpty, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import SearchPage from 'srm-front-boot/lib/components/SearchPage';
import { Header } from 'components/Page';
import Lov from 'components/Lov';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ValueList from 'components/ValueList';
import { getCurrentOrganizationId, getDateFormat, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';
// import { numberRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import LovMulti from '@/routes/components/MultipleLov';
import { dateTimeRender } from 'utils/renderer';

import { thousandBitSeparator } from '@/routes/utils';
import TypeInModal from '../Components/TypeInModal';
import ActionHistory from '../Components/ActionHistory';

const { Option } = Select;
const FormItem = Form.Item;
const promptCode = 'sfin.invoiceBill';
const promptNum = 'sfin.payableInvoice';

@connect(({ invoice, loading }) => ({
  invoice,
  loading: loading.effects['invoice/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.payableInvoice', 'sfin.invoice', 'sfin.invoiceBill'],
})
@withCustomize({
  unitCode: ['SFIN.INVOICE_RETURN_DETAIL.FILTER', 'SFIN.INVOICE_RETURN_DETAIL.GRID'],
})
export default class Return extends SearchPage {
  constructor(props) {
    super(props);
    this.state = { recordModal: false };
    this.tableCode = 'SFIN.INVOICE_RETURN_DETAIL.GRID';
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
        type: 'return',
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
      cacheKey: '/sfin/invoice-return/list',
      paramsFilter: (values) => {
        const { creationDateFrom, creationDateTo } = values;
        return {
          ...values,
          creationDateFrom: creationDateFrom ? moment(creationDateFrom).format(DATETIME_MIN) : '',
          creationDateTo: creationDateTo ? moment(creationDateTo).format(DATETIME_MAX) : '',
          type: 'return',
          customizeUnitCode: 'SFIN.INVOICE_RETURN_DETAIL.FILTER,SFIN.INVOICE_RETURN_DETAIL.GRID',
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
        type: 'return',
        expand: !expand.return,
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
  confirm() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;

    if (!isEmpty(selectedRows)) {
      dispatch({
        type: 'invoice/confirm',
        payload: {
          type: 'return',
          body: selectedRows,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            selectedRows: [],
          });
          notification.success();
        }
      });
    }
  }

  @Bind()
  reject() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;

    if (!isEmpty(selectedRows)) {
      dispatch({
        type: 'invoice/reject',
        payload: {
          type: 'return',
          body: selectedRows,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            selectedRows: [],
          });
          notification.success();
        }
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
  linkDetail(invoiceHeaderId) {
    const { history } = this.props;
    history.push(`/sfin/invoice-return/detail/${invoiceHeaderId}`);
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
    return (
      <Header
        title={intl.get(`${promptCode}.view.message.title.invoice.return`).d('退回应付发票')}
      />
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
        code: 'SFIN.INVOICE_RETURN_DETAIL.FILTER',
        form,
        expand: expand.return,
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
                    .get(`${promptNum}.model.payableInvoice.taxInvoiceNum`)
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
                        setFieldsValue({ ouId: undefined });
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
            <Row style={{ display: expand.return ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get(`${promptCode}.model.invoiceBill.creationDateFrom`)
                    .d('创建日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.creationDateAt`).d('创建日期到')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
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
            </Row>
            <Row style={{ display: expand.return ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('syncStatus')(
                    <ValueList lovCode="SFIN.INVOICE_UNSYNC_STATUS" lazyLoad={false} allowClear />
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
            </Row>
            <Row style={{ display: expand.return ? 'block' : 'none' }}>
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
            </Row>
            <Row style={{ display: expand.return ? 'block' : 'none' }}>
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
                {expand.return
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
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceNum`).d('SRM发票号'),
        width: 170,
        dataIndex: 'invoiceNum',
        render: (value, record) => {
          const { invoiceHeaderId } = record;
          return <a onClick={() => this.linkDetail(invoiceHeaderId)}>{value}</a>;
        },
      },
      {
        title: intl.get(`sfin.invoiceBill.model.invoiceBill.businessType`).d('业务类别'),
        dataIndex: 'businessTypeMeaning',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.syncStatus`).d('导入状态'),
        width: 150,
        dataIndex: 'syncStatusMeaning',
      },
      // {
      //   title: intl.get(`${promptCode}.model.invoiceBill.erpInvoiceNum`).d('ERP发票号'),
      //   width: 150,
      //   dataIndex: 'erpInvoiceNum',
      // },
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
        title: intl
          .get(`${promptCode}.model.invoiceBill.taxIncludedAmountSystem`)
          .d('含税总额（系统）'),
        align: 'right',
        dataIndex: 'taxIncludedAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxAmountSystem`).d('税额（系统）'),
        align: 'right',
        dataIndex: 'taxAmountSystem',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceAmount`).d('发票总额'),
        align: 'right',
        dataIndex: 'taxIncludedAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.invoiceTaxAmount`).d('发票税额'),
        align: 'right',
        dataIndex: 'taxAmount',
        render: (value, record) => {
          const { priceShieldFlag } = record;
          return priceShieldFlag === 1
            ? '***'
            : thousandBitSeparator(value, record.amountPrecision);
        },
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.taxInvoiceNumber`).d('税务发票号'),
        width: 120,
        dataIndex: 'taxInvoiceNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.currencyCode`).d('币种'),
        width: 100,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierNum`).d('供应商编码'),
        width: 150,
        dataIndex: 'supplierNum',
      },
      {
        title: intl.get(`${promptCode}.model.invoiceBill.supplierName`).d('供应商名称'),
        width: 150,
        dataIndex: 'supplierName',
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
        width: 150,
        dataIndex: 'operationalRecords',
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
        width: 100,
        dataIndex: 'operating',
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get('hzero.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 680);
    return {
      rowKey: 'invoiceHeaderId',
      columns,
      loading,
      rowSelection: null,
      dataSource: list.return && list.return.content,
      pagination: pagination.return,
      scroll: {
        x: scrollWidth,
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
