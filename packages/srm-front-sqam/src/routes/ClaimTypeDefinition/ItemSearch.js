/**
 * index - 索赔单类型 - 列表页
 * @date: 2019-11-05
 * @author: wuting <ting.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { isFunction } from 'lodash';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Row, Col, Input, Button } from 'hzero-ui';

import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class SearchForm extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  componentDidMount() {
    const { pagination } = this.props;
    this.onFetchList(pagination); // 查询数据
  }

  @Bind()
  onFetchList() {
    const { onFetchList } = this.props;
    if (isFunction(onFetchList)) {
      onFetchList();
    }
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={12}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sqam.common.model.claimItemCode`).d('索赔项目编码')}
                >
                  {getFieldDecorator('claimItemNum')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sqam.common.model.claimItemDesc`).d('索赔项目描述')}
                >
                  {getFieldDecorator('ClaimItemDesc')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.onFetchList}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
