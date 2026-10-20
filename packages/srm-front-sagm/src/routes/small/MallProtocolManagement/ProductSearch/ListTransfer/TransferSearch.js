/**
 * TransferSearch - 服务接口配置查询
 * @date: 2019-07-04
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Row, Col, Input, Button } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
export default class TransferSearch extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   * query - 查询按钮事件
   */
  @Bind()
  query() {
    const { onSearch } = this.props;
    if (isFunction(onSearch)) {
      onSearch();
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
      tenantId,
    } = this.props;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={8}>
            <Form.Item {...formItemLayout} label={intl.get('small.common.model.product').d('商品')}>
              {getFieldDecorator('skuName')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('small.common.model.platformCategory').d('平台分类')}
            >
              {getFieldDecorator('categoryId')(
                <Lov
                  code="SMPC.CATEGORY"
                  isDbc2Sbc={false}
                  queryParams={{
                    tenantId,
                  }}
                />
              )}
            </Form.Item>
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              <Button style={{ marginRight: '8px' }} data-code="reset" onClick={this.onReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button data-code="search" type="primary" htmlType="submit" onClick={this.query}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
