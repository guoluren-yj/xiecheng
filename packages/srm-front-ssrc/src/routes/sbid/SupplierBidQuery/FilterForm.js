import React, { Component } from 'react';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import Lov from 'components/Lov';
import moment from 'moment';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

const { Option } = Select;

const promptCode = 'ssrc.supplierBidQuery';
@connect(({ supplierQuotation }) => ({
  supplierQuotation,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/query-quotation/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  // 条件查询
  @Bind()
  fetchInterfaceDef() {
    const { form, onConditional } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      code: { inquiryMethod = [], bidType = [] },
      organizationId,
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.supplierBidQuery.bidTitle`).d('招标事项')}
                  {...formlayout}
                >
                  {getFieldDecorator('bidTitle')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.supplierBidQuery.companyBid`).d('招标公司')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SSRC.USER_AUTH_CUSTOMER"
                      queryParams={{
                        tenantId: organizationId,
                      }}
                      textField="companyName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.supplierBidQuery.bidNum`).d('招标编号')}
                  {...formlayout}
                >
                  {getFieldDecorator('bidNum')(<Input trim inputChinese={false} maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.supplierBidQuery.bidType`).d('招标类别')}
                  {...formlayout}
                >
                  {getFieldDecorator('bidType')(
                    <Select allowClear>
                      {bidType &&
                        bidType.map(item => (
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
                    .get(`${promptCode}.model.supplierBidQuery.sourceMethod`)
                    .d('寻源方式')}
                  {...formlayout}
                >
                  {getFieldDecorator('sourceMethod')(
                    <Select allowClear>
                      {inquiryMethod &&
                        inquiryMethod.map(item => (
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
                    .get(`${promptCode}.model.supplierBidQuery.quotationNum`)
                    .d('投标编号')}
                  {...formlayout}
                >
                  {getFieldDecorator('quotationNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.supplierBidQuery.dataFrom`).d('投标日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('quotationDateFrom')(
                    <DatePicker
                      disabledDate={currentDate =>
                        getFieldValue('quotationDateTo') &&
                        moment(getFieldValue('quotationDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl.get(`${promptCode}.model.supplierBidQuery.dateEnd`).d('投标日期至')}
                >
                  {getFieldDecorator('quotationDateTo')(
                    <DatePicker
                      disabledDate={currentDate =>
                        getFieldValue('quotationDateFrom') &&
                        moment(getFieldValue('quotationDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.bidEndFrom`)
                    .d('投标截止日期从')}
                >
                  {getFieldDecorator('quotationEndDateFrom')(
                    <DatePicker
                      disabledDate={currentDate =>
                        getFieldValue('quotationEndDateTo') &&
                        moment(getFieldValue('quotationEndDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formlayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.bidDateEnd`)
                    .d('投标截止日期至')}
                >
                  {getFieldDecorator('quotationEndDateTo')(
                    <DatePicker
                      disabledDate={currentDate =>
                        getFieldValue('quotationEndDateFrom') &&
                        moment(getFieldValue('quotationEndDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                      format={getDateFormat()}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                onClick={this.toggle}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.queryReset}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.fetchInterfaceDef}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
