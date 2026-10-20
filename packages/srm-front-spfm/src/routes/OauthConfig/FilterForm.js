/**
 * EcAcquirerAddress -收单地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/small/ec-acquirer-address' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcAcquirerAddressList() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
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
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get('entity.tenant.name').d('租户名称')} {...formLayout}>
              {getFieldDecorator('tenantName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('spfm.oauthConfig.model.encryptMethod').d('加密方式')}
              {...formLayout}
            >
              {getFieldDecorator('encryptMethod')(
                <Select allowClear style={{ width: '100%' }}>
                  <Option key="CUSTOMIZE" value="CUSTOMIZE">
                    {intl.get('hzero.common.custom').d('自定义')}
                  </Option>
                  <Option key="RSA" value="RSA">
                    {intl.get('spfm.oauthConfig.model.rsa').d('RSA')}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('spfm.oauthConfig.model.enabled').d('是否启用')}
              {...formLayout}
            >
              {getFieldDecorator('enabledFlg')(
                <Select allowClear style={{ width: '100%' }}>
                  <Option key="1" value={1}>
                    {intl.get('hzero.common.yes').d('是')}
                  </Option>
                  <Option key="0" value={0}>
                    {intl.get('hzero.common.no').d('否')}
                  </Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button style={{ marginRight: 8 }} onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchEcAcquirerAddressList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
