import React, { Component } from 'react';
import { Modal, Table, Row, Form, Button, Input } from 'hzero-ui';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { createPagination } from 'hzero-front/lib/utils/utils';

@connect(({ quotePurchaseRequisition, loading }) => ({
  quotePurchaseRequisition,
  loadingPriceList: loading.effects['bidHall/priceList'],
}))
@Form.create({ fieldNameProp: null })
export default class PriceModal extends Component {
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
    const { dispatch, form, priceModal = {} } = this.props;
    const filterValues = form.getFieldsValue();
    dispatch({
      type: 'bidHall/priceList',
      payload: {
        ...priceModal,
        ...filterValues,
        page,
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

  @Bind()
  getColumns() {
    const defaultColumn = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
        dataIndex: 'taxPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPriceUnTax`).d('单价(不含税)'),
        dataIndex: 'unitPrice',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.currencyName`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRateUnSym`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceSource`).d('价格来源'),
        dataIndex: 'priceSourceMeaning',
        width: 100,
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
    const { dataSource = [], pagination } = this.state;
    const modalProps = {
      visible,
      width: 820,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.mReferencePrice`).d('物料参考价格'),
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
            <Form.Item label={intl.get(`ssrc.common.supplierNum`).d('供应商编码')} {...formLayout}>
              {getFieldDecorator('supplierCompanyNum')(<Input />)}
            </Form.Item>
            <Form.Item label={intl.get(`ssrc.common.supplierName`).d('供应商名称')} {...formLayout}>
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
