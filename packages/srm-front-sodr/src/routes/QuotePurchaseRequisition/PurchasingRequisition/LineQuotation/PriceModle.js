import React, { Component } from 'react';
import { Modal, Table, Row, Form, Button, Input, Popover, Col } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'hzero-front/lib/utils/utils';
import { formatAumont } from '@/routes/components/utils';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';

@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingPriceList: loading.effects['quotePurchaseRequisition/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PriceModle extends Component {
  constructor(props) {
    super(props);
    this.state = { dataSource: [], pagination: {}, expandForm: false };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 弹窗更多按钮弹窗
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      companyId,
      itemId,
      form,
      ouId,
      invOrganizationId,
      purchaseOrgId,
      uomId,
      prLineId,
      currencyCode,
      // orderTypeCode,
      categoryId,
    } = this.props;
    const filterValues = form.getFieldsValue();
    dispatch({
      type: 'quotePurchaseRequisition/linePriceList',
      payload: {
        companyId,
        itemId,
        invOrganizationId,
        purchaseOrgId,
        uomId,
        prLineId,
        ...filterValues,
        page,
        ouId,
        currencyCode,
        // orderTypeCode,
        categoryId,
        customizeUnitCode:
          'SODR.PURCHASE_REQUISITION_LIST.PROPOSED.PRICE,SODR.PURCHASE_REQUISITION_LIST.FILTER_PROPOSED_PRICE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 渲染阶梯价格明细
   * @param {String} value
   * @param {Object} record
   * @param {Object} item
   */
  renderLadderDetailTable(ladderPriceLibList = []) {
    const columns = [
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderLineNum`).d('行号'),
        dataIndex: 'ladderLineNum',
        width: 80,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.numberRange`).d('数量范围'),
        dataIndex: 'numberRange',
        width: 120,
        render: (val, record) => `[${record.ladderFrom},${record.ladderTo})`,
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.price`).d('价格'),
        dataIndex: 'ladderPrice',
        width: 100,
        render: (val) => formatAumont(val),
      },
      {
        title: intl.get(`ssrc.priceLibrary.model.priceLibrary.ladderPriceRemark`).d('备注'),
        dataIndex: 'ladderPriceRemark',
        width: 120,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
    ];
    return (
      <Table
        bordered
        columns={columns}
        rowKey="ladderPriceLibId"
        dataSource={ladderPriceLibList}
        pagination={false}
      />
    );
  }

  @Bind()
  getColumns() {
    const defaultColumn = [
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.localSupplierCompanyNum`).d('本地供应商编码'),
        dataIndex: 'supplierNum',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.localSupplierCompanyName`).d('本地供应商名称'),
        dataIndex: 'supplierName',
        width: 120,
      },
      {
        title: intl.get(`sodr.common.model.common.taxPrice`).d('含税单价'),
        dataIndex: 'taxPrice',
        width: 100,
        render: (val, record) => formatAumont(val, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.excludingTaxPrice`).d('单价（不含税）'),
        dataIndex: 'unitPrice',
        width: 100,
        render: (val, record) => formatAumont(val, record.defaultPrecision),
      },
      {
        title: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
        render: (_, { uomCodeAndName }) => uomCodeAndName,
      },
      {
        title: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.11111`).d('阶梯价格'),
        dataIndex: 'quantity',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <Popover
              placement="bottomLeft"
              content={this.renderLadderDetailTable(record.ladderPriceLibList)}
              arrowPointAtCenter
            >
              <a>{`${intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}`}</a>
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 100,
      },
      {
        title: intl.get(`sodr.common.model.common.sourceFromNum`).d('价格来源单据号'),
        dataIndex: 'orderNum',
        width: 150,
      },
    ];
    return defaultColumn;
  }

  render() {
    const {
      visible,
      hideModal,
      form: { getFieldDecorator },
      loadingPriceList,
      customizeTable,
      customizeFilterForm,
      form,
    } = this.props;
    const { dataSource = [], pagination, expandForm } = this.state;
    const modalProps = {
      visible,
      width: 820,
      footer: null,
      onCancel: () => hideModal('priceModalVisible', false),
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`sodr.common.modal.referencePrice`).d('物料参考价格'),
    };
    const columns = this.getColumns();
    const tableProps = {
      columns,
      dataSource,
      pagination,
      loading: loadingPriceList,
      scroll: { x: scrollX },
      bordered: true,
      onChange: this.handleSearch,
    };
    const formLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };

    return (
      <Modal {...modalProps}>
        {customizeFilterForm(
          {
            form,
            expand: expandForm,
            code: 'SODR.PURCHASE_REQUISITION_LIST.FILTER_PROPOSED_PRICE',
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18} style={{ paddingRight: 5 }}>
                <Row {...EDIT_FORM_ROW_LAYOUT}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get(`entity.supplier.code`).d('供应商编码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierCompanyNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get(`entity.supplier.name`).d('供应商名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierCompanyName')(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row {...EDIT_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl.get(`entity.supplier.localSupplierNums`).d('本地供应商编码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      label={intl
                        .get(`sodr.common.model.common.localSupplierCompanyName`)
                        .d('本地供应商名称')}
                      {...formLayout}
                    >
                      {getFieldDecorator('supplierName')(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expandForm
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                    style={{ marginLeft: 8 }}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
        {customizeTable(
          { code: 'SODR.PURCHASE_REQUISITION_LIST.PROPOSED.PRICE' },
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
