import React, { Component } from 'react';
import moment from 'moment';
import { isEmpty } from 'lodash';
import { Input, Form, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const { Option } = Select;

const promptCode = 'ssrc.expertScoring';

@connect(({ supplierQuotation }) => ({
  supplierQuotation,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/expert-scoring/history/list' })
export default class FilterHistoryForm extends Component {
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
    form.validateFields((err) => {
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
      form,
      isBid,
      form: { getFieldDecorator, getFieldValue },
      code: { inquiryMethod = [], sourceCategory = [], secondarySourceCategory = [] },
      organizationId,
      customizeFilterForm = () => {},
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    return (
      <React.Fragment>
        {customizeFilterForm(
          {
            form,
            code: 'SSRC.EXPERT_SCORE_LIST.HISTORY_FILTER_FORM',
            expand,
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get(`${promptCode}.model.expertScoring.sourceNum`).d('寻源单号')}
                      {...formlayout}
                    >
                      {getFieldDecorator('sourceNum')(
                        <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.expertScoring.sourceTitle`)
                        .d('寻源标题')}
                      {...formlayout}
                    >
                      {getFieldDecorator('sourceTitle')(<Input trim maxLength={40} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...formlayout}>
                      {getFieldDecorator('companyId')(
                        <Lov
                          code="HPFM.COMPANY"
                          queryParams={{
                            tenantId: organizationId,
                          }}
                          textValue="companyName"
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: expand ? 'none' : 'block' }}>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.expertScoring.sourceCategory`)
                        .d('寻源类别')}
                      {...formlayout}
                    >
                      {getFieldDecorator(isBid ? 'secondarySourceCategory' : 'sourceCategory')(
                        <Select allowClear>
                          {(isBid ? secondarySourceCategory : sourceCategory).map((item) => (
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
                        .get(`${promptCode}.model.expertScoring.sourceMethod`)
                        .d('寻源方式')}
                      {...formlayout}
                    >
                      {getFieldDecorator('sourceMethod')(
                        <Select allowClear>
                          {inquiryMethod &&
                            inquiryMethod.map((item) => (
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
                      label={intl.get(`${promptCode}.model.expertScoring.agent`).d('经办人')}
                      {...formlayout}
                    >
                      {getFieldDecorator('id')(
                        <Lov
                          code="SSRC.PREQUAL_USER"
                          queryParams={{
                            organizationId,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl
                        .get(`${promptCode}.model.expertScoring.bidOpenDateFrom`)
                        .d('开标时间从')}
                      {...formlayout}
                    >
                      {getFieldDecorator('bidOpenDateFrom')(
                        <DatePicker
                          disabledDate={(currentDate) =>
                            getFieldValue('bidOpenDateFrom') &&
                            moment(getFieldValue('bidOpenDateFrom')).isBefore(currentDate, 'day')
                          }
                          style={{ width: '100%' }}
                          showTime={{
                            defaultValue: moment('00:00:00', 'HH:mm:ss'),
                          }}
                          format={getDateTimeFormat()}
                          placeholder=""
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formlayout}
                      label={intl
                        .get(`${promptCode}.model.expertScoring.bidOpenDateTo`)
                        .d('开标时间至')}
                    >
                      {getFieldDecorator('bidOpenDateTo')(
                        <DatePicker
                          disabledDate={(currentDate) =>
                            getFieldValue('bidOpenDateTo') &&
                            moment(getFieldValue('bidOpenDateTo')).isBefore(currentDate, 'day')
                          }
                          style={{ width: '100%' }}
                          showTime={{
                            defaultValue: moment('23:59:59', 'HH:mm:ss'),
                          }}
                          format={getDateTimeFormat()}
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
                    style={{ marginLeft: 8, display: expand ? 'none' : 'inline-block' }}
                    onClick={this.toggle}
                  >
                    {intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button
                    style={{ marginLeft: 8, display: expand ? 'inline-block' : 'none' }}
                    onClick={this.toggle}
                  >
                    {intl.get('hzero.common.button.collected').d('收起查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.queryReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.fetchInterfaceDef}
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
