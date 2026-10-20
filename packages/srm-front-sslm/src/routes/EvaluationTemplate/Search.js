/**
 * Search - 我发出的订单 - 明细页面表格
 * @date: 2019-01-21
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const FormItem = Form.Item;
// const {Option} = Select;

@formatterCollections({ code: ['spfm.evaluationTemplate'] })
@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onClick', 'onReset'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * onClick - 查询按钮事件
   */
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  onReset() {
    const {
      form: { resetFields = e => e },
      clearParamsCache = e => e,
    } = this.props;
    resetFields();
    clearParamsCache();
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
      paramsCache: { evalTplCode, evalTplName, evalTplType },
      kpiEvalTplTypeCode,
    } = this.props;
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
      style: {
        width: '100%',
      },
    };
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('spfm.evaluationTemplate.model.evaluationTemplate.evalTplCode')
                    .d('评分模板编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('evalTplCode', {
                    initialValue: evalTplCode,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('spfm.evaluationTemplate.model.evaluationTemplate.evalTplName')
                    .d('评分模板名称')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('evalTplName', {
                    initialValue: evalTplName,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('spfm.evaluationTemplate.model.evaluationTemplate.evalTplType')
                    .d('模版类型')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('evalTplType', {
                    initialValue: evalTplType,
                  })(
                    <Select allowClear>
                      {kpiEvalTplTypeCode &&
                        kpiEvalTplTypeCode.map(item => (
                          <Select.Option key={item.meaning} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.onReset} style={{ marginLeft: 12 }}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.onClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
