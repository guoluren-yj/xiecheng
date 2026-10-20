/**
 * QueryFormOrg - 源数据查询 - 查询表单 - 租户级
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
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
 * 表单布局样式
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sitf/sourcedata-search/list' })
export default class QueryFormOrg extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
      startValue: null,
      endValue: null,
    };
  }

  /**
   * 表单重置
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
   * 展开或收起
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  /**
   * 隐藏创建时间从
   * @param {Date} startValue 创建时间从
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
   * 隐藏创建时间至
   * @param {Date} endValue 创建时间至
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
   * 改变创建时间至
   * @param {string} field 属性名
   * @param {Date} value 属性值
   */
  @Bind()
  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  /**
   * 选择开始时间
   * @param {Date} value 开始时间
   */
  @Bind()
  onStartChange(value) {
    this.onChange('startValue', value);
  }

  /**
   * 选择结束时间
   * @param {Date} value 结束时间
   */
  @Bind()
  onEndChange(value) {
    this.onChange('endValue', value);
  }

  /**
   * 渲染查询结构
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    const { expand } = this.state;

    return (
      <div className="table-list-search">
        <Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('entity.application.group').d('应用组')}
                    >
                      {getFieldDecorator('applicationGroupCode')(
                        <Lov code="SIFC.APPLICATION_GROUPS" />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sitf.common.data.externalSystemName').d('外部系统名称')}
                    >
                      {getFieldDecorator('externalSystemCode')(<Lov code="SIFC.EXTERNAL_SYSTEM" />)}
                    </FormItem>
                  </Col>
                  {/* <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('entity.interface.code').d('接口代码')}
                    >
                      {getFieldDecorator('interfaceCode')(
                        <Input typeCase="upper" trim inputChinese={false} />
                      )}
                    </FormItem>
                  </Col> */}
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl
                        .get('sitf.sourceDataSearch.model.sourceDataSearch.esInterfaceCode')
                        .d('外部接口代码')}
                    >
                      {getFieldDecorator('esInterfaceCode')(
                        <Input typeCase="upper" trim inputChinese={false} />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: expand ? 'none' : 'block' }}>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sitf.common.action.flag').d('是否出错')}
                    >
                      {getFieldDecorator('errorFlag')(
                        <Select allowClear>
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
                        <Input trim inputChinese={false} style={{ width: '100%' }} min={0} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('sitf.common.batch.number').d('批次号')}
                    >
                      {getFieldDecorator('batchNum')(
                        <Input trim inputChinese={false} style={{ width: '100%' }} min={0} />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('hzero.common.date.creation.from').d('创建时间从')}
                    >
                      {getFieldDecorator('creationDateFrom')(
                        <DatePicker
                          disabledDate={this.disabledStartDate}
                          showTime
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
                      {getFieldDecorator('creationDateTo')(
                        <DatePicker
                          disabledDate={this.disabledEndDate}
                          showTime
                          format={getDateTimeFormat()}
                          placeholder=""
                          onChange={this.onEndChange}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {/* <Col span={8}>
                    <FormItem
                      {...formItemProps}
                      label={intl.get('entity.interface.name').d('接口名称')}
                    >
                      {getFieldDecorator('interfaceName')(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col> */}
                </Row>
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
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={() => this.queryValue()}
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
