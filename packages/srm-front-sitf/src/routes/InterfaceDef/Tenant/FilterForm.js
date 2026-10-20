/**
 * InterfaceDef -接口定义页面 查询页
 * @date: 2018-11-23
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Input, Form, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;

const { Option } = Select;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/interface-def' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  @Bind()
  fetchInterfaceDef() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
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

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const {
      form: { getFieldDecorator },
      code,
      organizationRole,
    } = this.props;
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    const leftAllColSpans = organizationRole ? 18 : 12;
    const leftOneColSpans = organizationRole ? 8 : 12;
    return (
      <div className="table-list-search">
        <Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={leftAllColSpans}>
                <Row>
                  {organizationRole && (
                    <Col span={leftOneColSpans}>
                      <Form.Item
                        label={intl.get('entity.application.group').d('应用组')}
                        {...formlayout}
                      >
                        {getFieldDecorator('applicationGroupCode')(
                          <Lov code="SIFC.APPLICATION_GROUPS" textField="applicationGroupName" />
                        )}
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={leftOneColSpans}>
                    <Form.Item
                      label={intl.get('entity.interface.code').d('接口代码')}
                      {...formlayout}
                    >
                      {getFieldDecorator('interfaceCode')(
                        <Input typeCase="upper" trim inputChinese={false} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={leftOneColSpans}>
                    <FormItem
                      label={intl.get('entity.interface.type').d('接口类型')}
                      {...formlayout}
                    >
                      {getFieldDecorator('interfaceType')(
                        <Select allowClear>
                          {(code.interface || []).map((n) =>
                            (n || {}).value ? (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            ) : undefined
                          )}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col
                    span={leftOneColSpans}
                    style={{ display: !expand ? 'inline-block' : 'none' }}
                  >
                    <Form.Item
                      label={intl.get('entity.interface.name').d('接口名称')}
                      {...formlayout}
                    >
                      {getFieldDecorator('interfaceName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col
                    span={leftOneColSpans}
                    style={{ display: !expand ? 'inline-block' : 'none' }}
                  >
                    <Form.Item
                      label={intl.get('entity.interface.individualYON').d('是否二开')}
                      {...formlayout}
                    >
                      {getFieldDecorator('individualFlag')(
                        <Select allowClear style={{ width: '100%' }}>
                          {(code.individual || []).map((n) =>
                            (n || {}).value ? (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            ) : undefined
                          )}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} style={{ display: 'inline-block' }} className="search-btn-more">
                <Form.Item>
                  {organizationRole &&
                    (!expand ? (
                      <Button style={{ display: 'inline-block' }} onClick={this.toggle}>
                        {intl.get(`hzero.common.button.collected`).d('收起查询')}
                      </Button>
                    ) : (
                      <Button style={{ display: 'inline-block' }} onClick={this.toggle}>
                        {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
                      </Button>
                    ))}
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
        </Fragment>
      </div>
    );
  }
}
