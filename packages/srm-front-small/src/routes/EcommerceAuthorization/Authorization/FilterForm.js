/**
 *EcommerceAuthorization -电商授权 查询页面
 * @date: 2019-12-03
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterFrom extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 重置
   */
  @Bind()
  handlerFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      queryAuthorizateList,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <React.Fragment>
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={6}>
                <Form.Item label={intl.get('small.common.model.tenant').d('租户')} {...formlayout}>
                  {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get('small.common.model.attributeName').d('电商简码')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button data-code="reset" onClick={this.handlerFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={queryAuthorizateList}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </React.Fragment>
      </div>
    );
  }
}
