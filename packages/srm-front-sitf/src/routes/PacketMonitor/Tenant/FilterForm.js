/**
 * PacketMonitor -form 接口请求报文监控-查询部分
 * @date: 2018-11-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Row, Col, DatePicker, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';

import intl from 'utils/intl';

import Lov from 'components/Lov';

const { Option } = Select;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  /**
   * 查询接口请求报文监控
   */
  @Bind()
  fetchMonitor() {
    const { form, onFetchPacketMonitor } = this.props;
    form.validateFields((err, values) => {
      const timeFrom = form.getFieldValue('requestDateFrom');
      const timeTo = form.getFieldValue('requestDateTo');
      if (!err) {
        if (moment(timeTo).isBefore(timeFrom, 'second')) {
          notification.warning({
            message: intl
              .get('sitf.PacketMonitor.view.time.warning')
              .d('创建开始时间不可大于创建结束时间'),
          });
          return;
        }
        onFetchPacketMonitor({
          ...values,
        });
      }
    });
  }

  @Bind()
  queryReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      organizationRole,
      format,
      code,
      organizationId,
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };

    // 获取当前3天时间
    const currentNewDate = new Date();
    const beforeDate = currentNewDate.setDate(currentNewDate.getDate() - 3);
    const beforeThreeDate = moment(new Date(beforeDate)).format(DATETIME_MIN);

    return (
      <div className="table-list-search">
        <Fragment>
          <Form className="more-fields-form">
            <Row>
              <Col span={18}>
                {!organizationRole && (
                  <Col span={8}>
                    <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formlayout}>
                      {getFieldDecorator('tenantId', {
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('entity.tenant.tag').d('租户'),
                            }),
                          },
                        ],
                      })(<Lov code="SITF.MONITOR_SYSTEM.TENANT" textField="tenantName" />)}
                    </Form.Item>
                  </Col>
                )}
                <Col span={8}>
                  <Form.Item
                    label={intl.get('sitf.PacketMonitor.model.PacketMonitor.batchNum').d('批次号')}
                    {...formlayout}
                  >
                    {getFieldDecorator('batchNum')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get('sitf.PacketMonitor.model.PacketMonitor.interfaceCode')
                      .d('接口编码')}
                    {...formlayout}
                  >
                    {getFieldDecorator('interfaceCode')(
                      <Lov
                        code="SITF.INTERFACE"
                        textField="interfaceCode"
                        queryParams={{ tenantId: organizationId }}
                        lovOptions={{ valueField: 'interfaceCode' }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col
                  span={8}
                  style={{ display: organizationRole ? 'block' : expand ? 'none' : 'block' }}
                >
                  <Form.Item
                    label={intl
                      .get('sitf.PacketMonitor.model.PacketMonitor.requestUri')
                      .d('请求URI')}
                    {...formlayout}
                  >
                    {getFieldDecorator('requestUri')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                  <Form.Item
                    label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                    {...formlayout}
                  >
                    {getFieldDecorator('requestDateFrom', {
                      initialValue: moment(beforeThreeDate),
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hzero.common.date.creation.from').d('创建日期从'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        showTime={{
                          hideDisabledOptions: true,
                          defaultValue: moment('00:00:00', 'HH:mm:ss'),
                        }}
                        disabledDate={(currentDate) =>
                          getFieldValue('requestDateTo') &&
                          moment(getFieldValue('requestDateTo')).isBefore(currentDate, 'second')
                        }
                        format={format}
                        placeholder=""
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                  <Form.Item
                    label={intl.get(`hzero.common.date.creation.to`).d('创建时间至')}
                    {...formlayout}
                  >
                    {getFieldDecorator('requestDateTo')(
                      <DatePicker
                        showTime={{
                          hideDisabledOptions: true,
                          // defaultValue: moment('00:00:00', 'HH:mm:ss'),
                        }}
                        disabledDate={(currentDate) =>
                          getFieldValue('requestDateFrom') &&
                          moment(getFieldValue('requestDateFrom')).isAfter(currentDate, 'second')
                        }
                        format={format}
                        placeholder=""
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                  <Form.Item
                    label={intl
                      .get('sitf.PacketMonitor.model.PacketMonitor.requestMethod')
                      .d('请求方法')}
                    {...formlayout}
                  >
                    {getFieldDecorator('requestMethod')(
                      <Select allowClear>
                        {code.map((item) => {
                          return (
                            <Option label={item.meaning} value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                  <Form.Item
                    label={intl
                      .get('sitf.PacketMonitor.model.PacketMonitor.clientIp')
                      .d('客户端IP')}
                    {...formlayout}
                  >
                    {getFieldDecorator('clientIp')(<Input />)}
                  </Form.Item>
                </Col>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button
                    style={{ display: expand ? 'inline-block' : 'none' }}
                    onClick={this.toggle}
                  >
                    {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
                  </Button>
                  <Button
                    style={{ display: expand ? 'none' : 'inline-block' }}
                    onClick={this.toggle}
                  >
                    {intl.get(`sitf.common.button.more.inquire`).d('收起查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.queryReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.fetchMonitor}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Fragment>
      </div>
    );
  }
}
