import React, { Component } from 'react';
import { Modal, Table, Row, Form, Button, Input, Popover } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'hzero-front/lib/utils/utils';

@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingPriceList: loading.effects['quotePurchaseRequisition/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PriceModle extends Component {
  constructor(props) {
    super(props);
    this.state = { dataSource: [], pagination: {} };
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

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, companyId, itemId, form, ouId } = this.props;
    const filterValues = form.getFieldsValue();
    dispatch({
      type: 'quotePurchaseRequisition/priceList',
      payload: { companyId, itemId, ...filterValues, page, ouId },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content || res,
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
        width: 80,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 80,
      },
      {
        title: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 80,
      },

      {
        title: intl.get(`sodr.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
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
        title: intl.get(`sodr.common.model.common.11111`).d('阶梯价格'),
        dataIndex: 'quantity',
        width: 80,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <Popover
              placement="bottomLeft"
              content={this.renderLadderDetailTable(record.ladderPriceLibList)}
              arrowPointAtCenter
            >
              <a>
                {`${intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格')}`}
              </a>
            </Popover>
          ) : null,
      },
      {
        title: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 80,
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
    } = this.props;
    const { dataSource, pagination } = this.state;
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
        <Row className="table-list-search">
          <Form layout="inline">
            <Form.Item label={intl.get(`entity.supplier.code`).d('供应商编码')} {...formLayout}>
              {getFieldDecorator('supplierCompanyNum')(<Input />)}
            </Form.Item>
            <Form.Item label={intl.get(`entity.supplier.name`).d('供应商名称')} {...formLayout}>
              {getFieldDecorator('supplierCompanyName')(<Input />)}
            </Form.Item>

            <Form.Item>
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
          </Form>
        </Row>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
