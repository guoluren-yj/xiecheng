/**
 * Drawer -商城资源
 * @date: 2019-11-20
 * @author lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/small/mall-resource' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchCompanyList() {
    const { form, fetchCompanyList } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        fetchCompanyList({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form>
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get(`small.common.view.groupName`).d('集团名称')} {...formLayout}>
              {getFieldDecorator('groupName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`small.mallResource.view.webUrl`).d('二级页面域名')}
              {...formLayout}
            >
              {getFieldDecorator('webUrl')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`small.mallResource.view.SRMUrl`).d('SRM域名')}
              {...formLayout}
            >
              {getFieldDecorator('srmUrl')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={this.fetchCompanyList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
