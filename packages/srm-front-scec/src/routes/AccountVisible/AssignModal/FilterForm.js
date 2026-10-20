/**
 * AccountVisible - 账号目录可见配置 - 分配设置查询表单
 * @date: 2019-12-13
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Row, Col, Button } from 'hzero-ui';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      onHandleSearch,
    } = this.props;
    const { display } = this.state;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="账号">{getFieldDecorator('account')(<Input />)}</Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="状态">{getFieldDecorator('account')(<Input />)}</Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.collected`).d('收起查询')}
                </Button>
                <Button onClick={this.handlerFormReset} style={{ marginLeft: '8px' }}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => onHandleSearch()}
                  style={{ marginLeft: '8px' }}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
            <Col span={8}>
              <Form.Item label="名称">{getFieldDecorator('name')(<Input />)}</Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
