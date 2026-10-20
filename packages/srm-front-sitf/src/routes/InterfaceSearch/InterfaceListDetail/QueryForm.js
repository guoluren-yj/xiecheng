/**
 * QueryForm - 接口查询 - 接口表 - 查询表单
 * @date: 2018-9-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, DatePicker, Select } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isNull } from 'lodash';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 下拉选择框
 */
const { Option } = Select;
/**
 * 表单布局样式
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 接口查询 - 接口表 - 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      srmStartValue: null, // srm起始时间
      srmEndValue: null, // srm结尾时间
      erpStartValue: null, // erp起始时间
      erpEndValue: null, // erp结尾时间
      expand: true,
    };
  }

  /**
   *表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询数据
   */
  @Bind()
  queryValue() {
    const { queryValue, form } = this.props;
    form.validateFields((err) => {
      if (!err) {
        queryValue();
      }
    });
  }

  /**
   * 时间组件改变事件
   * @param {String} field 控件名称
   * @param {Date} value 日期值
   */
  @Bind()
  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  /**
   * 设置srm不可选择开始日期
   * @param {Date} srmStartValue srm开始日期
   */
  @Bind()
  srmDisabledStartDate(srmStartValue) {
    const { srmEndValue } = this.state;
    if (!srmStartValue || !srmEndValue) {
      return false;
    }
    return srmStartValue.valueOf() > srmEndValue.valueOf();
  }

  /**
   * 设置srm不可选择结尾日期
   * @param {Date} srmEndValue srm结尾日期
   */
  @Bind()
  srmDisabledEndDate(srmEndValue) {
    const { srmStartValue } = this.state;
    if (!srmEndValue || !srmStartValue) {
      return false;
    }
    return srmEndValue.valueOf() <= srmStartValue.valueOf();
  }

  /**
   * srm起始时间组件改变事件
   * @param {Date} value 选择时间
   */
  @Bind()
  onSRMStartChange(value) {
    this.onChange('srmStartValue', value);
  }

  /**
   * srm结尾时间组件改变事件
   * @param {Date} value 选择时间
   */
  @Bind()
  onSRMEndChange(value) {
    this.onChange('srmEndValue', value);
  }

  /**
   * 设置erp不可选择开始日期
   * @param {Date} erpStartValue srm开始日期
   */
  @Bind()
  erpDisabledStartDate(erpStartValue) {
    const { erpEndValue } = this.state;
    if (!erpStartValue || !erpEndValue) {
      return false;
    }
    return erpStartValue.valueOf() > erpEndValue.valueOf();
  }

  /**
   * 设置erp不可选择结尾日期
   * @param {Date} erpEndValue erp结尾日期
   */
  @Bind()
  erpDisabledEndDate(erpEndValue) {
    const { erpStartValue } = this.state;
    if (!erpEndValue || !erpStartValue) {
      return false;
    }
    return erpEndValue.valueOf() <= erpStartValue.valueOf();
  }

  /**
   * erp起始时间组件改变事件
   * @param {Date} value 选择时间
   */
  @Bind()
  onERPStartChange(value) {
    this.onChange('erpStartValue', value);
  }

  /**
   * erp结尾时间组件改变事件
   * @param {Date} value 选择时间
   */
  @Bind()
  onERPEndChange(value) {
    this.onChange('erpEndValue', value);
  }

  // 是否展开
  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  /**
   *渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { configData = {}, codes = [] } = this.props;
    const { expand } = this.state;
    return (
      <div className="table-list-search" style={{ marginTop: '-16px' }}>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row>
                {/* {!fetchId.batchId && (
                  <Col span={8}>
                    <FormItem {...formItemProps} label={intl.get('entity.tenan.tag').d('租户')}>
                      {getFieldDecorator('tenant', {
                        initialValue: organizationId === 0 ? undefined : tenantInfo.tenantId,
                      })(
                        <Lov
                          code="HPFM.TENANT"
                          disabled={!!(organizationId && organizationId !== 0)}
                          textValue={
                            organizationId === 0 ? '' : tenantInfo && tenantInfo.tenantName
                          }
                        />
                      )}
                    </FormItem>
                  </Col>
                )} */}
                {configData.numberColumnName && (
                  <Col span={8}>
                    <FormItem {...formItemProps} label={configData.numberColumnComment}>
                      {getFieldDecorator(configData.numberColumnName)(<Input />)}
                    </FormItem>
                  </Col>
                )}
                {configData && configData.erpDateColumnName && (
                  <React.Fragment>
                    <Col span={8}>
                      <FormItem
                        {...formItemProps}
                        label={intl
                          .get('sitf.interfaceSearch.model.interfaceSearch.erpDateColumnNameFrom')
                          .d('ERP创建时间从')}
                      >
                        {getFieldDecorator(`${configData.erpDateColumnName}From`, {
                          getValueFromEvent: (momentDate) =>
                            momentDate && momentDate.format(DEFAULT_DATETIME_FORMAT),
                          getValueProps: (dateStr) => ({
                            value: dateStr && moment(dateStr, getDateTimeFormat()),
                          }),
                        })(
                          <DatePicker
                            disabledDate={this.erpDisabledStartDate}
                            showTime
                            format={getDateTimeFormat()}
                            placeholder=""
                            onChange={this.onERPStartChange}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemProps}
                        label={intl
                          .get('sitf.interfaceSearch.model.interfaceSearch.erpDateColumnNameTo')
                          .d('ERP创建时间至')}
                      >
                        {getFieldDecorator(`${configData.erpDateColumnName}To`, {
                          getValueFromEvent: (momentDate) =>
                            momentDate && momentDate.format(DEFAULT_DATETIME_FORMAT),
                          getValueProps: (dateStr) => ({
                            value: dateStr && moment(dateStr, getDateTimeFormat()),
                          }),
                        })(
                          <DatePicker
                            disabledDate={this.erpDisabledEndDate}
                            showTime
                            format={getDateTimeFormat()}
                            placeholder=""
                            onChange={this.onERPEndChange}
                          />
                        )}
                      </FormItem>
                    </Col>
                  </React.Fragment>
                )}
                {configData && configData.srmDateColumnName && (
                  <React.Fragment>
                    <Col
                      span={8}
                      style={{
                        display: isNull(configData.numberColumnName)
                          ? 'block'
                          : expand
                          ? 'none'
                          : 'block',
                      }}
                    >
                      <FormItem
                        {...formItemProps}
                        label={intl
                          .get('sitf.interfaceSearch.model.interfaceSearch.srmDateColumnNameFrom')
                          .d('SRM创建时间从')}
                      >
                        {getFieldDecorator(`${configData.srmDateColumnName}From`, {
                          getValueFromEvent: (momentDate) =>
                            momentDate && momentDate.format(DEFAULT_DATETIME_FORMAT),
                          getValueProps: (dateStr) => ({
                            value: dateStr && moment(dateStr, getDateTimeFormat()),
                          }),
                        })(
                          <DatePicker
                            disabledDate={this.srmDisabledStartDate}
                            showTime
                            format={getDateTimeFormat()}
                            placeholder=""
                            onChange={this.onSRMStartChange}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                      <FormItem
                        {...formItemProps}
                        label={intl
                          .get('sitf.interfaceSearch.model.interfaceSearch.srmDateColumnNameTo')
                          .d('SRM创建时间至')}
                      >
                        {getFieldDecorator(`${configData.srmDateColumnName}To`, {
                          getValueFromEvent: (momentDate) =>
                            momentDate && momentDate.format(DEFAULT_DATETIME_FORMAT),
                          getValueProps: (dateStr) => ({
                            value: dateStr && moment(dateStr, getDateTimeFormat()),
                          }),
                        })(
                          <DatePicker
                            disabledDate={this.srmDisabledEndDate}
                            showTime
                            format={getDateTimeFormat()}
                            placeholder=""
                            onChange={this.onSRMEndChange}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8} style={{ display: expand ? 'none' : 'block' }}>
                      <FormItem
                        {...formItemProps}
                        label={intl
                          .get('sitf.interfaceSearch.model.interfaceSearch.itfStatus')
                          .d('数据状态')}
                      >
                        {getFieldDecorator('status')(
                          <Select allowClear style={{ width: '100%' }}>
                            {codes &&
                              codes.map((code) => {
                                return (
                                  <Option value={code.value} key={code.value}>
                                    {code.meaning}
                                  </Option>
                                );
                              })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </React.Fragment>
                )}
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button style={{ display: expand ? 'inline-block' : 'none' }} onClick={this.toggle}>
                  {intl.get(`sitf.common.button.more.inquire`).d('更多查询')}
                </Button>
                <Button style={{ display: expand ? 'none' : 'inline-block' }} onClick={this.toggle}>
                  {intl.get(`hzero.common.button.collected`).d('收起查询')}
                </Button>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" onClick={() => this.queryValue()} htmlType="submit">
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
