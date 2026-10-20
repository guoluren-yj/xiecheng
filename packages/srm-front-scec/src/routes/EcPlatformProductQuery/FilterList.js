/**
 * EcPlatformProductQuery -平台电商商品查询 - form页
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: `/scec/ec-platform-product-query/list` })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: '0',
      companyId: '-1',
    };
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 展示收起更多查询条件
   */
  @Bind
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 查询
   */
  @Bind()
  handlerSearch() {
    const { form, onFetchGoods } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchGoods(values);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      enabledFlag = [],
    } = this.props;
    const { display, tenantId, companyId } = this.state;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.ecPlatformName').d('电商名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('ecPlatformCode', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('scec.common.model.choose.ecProductName')
                          .d('请选择电商名称'),
                      },
                    ],
                  })(
                    <Lov
                      code="SCEC.EC_PLATFORM_NAME"
                      textField="ecPlatformName"
                      queryParams={{ tenantId, companyId }}
                      onChange={() => {
                        setFieldsValue({
                          ecCategoryId: undefined,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.ecCategoryPlatformCatalog.model.ecCategory').d('电商分类')}
                  {...formlayout}
                >
                  {getFieldDecorator('ecCategoryId', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('scec.ecProductQuery.model.choose.ecProductCatalog')
                          .d('请选择电商分类'),
                      },
                    ],
                  })(
                    <Lov
                      code="SCEC.EC_CATEGORY_NAME"
                      textField="ecCategoryName"
                      queryParams={{
                        ecPlatformCode: getFieldValue('ecPlatformCode'),
                        tenantId,
                        companyId,
                      }}
                      disabled={!getFieldValue('ecPlatformCode')}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl
                    .get('scec.ecCategoryPlatformCatalog.model.mappingStatus')
                    .d('映射状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('mappingFlag')(
                    <Select allowClear>
                      {enabledFlag &&
                        enabledFlag.map(item => (
                          <Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={6} className="search-btn-more">
                <FormItem>
                  <Button
                    style={{ display: display ? 'inline-block' : 'none' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button
                    style={{ display: display ? 'none' : 'inline-block' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get(`hzero.common.button.collected`).d('收起查询')}
                  </Button>
                  <Button onClick={this.handlerFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.handlerSearch}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
              <Col span={6}>
                <FormItem
                  label={intl.get('scec.common.model.productNum').d('商品编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('ecProductNum')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  label={intl.get('scec.common.model.productName').d('商品名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('ecProductName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
