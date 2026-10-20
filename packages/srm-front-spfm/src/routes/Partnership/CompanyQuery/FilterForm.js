/**
 * FilterForm -公司查询页面(查询部分)
 * @date: 2018-8-8
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, DatePicker, Row, Col, Icon, Select, notification } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';

const { Option } = Select;
@Form.create({ fieldNameProp: null })
@connect(({ partnership }) => ({
  partnership,
}))
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  /**
   *  查询公司列表(带条件查询)
   */
  @Bind()
  handleSearch() {
    const { onFeacthCompanyDate, form } = this.props;
    form.validateFields((err, filedValues) => {
      const isEmptyArr = Object.values(filedValues).filter((item) => item);
      if (!err) {
        if (isEmptyArr.length) {
          onFeacthCompanyDate({
            ...filedValues,
          });
        } else {
          notification.warning({
            message: intl
              .get('spfm.partnership.view.message.queryConfirm')
              .d('请至少使用一个查询条件进行查询'),
          });
        }
      }
    });
  }

  /**
   * 表单重置
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

  renderForm() {
    const {
      form: { getFieldDecorator, getFieldValue },
      partnership,
      format,
    } = this.props;
    const { enabledStatus = [], sourceCodeArr = [] } = partnership;
    const { display } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <div className="table-list-search">
        <Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('entity.company.code').d('公司编码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('companyNum')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('entity.company.name').d('公司名称')}
                      {...formlayout}
                    >
                      {getFieldDecorator('companyName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.registerTimeFrom')
                        .d('注册时间从')}
                      {...formlayout}
                    >
                      {getFieldDecorator('registerTimeFrom')(
                        <DatePicker
                          disabledDate={(currentDate) =>
                            getFieldValue('registerTimeTo') &&
                            moment(getFieldValue('registerTimeTo')).isBefore(currentDate, 'day')
                          }
                          format={format}
                          placeholder=""
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.registerTimeTo')
                        .d('注册时间至')}
                      {...formlayout}
                    >
                      {getFieldDecorator('registerTimeTo')(
                        <DatePicker
                          disabledDate={(currentDate) =>
                            getFieldValue('registerTimeFrom') &&
                            moment(getFieldValue('registerTimeFrom')).isAfter(currentDate, 'day')
                          }
                          format={format}
                          placeholder=""
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('spfm.partnership.model.company.groupName').d('所属集团')}
                      {...formlayout}
                    >
                      {getFieldDecorator('groupName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={intl.get('hzero.common.status').d('状态')} {...formlayout}>
                      {getFieldDecorator('enabledFlag')(
                        <Select allowClear>
                          {enabledStatus.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  {/* <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.enterpriseCode')
                        .d('企业代码查询')}
                      {...formlayout}
                    >
                      {getFieldDecorator('enterpriseCode')(<Input />)}
                    </Form.Item>
                  </Col> */}
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('spfm.partnership.model.company.sourceCode').d('来源方式')}
                      {...formlayout}
                    >
                      {getFieldDecorator('sourceCode')(
                        <Select allowClear>
                          {sourceCodeArr.map((n) => (
                            <Option key={n.value} value={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('hzero.common.tenantName').d('所属租户')}
                      {...formlayout}
                    >
                      {getFieldDecorator('tenantName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.unifiedSocialCode')
                        .d('统一社会信用代码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('unifiedSocialCode')(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('spfm.partnership.model.company.dunsCode').d('邓白氏编码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('dunsCode')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.organizingInstitutionCode')
                        .d('组织机构代码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('organizingInstitutionCode')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get('spfm.partnership.model.company.businessRegistrationNumber')
                        .d('企业注册登记号/税号')}
                      {...formlayout}
                    >
                      {getFieldDecorator('businessRegistrationNumber')(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    style={{ marginLeft: 8 }}
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                  <a
                    style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
                  </a>
                  <a
                    style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                    onClick={this.toggleForm}
                  >
                    {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
                  </a>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Fragment>
      </div>
    );
  }

  render() {
    return <div className="operation-btn">{this.renderForm()}</div>;
  }
}
