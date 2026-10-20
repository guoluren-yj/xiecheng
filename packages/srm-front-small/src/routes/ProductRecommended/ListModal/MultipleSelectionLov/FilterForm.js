/**
 * FilterForm - 联系人查询
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { DataSet } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import TreeSelect from '@/routes/Components/TreeSelect';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent()
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  formDs = new DataSet({
    fields: [
      {
        name: 'supplierLov',
        label: intl.get(`small.common.model.supplier`).d('供应商'),
        lovCode: 'SSLM.SUPPLIER',
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierLov.supplierCompanyId',
      },
    ],
  });

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
    if(this.formDs.current) {
      this.formDs.current.set({
        supplierLov: null,
      });
    }
  }

  @Bind()
  handleSearch() {
    const {
      onHandleSearch,
      form: { validateFields },
    } = this.props;
    validateFields((err) => {
      if (!err) {
        onHandleSearch();
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, treeList = [], sourceType = [], isNewSupplierLov } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`small.common.model.product.category`).d('商品分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('categoryId')(<TreeSelect treeList={treeList} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                {isNewSupplierLov ? (
                  <Form.Item
                    label={intl.get(`small.common.model.supplier`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCompanyId')}
                    <SupplierLov
                      name="supplierLov"
                      style={{width: '100%'}}
                      dataSet={this.formDs}
                      modalProps={{
                        onOk: () => {
                          this.props.form.setFieldsValue({
                            supplierCompanyId: this.formDs.current.get('supplierCompanyId'),
                          });
                        },
                      }}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl.get(`small.common.model.supplier`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCompanyId')(
                      <Lov
                        code="SMAL.SUPPLIER_BY_PUR"
                        queryParams={{ tenantId: getCurrentOrganizationId() }}
                      />
                    )}
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`small.common.model.common.product`).d('商品')}
                  {...formLayout}
                >
                  {getFieldDecorator('skuName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={intl.get(`small.common.model.common.productSource`).d('商品类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('sourceFrom')(
                    <Select allowClear>
                      {sourceType.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
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
}
