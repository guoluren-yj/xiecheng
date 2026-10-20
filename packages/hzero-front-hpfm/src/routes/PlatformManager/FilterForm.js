import React, { PureComponent } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'hzero-ui';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateTimeFormat, getCurrentTenant } from 'utils/utils';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const prefix = 'hpfm.login.audit.model';
const { tenantId, tenantName } = getCurrentTenant();

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      timeFormat: getDateTimeFormat(),
    };
    this.defaultStartTime = moment(moment().subtract(1, 'month').format('YYYY-MM-DD 00:00:00'));
    this.defaultEndTime = moment(moment().format('YYYY-MM-DD 23:59:59'));
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  @Bind()
  handleChangeStartDate(value) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      loginDateBefore: !value
        ? undefined
        : moment(new Date(value.format('YYYY-MM-DD')).getTime()).subtract(-1, 'month'),
    });
  }

  @Bind()
  handleChangeEndDate(value) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({
      loginDateAfter: !value
        ? undefined
        : moment(new Date(value.format('YYYY-MM-DD')).getTime()).subtract(1, 'month'),
    });
  }

  render() {
    const { /* tenantId, */ form, typeList } = this.props;
    const { expandForm, timeFormat } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { getFieldDecorator, getFieldsValue } = form;
    const { loginDateAfter, loginDateBefore } = getFieldsValue();
    const min = loginDateBefore
      ? moment(new Date(loginDateBefore.format('YYYY-MM-DD')).getTime()).subtract(1, 'month')
      : undefined;
    const max = loginDateAfter
      ? moment(new Date(loginDateAfter.format('YYYY-MM-DD')).getTime()).subtract(-1, 'month')
      : undefined;
    return (
      <div className="table-list-search">
        <Form className="more-fields-search-form">
          <Row type="flex" align="bottom" gutter={24} {...SEARCH_FORM_ROW_LAYOUT}>
            <Col span={6}>
              <Form.Item
                {...formItemLayout}
                label={intl.get(`${prefix}.auditTypeMeaning`).d('审计类型')}
              >
                {getFieldDecorator('auditType')(
                  <Select allowClear>
                    {typeList.map((item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...formItemLayout} label={intl.get(`${prefix}.account`).d('账号')}>
                {getFieldDecorator('loginName', {})(<Input trim inputChinese={false} />)}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item {...formItemLayout} label={intl.get(`${prefix}.userName`).d('名称')}>
                {getFieldDecorator('userName', {})(<Input trim />)}
              </Form.Item>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.toggleForm}>
                  {expandForm
                    ? intl.get('hzero.common.button.collected').d('收起查询')
                    : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
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
          <Row style={{ display: expandForm ? '' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
            {/* <Col span={6}>
              <Form.Item {...formItemLayout} label={intl.get(`${prefix}.phone`).d('手机号')}>
                {getFieldDecorator('phone', {})(<Input trim inputChinese={false} />)}
              </Form.Item>
            </Col> */}
            <Col span={6}>
              <Form.Item {...formItemLayout} label={intl.get(`${prefix}.tenant`).d('所属租户')}>
                {getFieldDecorator('tenantId', {
                  initialValue: tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`intl.get(${prefix}.tenant`).d('所属租户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.TENANT"
                    // onChange={(val, record) => {
                    // registerField('tenantId');
                    // setFieldsValue({ tenantId: record.tenantId });
                    // }}
                    textValue={tenantName}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                {...formItemLayout}
                label={intl.get(`${prefix}.login.time.after`).d('登录时间从')}
              >
                {getFieldDecorator('loginDateAfter', {
                  initialValue: this.defaultStartTime,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prefix}.login.time.after`).d('登录时间从'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder=""
                    format={timeFormat}
                    onChange={this.handleChangeStartDate}
                    disabledDate={(currentDate) =>
                      (loginDateBefore &&
                        moment(loginDateBefore).isBefore(currentDate, 'second')) ||
                      (min && min.isAfter(currentDate))
                    }
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                {...formItemLayout}
                label={intl.get(`${prefix}.login.time.before`).d('登录时间至')}
              >
                {getFieldDecorator('loginDateBefore', {
                  initialValue: this.defaultEndTime,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${prefix}.login.time.before`).d('登录时间至'),
                      }),
                    },
                  ],
                })(
                  <DatePicker
                    showTime
                    placeholder=""
                    format={timeFormat}
                    onChange={this.handleChangeEndDate}
                    disabledDate={(currentDate) =>
                      (loginDateAfter && moment(loginDateAfter).isAfter(currentDate, 'second')) ||
                      (max && max.isBefore(currentDate))
                    }
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
