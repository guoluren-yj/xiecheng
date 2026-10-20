/**
 * QueryForm - 查询
 * @date: 2019-5-17
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Button } from 'hzero-ui';

const promptCode = 'ssrc.evaluation';
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class QueryForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * handleReset - 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  /**
   * handleSerch - 查询
   */
  @Bind()
  handleSerch() {
    const { validateFields } = this.props.form;
    const { handleSearch } = this.props;
    validateFields(error => {
      if (isEmpty(error)) {
        handleSearch();
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.view.evaluation.evalMethodCode`).d('评标方法编码')}
                >
                  {getFieldDecorator('evalMethodCode')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.view.evaluation.evalMethodName`).d('评标方法名称')}
                >
                  {getFieldDecorator('evalMethodName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8} className="search-btn-more">
                <FormItem>
                  <Button onClick={this.handleReset} style={{ marginLeft: 12 }}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.handleSerch}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}
