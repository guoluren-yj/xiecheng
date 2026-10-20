/**
 * QueryForm - 专家信息维护和查询 - 查询表单
 * @date: 2019-01-21
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'ssrc.expert.model.expert';
/**
 * 表单布局属性
 */
const formItemProps = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};

/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/ssrc/query' })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * 查询数据
   */
  @Bind()
  queryData() {
    const { onQueryExpert } = this.props;
    if (onQueryExpert) {
      onQueryExpert();
    }
  }

  /**
   * 重置查询表单.
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询结构
   * @returns
   */
  render() {
    const { form, expertTypeList = [], expertCategoryList = [], enabledStatus = [], remote, } = this.props;
    const { getFieldDecorator } = form;
    const { expandForm } = this.state;
    // cdp-104985 协鑫埋点
    const { handleQueryBar = undefined } = remote?.props?.process || {};
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          {isFunction(handleQueryBar) ? handleQueryBar({getFieldDecorator, expandForm, formItemProps}, {...this.props}) :
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get(`${promptCode}.expertsName`).d('专家姓名')}
                  >
                    {getFieldDecorator('expertName')(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get(`${promptCode}.expertType`).d('专家类型')}
                  >
                    {getFieldDecorator('expertType')(
                      <Select allowClear style={{ width: '100%' }}>
                        {expertTypeList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get(`${promptCode}.expertCategory`).d('专家类别')}
                  >
                    {getFieldDecorator('expertCategory')(
                      <Select allowClear style={{ width: '100%' }}>
                        {expertCategoryList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: expandForm ? 'block' : 'none' }}>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get(`${promptCode}.subAccount`).d('子账户')}
                  >
                    {getFieldDecorator('loginName')(<Input style={{ width: '100%' }} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemProps}
                    label={intl.get(`${promptCode}.enabledStatus`).d('启用状态')}
                  >
                    {getFieldDecorator('enabledFlag')(
                      <Select allowClear style={{ width: '100%' }}>
                        {enabledStatus.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
          }
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={() => this.queryData()} htmlType="submit">
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
