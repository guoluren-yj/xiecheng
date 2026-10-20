/**
 * FilterForm - 价格库管理/价格库
 * @date: 2019-10-23
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const { Option } = Select;

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/price-library/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: true,
  };

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      priceLibStatus = [],
      priceSource = [],
    } = this.props;
    const { display } = this.state;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.itemCode`).d('物料编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemId')(
                      <Lov code="SSRC.CUSTOMER_ITEM" textField="itemCode" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.itemName`).d('物料名称')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemName')(<Input trim maxLength={40} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.supplier`).d('供应商')}
                    {...formLayout}
                  >
                    {getFieldDecorator('supplierCompanyName')(<Input trim maxLength={40} />)}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.sourceNum`).d('寻源单号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('sourceNum')(
                      <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.contractNum`).d('合同编号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('contractNum')(
                      <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.orderNum`).d('订单编号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('orderNum')(
                      <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.companyName`).d('公司')}
                    {...formLayout}
                  >
                    {getFieldDecorator('companyId')(
                      <Lov code="SPFM.USER_AUTHORITY_COMPANY" textField="companyName" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.ouName`).d('业务实体')}
                    {...formLayout}
                  >
                    {getFieldDecorator('ouId')(<Lov code="SPFM.USER_AUTH.OU" textField="ouName" />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.organizationName`)
                      .d('库存组织')}
                    {...formLayout}
                  >
                    {getFieldDecorator('invOrganizationId')(
                      <Lov code="HPFM.INV_ORG" textField="organizationName" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.priceLibraryStatus`).d('状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('priceLibraryStatus')(
                      <Select allowClear>
                        {priceLibStatus &&
                          priceLibStatus.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.itemCategoryName`)
                      .d('物品分类')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemCategoryId')(
                      <Lov code="SMDM.TREE_ITEM_CATEGORY" textField="itemCategoryName" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`ssrc.priceLibrary.model.library.priceSource`).d('价格来源')}
                    {...formLayout}
                  >
                    {getFieldDecorator('priceSource')(
                      <Select allowClear>
                        {priceSource &&
                          priceSource.map((item) => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <Form.Item
                    {...formLayout}
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.quotationExpiryDateFrom`)
                      .d('有效期从')}
                  >
                    {getFieldDecorator('quotationExpiryDateFrom')(
                      <DatePicker
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('quotationExpiryDateTo') &&
                          moment(getFieldValue('quotationExpiryDateTo')).isBefore(
                            currentDate,
                            'day'
                          )
                        }
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...formLayout}
                    label={intl
                      .get(`ssrc.priceLibrary.model.library.quotationExpiryDateTo`)
                      .d('有效期至')}
                  >
                    {getFieldDecorator('quotationExpiryDateTo')(
                      <DatePicker
                        format={getDateFormat()}
                        disabledDate={(currentDate) =>
                          getFieldValue('quotationExpiryDateFrom') &&
                          moment(getFieldValue('quotationExpiryDateFrom')).isAfter(
                            currentDate,
                            'day'
                          )
                        }
                        style={{ width: '100%' }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
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
}
