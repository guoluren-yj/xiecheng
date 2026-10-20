import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;

const promptCode = 'ssrc.quoController';
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
@cacheComponent({ cacheKey: '/ssrc/quotation-controller/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    display: false,
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
      bidFlag,
      custKey,
      form = {},
      form: { getFieldDecorator },
      sourceMethod = [],
      rfxStatus = [],
      auctionDirection = [],
      sourceCategory = [],
      documentTypeName,
      customizeFilterForm,
    } = this.props;
    const { display } = this.state;
    return (
      <React.Fragment>
        {customizeFilterForm(
          {
            code: `SSRC.${custKey}QUOTATION_CONTROLLER.FILTER.FORM`,
            form,
            expand: display,
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.commonRFxNo.`, {
                          sourceCategoryType: bidFlag ? 'BID' : 'RFX',
                        })
                        .d('{sourceCategoryType}单号')}
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxNum')(<Input maxLength={40} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.commonInquiryTitle`, {
                          documentTypeName,
                        })
                        .d('{documentTypeName}标题')}
                      {...formLayout}
                    >
                      {getFieldDecorator('rfxTitle')(<Input maxLength={40} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.sourcingApproach`)
                        .d('寻源方式')}
                      {...formLayout}
                    >
                      {getFieldDecorator('sourceMethod')(
                        <Select allowClear>
                          {sourceMethod &&
                            sourceMethod.map((item) => (
                              <Option key={item.meaning} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'block' : 'none' }}>
                  {!bidFlag ? (
                    <Col span={8}>
                      <FormItem
                        label={intl
                          .get(`${promptCode}.model.quoController.sourcingCategory`)
                          .d('寻源类别')}
                        {...formLayout}
                      >
                        {getFieldDecorator('sourceCategory')(
                          <Select allowClear>
                            {sourceCategory &&
                              sourceCategory.map((item) => (
                                <Option key={item.meaning} value={item.value}>
                                  {item.meaning}
                                </Option>
                              ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  ) : null}
                  <Col span={8}>
                    <FormItem label={intl.get(`hzero.common.status`).d('状态')} {...formLayout}>
                      {getFieldDecorator('rfxStatus')(
                        <Select allowClear>
                          {rfxStatus &&
                            rfxStatus.map((item) => (
                              <Option key={item.meaning} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.quoController.purchOrg`).d('采购组织')}
                      {...formLayout}
                    >
                      {getFieldDecorator('purOrganizationId')(
                        <Lov
                          code="SPFM.USER_AUTH.PURORG"
                          textField="organizationName"
                          style={{ lineHeight: '50px' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.createdUnitName`)
                        .d('创建人部门')}
                      {...formLayout}
                    >
                      {getFieldDecorator('createdUnitName')(<Input maxLength={40} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.biddingDirection`)
                        .d('报价方向')}
                      {...formLayout}
                    >
                      {getFieldDecorator('auctionDirection')(
                        <Select allowClear>
                          {auctionDirection &&
                            auctionDirection.map((item) => (
                              <Option key={item.meaning} value={item.value}>
                                {item.meaning}
                              </Option>
                            ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl.get(`${promptCode}.model.quoController.currency`).d('币种')}
                      {...formLayout}
                    >
                      {getFieldDecorator('currencyCode')(
                        <Lov
                          code="SMDM.EXCHANGE_RATE.CURRENCY"
                          textField="currencyCode"
                          style={{ lineHeight: '50px' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${promptCode}.model.quoController.sealedQuotation`)
                        .d('密封报价')}
                      {...formLayout}
                    >
                      {getFieldDecorator('sealedQuotationFlag')(
                        <Select allowClear>
                          <Option value={1}>{intl.get('hzero.common.status.yes').d('是')}</Option>
                          <Option value={0}>{intl.get('hzero.common.status.no').d('否')}</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {display
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get('hzero.common.button.viewMore').d('更多查询')}
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
        )}
      </React.Fragment>
    );
  }
}
