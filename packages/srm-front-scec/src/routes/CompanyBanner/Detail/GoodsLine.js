import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, InputNumber, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

const commonPrompt = 'scec.common.model.common';
const formLayout = {
  labelCol: { span: 12 },
  wrapperCol: { span: 12 },
};
// const updatePrompt = 'scec.companyBanner.model.companyBanner';

@Form.create({ fieldNameProp: null })
export default class GoodsLine extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      ecComyanyId: -1,
    };
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
    form.validateFields(err => {
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
              <Form.Item label={intl.get(`${commonPrompt}.supplier`).d('供应商')} {...formLayout}>
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
                label={intl
                  .get(`${commonPrompt}.Commodity.code.Commodity.name`)
                  .d('商品编码/商品名称')}
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
    const { pathname, sourceType = [], companyId } = this.props;
    const { ecComyanyId } = this.state;
    let columns;
    if (pathname.match('platform-banner')) {
      columns = [
        {
          title: intl.get(`${commonPrompt}.orderSeq`).d('排序号'),
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
                          name: intl.get(`${commonPrompt}.orderSeq`).d('排序号'),
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
          title: intl.get(`${commonPrompt}.supplier`).d('供应商'),
          dataIndex: 'sourceFromName',
          render: (val, record) => {
            const { getFieldDecorator, setFieldsValue, getFieldValue } = record.$form;
            getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
            getFieldDecorator('supplierCompanyId', { initialValue: record.supplierCompanyId });
            getFieldDecorator('sourceFromName', { initialValue: val });
            getFieldDecorator('ecPlatformCode'); // 挂空表单
            return record._status === 'update' ||
              (record._status === 'create' && getFieldDecorator) ? (
              <Form.Item>
                {getFieldDecorator('sourceFrom', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.supplier`).d('供应商'),
                      }),
                    },
                  ],
                  initialValue: record.sourceFrom,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={getFieldValue('sourceFromName')}
                    code="SCEC.PLATFORM_EC_CLIENT"
                    queryParams={{
                      tenantId: getCurrentOrganizationId(),
                    }}
                    onChange={(_, item) => {
                      setFieldsValue({
                        productName: undefined,
                        productNum: undefined,
                        productId: undefined,
                        supplierCompanyId: item.supplierCompanyId,
                        supplierTenantId: item.supplierTenantId,
                        sourceFrom: item.ecPlatformCode,
                        sourceFromName: item.ecPlatformName,
                        // ecPlatformCode: item.ecPlatformCode,
                      });
                    }}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`${commonPrompt}.productId`).d('商品编码'),
          dataIndex: 'productNum',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getFieldValue,
            } = record.$form;
            getFieldDecorator('productNum', { initialValue: val });
            return record._status === 'update' ||
              (record._status === 'create' && getFieldDecorator) ? (
              <Form.Item>
                {getFieldDecorator('productId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.ecProductNum`).d('商品编号'),
                      }),
                    },
                  ],
                  initialValue: record.productId,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={$getFieldValue('productNum')}
                    textField="productNum"
                    code="SCEC.EC_PLATEFORM_PRODUCT_LIST"
                    queryParams={{
                      companyId: ecComyanyId,
                      tenantId: getCurrentOrganizationId(),
                      ecPlatformCode: $getFieldValue('sourceFrom'),
                      // supplierCompanyId: $getFieldValue('supplierCompanyId'),
                    }}
                    disabled={!$getFieldValue('sourceFrom')}
                    onChange={(_, item) => {
                      setFieldsValue({
                        productNum: item.productNum,
                        productId: item.productId,
                        productName: item.productName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`${commonPrompt}.ecProductName`).d('商品名称'),
          dataIndex: 'productName',
          width: 500,
          render: (val, record) => {
            const { getFieldDecorator, getFieldValue: $getFieldValue } = record.$form;
            getFieldDecorator('productName', { initialValue: val });
            return <Form.Item>{$getFieldValue('productName')}</Form.Item>;
          },
        },
        {
          title: intl.get(`${commonPrompt}.contactMail`).d('操作'),
          dataIndex: 'contactMail',
          width: 60,
          render: (_, record) => (
            <a onClick={() => this.handleProductPreview(record)}>
              {intl.get(`${commonPrompt}.preview`).d('预览')}
            </a>
          ),
        },
      ];
    } else {
      columns = [
        {
          title: intl.get(`${commonPrompt}.orderSeq`).d('排序号'),
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
                          name: intl.get(`${commonPrompt}.orderSeq`).d('排序号'),
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
          title: intl.get(`${commonPrompt}.sourceType`).d('商品类型'),
          dataIndex: 'sourceType',
          render: (val, record) =>
            ['update', 'create'].includes(record._status) ? (
              <React.Fragment>
                <Form.Item>
                  {record.$form.getFieldDecorator('sourceType', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`${commonPrompt}.sourceType`).d('商品类型'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      onChange={(value, dataList) => this.changeSourceFrom(value, dataList, record)}
                      style={{ width: '80px' }}
                    >
                      {sourceType &&
                        sourceType.map(item => (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </React.Fragment>
            ) : (
              val
            ),
        },
        {
          title: intl.get(`${commonPrompt}.supplier`).d('供应商'),
          dataIndex: 'supplierCompanyName',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getFieldValue,
            } = record.$form;
            getFieldDecorator('sourceFrom', { initialValue: record.sourceFrom });
            getFieldDecorator('sourceFromName', { initialValue: record.sourceFromName });
            getFieldDecorator('supplierCompanyName', { initialValue: val });
            getFieldDecorator('ecPlatformCode'); // 挂空表单
            getFieldDecorator('supplierTenantId', { initialValue: record.supplierTenantId });
            getFieldDecorator('supplierId', { initialValue: record.supplierCompanyId });
            return record._status === 'update' ||
              (record._status === 'create' && getFieldDecorator) ? (
              <Form.Item>
                {getFieldDecorator('supplierCompanyId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.supplier`).d('供应商'),
                      }),
                    },
                  ],
                  initialValue: record.supplierCompanyId,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={$getFieldValue('supplierCompanyName')}
                    code={
                      $getFieldValue('sourceType') === 'EC'
                        ? 'SCEC.COMPANY_EC_CLIENT'
                        : 'SCEC.COMPANY_SUPPLIER'
                    }
                    disabled={!$getFieldValue('sourceType')}
                    queryParams={{ companyId }}
                    onChange={(_, item) => {
                      setFieldsValue({
                        productId: undefined,
                        productName: undefined,
                        supplierTenantId: item.supplierTenantId,
                        supplierId: item.supplierId,
                        supplierCompanyName: item.supplierName,
                        ecPlatformCode: item.ecPlatform ? item.ecPlatform : undefined,
                        sourceFrom:
                          $getFieldValue('sourceType') === 'EC' ? item.ecPlatform : 'CATA',
                      });
                    }}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`${commonPrompt}.ecProductNum`).d('商品编号'),
          dataIndex: 'productNum',
          render: (val, record) => {
            const {
              getFieldDecorator,
              setFieldsValue,
              getFieldValue: $getFieldValue,
            } = record.$form;
            getFieldDecorator('productNum', { initialValue: val });
            return record._status === 'update' ||
              (record._status === 'create' && getFieldDecorator) ? (
              <Form.Item>
                {getFieldDecorator('productId', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${commonPrompt}.ecProductNum`).d('商品编号'),
                      }),
                    },
                  ],
                  initialValue: record.productId,
                })(
                  <Lov
                    style={{ width: '133px' }}
                    textValue={$getFieldValue('productNum')}
                    lovOptions={{ displayField: 'productNum', valueField: 'productId' }}
                    textField="productNum"
                    code={
                      $getFieldValue('sourceType') === 'EC'
                        ? 'SCEC.EC_COMPANY_PRODUCT_LIST'
                        : 'SCEC.COMPANY_PRODUCT'
                    }
                    queryParams={{
                      supplierId: $getFieldValue('supplierCompanyId'),
                      companyId,
                      // sourceFrom: $getFieldValue('sourceFrom'),
                      platform: [$getFieldValue('ecPlatformCode')],
                    }}
                    disabled={!$getFieldValue('supplierCompanyName')}
                    onChange={(_, item) => {
                      setFieldsValue({
                        productNum: item.productNum,
                        productId: item.productId,
                        productName: item.productName,
                      });
                    }}
                  />
                )}
              </Form.Item>
            ) : (
              val
            );
          },
        },
        {
          title: intl.get(`${commonPrompt}.ecProductName`).d('商品名称'),
          dataIndex: 'productName',
          width: 500,
          render: (val, record) => {
            const { getFieldDecorator, getFieldValue: $getFieldValue } = record.$form;
            getFieldDecorator('productName', { initialValue: val });
            return <Form.Item>{$getFieldValue('productName')}</Form.Item>;
          },
        },
        {
          title: intl.get(`${commonPrompt}.contactMail`).d('操作'),
          dataIndex: 'contactMail',
          width: 60,
          render: (_, record) => (
            <a onClick={() => this.handleProductPreview(record)}>
              {intl.get(`${commonPrompt}.preview`).d('预览')}
            </a>
          ),
        },
      ];
    }
    return columns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      // saveLoading,
      deleteLoading,
      goodsRowSelection,
      goodsLineSelectedRowKeys,
      dataSource = [],
      pagination,
      onChange,
      onCreateLine,
      // onSaveLine,
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
          onChange={page => onChange(page)}
          onDataChange={this.hasChangeData}
        />
      </React.Fragment>
    );
  }
}
