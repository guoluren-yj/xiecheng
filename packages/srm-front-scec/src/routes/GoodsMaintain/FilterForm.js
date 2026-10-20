/**
 * GoodsMaintain -商品维护 查询页面
 * @date: 2019-1-29
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Select, Row, Col, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const { Option } = Select;

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/goods-maintain/list' })
export default class FilterFrom extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: getCurrentOrganizationId(),
      organizationId: getUserOrganizationId(),
    };
  }

  @Bind()
  handlerSearch() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData(values);
      }
    });
  }

  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
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

  /* 选择公司Lov
  * @param {String} val 当前值
  * @param {Object} record 选择值
  */
  @Bind()
  selectCompany() {
    this.props.form.resetFields(['supplierId']);
  }

  render() {
    const { form: { getFieldDecorator, getFieldValue }, status = [], sourceType = [] } = this.props;
    const { display, tenantId, organizationId } = this.state;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.productNum').d('商品编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('productNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.productName').d('商品名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('productName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.effectiveDays').d('有效天数')}
                  {...formlayout}
                >
                  {getFieldDecorator('effectiveDays', {
                    rules: [
                      {
                        validator: (rule, value, callback) => {
                          if (value && isNaN(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.effectiveDays.fallShort')
                                  .d('有效天数不符规范')
                              )
                            );
                          } else if (value && !new RegExp(/^(-)?(\d{0,8}$)/).test(value)) {
                            callback(
                              new Error(
                                intl
                                  .get('scec.common.warning.standard.effectiveDays.overSize')
                                  .d('有效天数超过限制')
                              )
                            );
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  })(<InputNumber />)}
                </Form.Item>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button
                    style={{ display: display ? 'inline-block' : 'none' }}
                    onClick={() => this.toggleForm()}
                  >
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button
                    style={{ display: display ? 'none' : 'inline-block' }}
                    onClick={() => this.toggleForm()}
                  >
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handlerFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handlerSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
              <Col span={6}>
                <Form.Item label={intl.get('scec.common.model.company').d('公司')} {...formlayout}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="HPFM.COMPANY"
                      queryParams={{ tenantId }}
                      onChange={() => this.selectCompany()}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.supplier').d('供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierId')(
                    <Lov
                      code="SCEC.COMPANY_SUPPLIER"
                      disabled={!getFieldValue('companyId')}
                      queryParams={{
                        companyId: getFieldValue('companyId'),
                        supplierTenantId: organizationId,
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.sourceFromType').d('数据来源')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceFromType')(
                    <Select allowClear>
                      {sourceType.map(item => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.sourceFromNum').d('来源单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceFromNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.productStatus').d('状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('productStatus')(
                    <Select allowClear>
                      {status.map(item => {
                        return (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('scec.common.model.catalogEnabledFlag').d('目录被禁用')}
                  {...formlayout}
                >
                  {getFieldDecorator('catalogEnabledFlag')(
                    <Select allowClear>
                      <Option key={0} value={0}>
                        {intl.get('hzero.common.status.yes').d('是')}
                      </Option>
                      <Option key={1} value={1}>
                        {intl.get('hzero.common.status.no').d('否')}
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
