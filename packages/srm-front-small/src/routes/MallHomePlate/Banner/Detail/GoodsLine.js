import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber, Row, Col, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import EditTable from 'components/EditTable';

const formLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};
// const updatePrompt = 'small.companyBanner.model.companyBanner';

@Form.create({ fieldNameProp: null })
export default class GoodsLine extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  /**
   * 改变商品来源-清空供应商、商品编码、商品名称
   */
  @Bind()
  changeSourceFrom(value, dataList, record) {
    record.$form.setFieldsValue({
      supplierCompanyId: undefined,
      productId: undefined,
      productNum: undefined,
      productName: undefined,
      supplierTenantId: undefined,
      sourceType: value,
      sourceFrom: undefined,
      sourceFromName: dataList ? dataList.props.children : undefined,
    });
  }

  /**
   * 改变供应商-清空商品编码、商品名称
   */
  @Bind()
  changeSupplierCompanyName(value, dataList, record) {
    record.$form.setFieldsValue({
      productId: undefined,
      productName: undefined,
      supplierTenantId: dataList.supplierTenantId,
      supplierCompanyId: value,
      supplierCompanyName: dataList.supplierName,
      sourceFrom: record.$form.getFieldValue('sourceType') === 'EC' ? dataList.ecPlatform : 'CATA',
    });
  }

  /**
   * 改变商品编码-获取商品名称
   */
  @Bind()
  changeProductNum(_, dataList, record) {
    record.$form.setFieldsValue({
      productName: dataList.productName,
      productNum: dataList.productNum,
    });
  }

  /**
   * 平台-供应商lov改变，清空商品编码、商品名称
   */
  @Bind()
  changePlatformSupplier(_, dataList, record) {
    record.$form.setFieldsValue({
      productId: undefined,
      productNum: undefined,
      productName: undefined,
      supplierTenantId: dataList.tenantId,
      sourceFrom: dataList.ecPlatformCode,
      sourceFromName: dataList.ecPlatformName,
    });
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(_, changeValues) {
    const { onChangeTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeTableData();
    }
  }

  // 提交查询表单
  @Bind()
  handleFormSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  // 重置表单
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 商品预览
   */
  @Bind()
  handleProductPreview(record) {
    const { onPreviewProduct } = this.props;
    onPreviewProduct(record);
  }

  renderFilterForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={6}>
              <Form.Item
                label={intl.get(`small.common.model.supplier`).d('供应商')}
                {...formLayout}
              >
                {getFieldDecorator(
                  !isTenantRoleLevel() ? 'sourceFromName' : 'supplierCompanyName',
                  {
                    rules: [
                      {
                        max: 120,
                        message: intl.get('hzero.common.validation.max', {
                          max: 120,
                        }),
                      },
                    ],
                  }
                )(<Input dbc2sbc={false} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label={intl.get(`small.mallHomePlate.model.productNameCode`).d('商品编码/名称')}
                {...formLayout}
              >
                {getFieldDecorator('productName', {
                  rules: [
                    {
                      max: 120,
                      message: intl.get('hzero.common.validation.max', {
                        max: 120,
                      }),
                    },
                  ],
                })(<Input dbc2sbc={false} />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleFormSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }

  renderColumns() {
    const columns = [
      {
        title: intl.get(`small.common.model.queue.number`).d('排序号'),
        dataIndex: 'orderSeq',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <Form.Item>
                {record.$form.getFieldDecorator('orderSeq', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`small.common.model.queue.number`).d('排序号'),
                      }),
                    },
                  ],
                  initialValue: record.orderSeq,
                })(<InputNumber min={1} max={99999999} style={{ width: '80px' }} />)}
              </Form.Item>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`small.common.model.sourceType`).d('商品类型'),
        dataIndex: 'sourceType',
        render: (val) =>
          val === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
      },
      {
        title: intl.get(`small.common.model.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`small.common.model.productCode`).d('商品编码'),
        dataIndex: 'productNum',
      },
      {
        title: intl.get(`small.common.model.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 400,
      },
      {
        title: intl.get('small.common.model.product.status').d('商品状态'),
        dataIndex: 'shelfFlag',
        width: 90,
        render: (_, record) => {
          const { shelfFlag, shelfErrorMessage } = record;
          return shelfFlag === 1 ? (
            intl.get('small.common.model.shelves').d('上架')
          ) : (
            <Popover
              content={
                shelfErrorMessage || intl.get('small.common.view.manual.unShelf').d('手动下架')
              }
            >
              {intl.get('small.common.model.unShelves').d('下架')}
            </Popover>
          );
        },
      },
      // {
      //   title: intl.get(`hzero.common.button.action`).d('操作'),
      //   dataIndex: 'contactMail',
      //   width: 60,
      //   render: (_, record) => (
      //     <a onClick={() => this.handleProductPreview(record)}>
      //       {intl.get(`small.common.model.preview`).d('预览')}
      //     </a>
      //   ),
      // },
    ];
    return columns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      deleteLoading,
      goodsRowSelection,
      goodsLineSelectedRowKeys,
      dataSource = [],
      pagination,
      onChange,
      onCreateLine,
      onDeleteLines,
      bannerTypeValue,
    } = this.props;
    return (
      <React.Fragment>
        <div className="table-list-search">{this.renderFilterForm()}</div>
        <div className="table-list-operator" style={{ textAlign: 'right' }}>
          <Button
            icon="delete"
            style={{ marginRight: 8 }}
            onClick={onDeleteLines}
            disabled={goodsLineSelectedRowKeys.length === 0}
            loading={deleteLoading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button
            icon="plus"
            style={{ marginRight: 0 }}
            onClick={onCreateLine}
            disabled={bannerTypeValue === '1' && dataSource.length === 1}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </div>
        <EditTable
          bordered
          rowKey="bannerAssginId"
          loading={loading}
          columns={this.renderColumns()}
          rowSelection={goodsRowSelection}
          dataSource={dataSource}
          pagination={pagination}
          onChange={(page) => onChange(page)}
          onDataChange={this.hasChangeData}
        />
      </React.Fragment>
    );
  }
}
