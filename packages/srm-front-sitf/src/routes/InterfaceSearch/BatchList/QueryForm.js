/**
 * InterfaceSearch - 接口查询 - 接口列表 - 查询表单 - 租户级
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isNil } from 'lodash';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateTimeFormat } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 下拉选择框
 */
const { Option } = Select;
/**
 * 表单布局属性
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 接口查询 - 接口列表 - 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/interface-search/list' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true, // 查询框显示/隐藏标记
      startValue: null,
      endValue: null,
    };
  }

  componentDidMount() {
    const { batchStatus } = this.props;
    if (batchStatus && batchStatus !== 'batchStatus') {
      this.handleFormReset();
    }
    //  else {
    //   queryValue();
    // }
  }

  /**
   *表单重置
   */
  @Bind()
  handleFormReset() {
    const { form, onResetModelData } = this.props;
    onResetModelData();
    form.resetFields();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryValue() {
    const { queryValue, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        queryValue({
          ...fieldsValue,
        });
      }
    });
  }

  /**
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 设置时间控件不可编辑起始时间日期
   * @param {Date} startValue 截止日期
   */
  @Bind()
  disabledStartDate(startValue) {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  /**
   * 设置时间控件不可编辑起始结束日期
   * @param {Date} endValue 截止日期
   */
  @Bind()
  disabledEndDate(endValue) {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  /**
   * 日期组件改变事件
   */
  @Bind()
  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  /**
   * 起始日期组件变化事件
   * @param {Date} value 日期数据
   */
  @Bind()
  onStartChange(value) {
    this.onChange('startValue', value);
  }

  /**
   * 结束日期组件变化事件
   * @param {Date} value 日期数据
   */
  @Bind()
  onEndChange(value) {
    this.onChange('endValue', value);
  }

  /**
   *渲染查询结构
   *
   * @returns
   * @memberof CurrencyList
   */
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { codes = [], queryData = {} } = this.props;
    const { expand } = this.state;

    const currentDate = new Date();
    const preDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));

    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={24}>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem label={intl.get('entity.tenant.name').d('租户名称')} {...formItemProps}>
                    {getFieldDecorator('tenant', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('entity.tenant.name').d('租户名称'),
                          }),
                        },
                      ],
                      initialValue: queryData.tenant,
                    })(
                      <Lov
                        allowClear
                        code="SITF.MONITOR_SYSTEM.TENANT"
                        textField="tenantName"
                        textValue={queryData.tenantName}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('entity.application.group').d('应用组')}
                  >
                    {getFieldDecorator('applicationGroupCode')(
                      <Lov
                        style={{ width: '100%' }}
                        code="SIFC.APPLICATION_GROUPS"
                        textField="applicationGroupName"
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('sitf.common.data.externalSystemName').d('外部系统名称')}
                  >
                    {getFieldDecorator('externalSystemCode')(
                      <Lov
                        style={{ width: '100%' }}
                        code="SIFC.EXTERNAL_SYSTEM"
                        textField="externalSystemName"
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: expand ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('entity.interface.name').d('接口名称')}
                  >
                    {getFieldDecorator(
                      'interfaceId',
                      {}
                    )(
                      <Lov
                        allowClear
                        code="SITF.INTERFACE"
                        disabled={isNil(getFieldValue('tenant'))}
                        queryParams={{ tenantId: getFieldValue('tenant') }}
                        textField="interfaceName"
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('sitf.common.action.flag').d('是否出错')}
                  >
                    {getFieldDecorator('errorFlag')(
                      <Select allowClear style={{ width: '100%' }}>
                        <Option value={0} key={0}>
                          {intl.get(`hzero.common.status.no`).d('否')}
                        </Option>
                        <Option value={1} key={1}>
                          {intl.get(`hzero.common.status.yes`).d('是')}
                        </Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('sitf.common.data.docNum').d('IDOC编码')}
                  >
                    {getFieldDecorator('docNum')(
                      <Input trim inputChinese={false} style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('sitf.common.batch.number').d('批次号')}
                  >
                    {getFieldDecorator('batchNum')(
                      <Input trim inputChinese={false} style={{ width: '100%' }} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                  >
                    {getFieldDecorator('creationDateFrom', {
                      initialValue: queryData.creationDateFrom
                        ? moment(queryData.creationDateFrom, getDateTimeFormat())
                        : moment(preDate, getDateTimeFormat()),

                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('entity.tenant.creationDateFrom').d('创建日期从'),
                          }),
                        },
                      ],
                    })(
                      <DatePicker
                        disabledDate={this.disabledStartDate}
                        showTime
                        style={{ width: '100%' }}
                        format={getDateTimeFormat()}
                        placeholder=""
                        onChange={this.onStartChange}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('hzero.common.date.creation.to').d('创建时间至')}
                  >
                    {getFieldDecorator('creationDateTo', {
                      initialValue: queryData.creationDateTo
                        ? moment(queryData.creationDateTo, getDateTimeFormat())
                        : null,
                    })(
                      <DatePicker
                        disabledDate={this.disabledEndDate}
                        style={{ width: '100%' }}
                        showTime
                        format={getDateTimeFormat()}
                        placeholder=""
                        onChange={this.onEndChange}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get('sitf.common.data.executeResult').d('数据执行结果')}
                  >
                    {getFieldDecorator('dataExecuteResult', {
                      initialValue: queryData.dataExecuteResult,
                    })(
                      <Select allowClear>
                        {codes.map((code) => {
                          return (
                            <Option key={code.value} value={code.value}>
                              {code.meaning}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  style={{ display: expand ? 'inline-block' : 'none' }}
                  onClick={() => this.toggle()}
                >
                  {intl.get('scec.goodsApprove.model.goodsApprove.more.inquire').d('更多查询')}
                </Button>
                <Button
                  style={{ display: expand ? 'none' : 'inline-block' }}
                  onClick={() => this.toggle()}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
